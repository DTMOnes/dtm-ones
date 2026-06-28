# Stdlib
from collections.abc import AsyncGenerator

# Third-party
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Local
from core.env import settings

engine = create_async_engine(
    settings.sqlalchemy_database_url,
    connect_args=settings.sqlalchemy_connect_args,
)

SessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
