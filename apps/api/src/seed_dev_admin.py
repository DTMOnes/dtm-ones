# Stdlib
import asyncio
from datetime import datetime, timezone

# Third-party
from sqlalchemy import func, select

# Local
from core.env import settings
from core.db import SessionLocal, engine
from core.security import hash_password
from models import User


def _required_setting(value: str | None, name: str) -> str:
    if value is None or not value.strip():
        raise RuntimeError(f"{name} must be set before running the dev admin seed.")
    return value.strip()


async def seed_dev_admin() -> None:
    email = _required_setting(
        settings.DEV_SEED_ADMIN_EMAIL, "DEV_SEED_ADMIN_EMAIL"
    ).lower()
    password = _required_setting(
        settings.DEV_SEED_ADMIN_PASSWORD, "DEV_SEED_ADMIN_PASSWORD"
    )
    name = settings.DEV_SEED_ADMIN_NAME.strip() or "Admin"
    now = datetime.now(timezone.utc)

    async with SessionLocal() as db:
        existing_user = (
            await db.execute(
                select(User).where(func.lower(User.email) == email.lower())
            )
        ).scalar_one_or_none()

        if existing_user is None:
            db.add(
                User(
                    name=name,
                    email=email,
                    password_hash=hash_password(password),
                    role="admin",
                    created_at=now,
                    updated_at=now,
                )
            )
            action = "Created"
        else:
            existing_user.name = name
            existing_user.password_hash = hash_password(password)
            existing_user.role = "admin"
            existing_user.updated_at = now
            action = "Updated"

        await db.commit()

    await engine.dispose()
    print(f"{action} development admin user: {email}")


def main() -> None:
    asyncio.run(seed_dev_admin())


if __name__ == "__main__":
    main()
