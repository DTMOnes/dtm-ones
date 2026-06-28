# Stdlib
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

# Third-party
import jwt
from pwdlib import PasswordHash

# Local
from core.env import settings

_password_hash = PasswordHash.recommended()
_REFRESH_TOKEN_BYTES = 48


def generate_id() -> str:
    return str(uuid4())


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(stored_hash: str, password: str) -> bool:
    if not stored_hash:
        return False

    try:
        return _password_hash.verify(password, stored_hash)
    except Exception:
        return False


def create_access_token(user_id: str, role: str) -> tuple[str, int]:
    expires_delta = timedelta(minutes=settings.AUTH_ACCESS_TOKEN_EXPIRE_MINUTES)
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta
    payload: dict[str, Any] = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(
        payload,
        settings.auth_secret_key,
        algorithm=settings.AUTH_ALGORITHM,
    )
    return token, int(expires_delta.total_seconds())


def decode_access_token(token: str) -> dict[str, Any]:
    payload = jwt.decode(
        token,
        settings.auth_secret_key,
        algorithms=[settings.AUTH_ALGORITHM],
    )
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Invalid token type.")
    return payload


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(_REFRESH_TOKEN_BYTES)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def refresh_token_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        days=settings.AUTH_REFRESH_TOKEN_EXPIRE_DAYS
    )
