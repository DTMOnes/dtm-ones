# Stdlib
from datetime import datetime, timezone

# Third-party
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import desc, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

# Local
from core.dependencies.auth import AdminUser
from core.dependencies.db import DbSession
from core.security import hash_password
from models import (
    SuccessMessageResponse,
    User,
    UserCreate,
    UserDetail,
    UserPasswordChange,
    UserRead,
    UserRoleUpdate,
    UserUpdate,
)

router = APIRouter(prefix="/users", tags=["users"])


async def _count_admins(db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count()).select_from(User).where(User.role == "admin")
    )
    return result.scalar_one()


def _is_only_admin(user: User, admin_count: int) -> bool:
    return user.role == "admin" and admin_count == 1


async def _get_user_or_404(db: AsyncSession, user_id: str) -> User:
    user = (
        await db.execute(select(User).where(User.id == user_id))
    ).scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    return user


@router.get("", response_model=list[UserRead])
async def list_users(db: DbSession, _: AdminUser) -> list[UserRead]:
    users = (
        (await db.execute(select(User).order_by(desc(User.created_at)))).scalars().all()
    )
    return [UserRead.model_validate(user) for user in users]


@router.get("/{user_id}", response_model=UserDetail)
async def get_user(user_id: str, db: DbSession, _: AdminUser) -> UserDetail:
    user = await _get_user_or_404(db, user_id)
    admin_count = await _count_admins(db)
    return UserDetail(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        created_at=user.created_at,
        updated_at=user.updated_at,
        admin_count=admin_count,
        is_only_admin=_is_only_admin(user, admin_count),
    )


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate, db: DbSession, _: AdminUser
) -> UserRead:
    existing = (
        await db.execute(
            select(User).where(func.lower(User.email) == payload.email.lower())
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    now = datetime.now(timezone.utc)
    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        created_at=now,
        updated_at=now,
    )
    db.add(user)

    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from error

    await db.refresh(user)
    return UserRead.model_validate(user)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user_general(
    user_id: str,
    payload: UserUpdate,
    db: DbSession,
    _: AdminUser,
) -> UserRead:
    user = await _get_user_or_404(db, user_id)
    user.name = payload.name
    user.email = payload.email.lower()
    user.updated_at = datetime.now(timezone.utc)

    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from error

    await db.refresh(user)
    return UserRead.model_validate(user)


@router.patch("/{user_id}/password", response_model=SuccessMessageResponse)
async def change_user_password(
    user_id: str,
    payload: UserPasswordChange,
    db: DbSession,
    _: AdminUser,
) -> SuccessMessageResponse:
    user = await _get_user_or_404(db, user_id)
    user.password_hash = hash_password(payload.password)
    user.updated_at = datetime.now(timezone.utc)

    await db.commit()
    return SuccessMessageResponse(message="Password updated successfully.")


@router.patch("/{user_id}/role", response_model=SuccessMessageResponse)
async def set_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    db: DbSession,
    _: AdminUser,
) -> SuccessMessageResponse:
    user = await _get_user_or_404(db, user_id)
    admin_count = await _count_admins(db)

    if _is_only_admin(user, admin_count) and payload.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Cannot remove administrator role from the only admin. Promote "
                "another user or create a new administrator first."
            ),
        )

    user.role = payload.role
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return SuccessMessageResponse(message="Role updated successfully.")


@router.delete("/{user_id}", response_model=SuccessMessageResponse)
async def delete_user(
    user_id: str, db: DbSession, admin: AdminUser
) -> SuccessMessageResponse:
    user = await _get_user_or_404(db, user_id)
    admin_count = await _count_admins(db)

    if _is_only_admin(user, admin_count):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Cannot delete the only administrator. Promote another user or "
                "create a new administrator first."
            ),
        )

    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    await db.delete(user)
    await db.commit()
    return SuccessMessageResponse(message="User deleted successfully.")
