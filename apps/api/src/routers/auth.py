# Third-party
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

# Local
from core.dependencies.auth import CurrentUser
from core.dependencies.db import DbSession
from core.security import (
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    refresh_token_expires_at,
    verify_password,
)
from models import RefreshToken, User
from schemas.auth import (
    LoginInput,
    LogoutInput,
    LogoutResponse,
    RefreshTokenInput,
    SessionUser,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _is_expired(expires_at) -> bool:
    # Database drivers may return naive datetimes for `timestamp without time zone`.
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at < now


async def _issue_tokens(db: DbSession, user: User) -> TokenResponse:
    access_token, expires_in = create_access_token(user.id, user.role)
    refresh_token = generate_refresh_token()
    db.add(
        RefreshToken(
            token_hash=hash_refresh_token(refresh_token),
            user_id=user.id,
            expires_at=refresh_token_expires_at(),
        )
    )
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=SessionUser.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginInput, db: DbSession) -> TokenResponse:
    user = (
        await db.execute(
            select(User).where(func.lower(User.email) == payload.email.lower())
        )
    ).scalar_one_or_none()

    if user is None or not verify_password(user.password_hash, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return await _issue_tokens(db, user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshTokenInput, db: DbSession) -> TokenResponse:
    token_hash = hash_refresh_token(payload.refresh_token)
    refresh_token = (
        await db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
    ).scalar_one_or_none()

    if (
        refresh_token is None
        or refresh_token.revoked_at is not None
        or _is_expired(refresh_token.expires_at)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = (
        await db.execute(select(User).where(User.id == refresh_token.user_id))
    ).scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from datetime import datetime, timezone

    refresh_token.revoked_at = datetime.now(timezone.utc)
    return await _issue_tokens(db, user)


@router.post("/logout", response_model=LogoutResponse)
async def logout(payload: LogoutInput, db: DbSession) -> LogoutResponse:
    token_hash = hash_refresh_token(payload.refresh_token)
    refresh_token = (
        await db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
    ).scalar_one_or_none()

    if refresh_token is not None and refresh_token.revoked_at is None:
        from datetime import datetime, timezone

        refresh_token.revoked_at = datetime.now(timezone.utc)
        await db.commit()

    return LogoutResponse(message="Signed out successfully.")


@router.get("/me", response_model=SessionUser)
async def me(user: CurrentUser) -> SessionUser:
    return SessionUser.model_validate(user)
