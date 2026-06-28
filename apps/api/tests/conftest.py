# pyright: reportMissingImports=false

# Stdlib
from collections.abc import AsyncGenerator, Awaitable, Callable
from datetime import datetime
import os
from typing import Any

# Third-party
from httpx import ASGITransport, AsyncClient
import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

# Local
from models import Category, ContactRequest, Player, PlayerCategory, PlayerMedia, User
from models.base import Base

TEST_DATABASE_ENV_VAR = "TEST_DATABASE_URL"
PLAYER_MEDIA_TYPES = ("image", "institutional_picture", "video")
_EXTERNAL_RUNTIME_DATABASE_URL = os.environ.get("DATABASE_URL")
_DUMMY_DATABASE_URL = "postgresql+asyncpg://test:test@localhost:5432/test"
_ASYNC_DRIVERNAME = "postgresql+asyncpg"


def pytest_configure(config: pytest.Config) -> None:
    database_url = os.environ.get(TEST_DATABASE_ENV_VAR)
    if database_url:
        normalized_url, _ = _normalize_test_database_url(database_url)
        os.environ["DATABASE_URL"] = normalized_url
        return

    os.environ.setdefault("DATABASE_URL", _DUMMY_DATABASE_URL)


def pytest_sessionfinish(session: pytest.Session, exitstatus: int) -> None:
    if exitstatus == pytest.ExitCode.NO_TESTS_COLLECTED:
        session.exitstatus = pytest.ExitCode.OK


def _test_database_url() -> str:
    value = os.environ.get(TEST_DATABASE_ENV_VAR)
    if value:
        return value

    pytest.skip(
        "Set TEST_DATABASE_URL to run API e2e tests. "
        "The test database must be separate from DATABASE_URL."
    )


def _normalize_test_database_url(database_url: str) -> tuple[str, dict[str, Any]]:
    url = make_url(database_url)
    if url.drivername == "postgresql":
        url = url.set(drivername=_ASYNC_DRIVERNAME)

    if url.drivername != _ASYNC_DRIVERNAME:
        pytest.fail(
            "API e2e tests require a postgresql:// or postgresql+asyncpg:// "
            "test database URL."
        )

    query = dict(url.query)
    connect_args: dict[str, Any] = {"statement_cache_size": 0}

    sslmode = query.pop("sslmode", None)
    if sslmode and str(sslmode).lower() not in {"disable", "allow", "prefer"}:
        connect_args["ssl"] = True

    ssl = query.pop("ssl", None)
    if ssl and str(ssl).lower() in {"1", "true", "yes", "require", "required"}:
        connect_args["ssl"] = True

    query.pop("channel_binding", None)
    url = url.set(query=query)

    return url.render_as_string(hide_password=False), connect_args


def _same_database_url(left: str, right: str) -> bool:
    left_url, _ = _normalize_test_database_url(left)
    right_url, _ = _normalize_test_database_url(right)

    def database_identity(database_url: str) -> tuple[str, str | None, str | None, str | None, int | None, str | None]:
        url = make_url(database_url)
        return (
            url.drivername,
            url.username,
            url.password,
            url.host,
            url.port,
            url.database,
        )

    return database_identity(left_url) == database_identity(right_url)


def _assert_safe_test_database(database_url: str) -> None:
    if not _EXTERNAL_RUNTIME_DATABASE_URL:
        return

    if _same_database_url(_EXTERNAL_RUNTIME_DATABASE_URL, database_url):
        pytest.fail(
            "Refusing to run e2e tests because the test database URL matches "
            "DATABASE_URL."
        )


async def _reset_schema(engine: AsyncEngine) -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.execute(text("DROP TYPE IF EXISTS player_media_types"))
        await connection.execute(
            text(
                "CREATE TYPE player_media_types AS ENUM "
                "('image', 'institutional_picture', 'video')"
            )
        )
        await connection.run_sync(Base.metadata.create_all)


async def _clear_database(engine: AsyncEngine) -> None:
    table_names = ", ".join(
        f'"{table.name}"' for table in reversed(Base.metadata.sorted_tables)
    )
    if not table_names:
        return

    async with engine.begin() as connection:
        await connection.execute(
            text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE")
        )


@pytest_asyncio.fixture(scope="session")
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    database_url = _test_database_url()
    _assert_safe_test_database(database_url)
    database_url, connect_args = _normalize_test_database_url(database_url)
    os.environ["DATABASE_URL"] = database_url

    engine = create_async_engine(
        database_url,
        connect_args=connect_args,
        poolclass=NullPool,
        future=True,
    )
    await _reset_schema(engine)

    try:
        yield engine
    finally:
        await _reset_schema(engine)
        await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    await _clear_database(test_engine)

    session_factory = async_sessionmaker(
        bind=test_engine,
        expire_on_commit=False,
        autoflush=False,
    )
    async with session_factory() as session:
        yield session

    await _clear_database(test_engine)


@pytest_asyncio.fixture
async def api_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    from core.db import get_db
    from main import app

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as client:
        yield client

    app.dependency_overrides.pop(get_db, None)


@pytest_asyncio.fixture
async def user_factory(
    db_session: AsyncSession,
) -> Callable[..., Awaitable[User]]:
    counter = 0

    async def create_user(
        *,
        email: str | None = None,
        password: str = "Password123!",
        name: str | None = None,
        role: str = "user",
    ) -> User:
        nonlocal counter
        counter += 1

        from core.security import hash_password

        user = User(
            email=(email or f"user{counter}@dtmones.dev").lower(),
            name=name or f"Test User {counter}",
            password_hash=hash_password(password),
            role=role,
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user

    return create_user


@pytest_asyncio.fixture
async def regular_user(user_factory: Callable[..., Awaitable[User]]) -> User:
    return await user_factory(role="user")


@pytest_asyncio.fixture
async def admin_user(user_factory: Callable[..., Awaitable[User]]) -> User:
    return await user_factory(role="admin")


@pytest.fixture
def access_token_factory() -> Callable[[User], str]:
    def create_token(user: User) -> str:
        from core.security import create_access_token

        token, _ = create_access_token(user.id, user.role)
        return token

    return create_token


@pytest.fixture
def auth_headers(
    access_token_factory: Callable[[User], str],
) -> Callable[[User | str], dict[str, str]]:
    def create_headers(user_or_token: User | str) -> dict[str, str]:
        token = (
            user_or_token
            if isinstance(user_or_token, str)
            else access_token_factory(user_or_token)
        )
        return {"Authorization": f"Bearer {token}"}

    return create_headers


@pytest_asyncio.fixture
async def category_factory(
    db_session: AsyncSession,
) -> Callable[..., Awaitable[Category]]:
    counter = 0

    async def create_category(
        *,
        name: str | None = None,
        created_at: datetime | None = None,
    ) -> Category:
        nonlocal counter
        counter += 1

        category = Category(name=name or f"Test Category {counter}")
        if created_at is not None:
            category.created_at = created_at
            category.updated_at = created_at

        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)
        return category

    return create_category


@pytest_asyncio.fixture
async def player_factory(
    db_session: AsyncSession,
) -> Callable[..., Awaitable[Player]]:
    counter = 0

    async def create_player(
        *,
        full_name: str | None = None,
        height: str = "1.80m",
        date_of_birth: str = "2000-01-01",
        nationality: str = "Argentina",
        last_club: str = "Test Club",
        created_at: datetime | None = None,
    ) -> Player:
        nonlocal counter
        counter += 1

        player = Player(
            full_name=full_name or f"Test Player {counter}",
            height=height,
            date_of_birth=date_of_birth,
            nationality=nationality,
            last_club=last_club,
        )
        if created_at is not None:
            player.created_at = created_at
            player.updated_at = created_at

        db_session.add(player)
        await db_session.commit()
        await db_session.refresh(player)
        return player

    return create_player


@pytest_asyncio.fixture
async def player_media_factory(
    db_session: AsyncSession,
) -> Callable[..., Awaitable[PlayerMedia]]:
    counter = 0

    async def create_player_media(
        player: Player,
        *,
        media_type: str = "image",
        url: str | None = None,
        created_at: datetime | None = None,
    ) -> PlayerMedia:
        nonlocal counter
        counter += 1

        player_media = PlayerMedia(
            player_id=player.id,
            media_type=media_type,
            url=url or f"https://cdn.dtmones.dev/player-media-{counter}.jpg",
        )
        if created_at is not None:
            player_media.created_at = created_at

        db_session.add(player_media)
        await db_session.commit()
        await db_session.refresh(player_media)
        return player_media

    return create_player_media


@pytest_asyncio.fixture
async def contact_request_factory(
    db_session: AsyncSession,
) -> Callable[..., Awaitable[ContactRequest]]:
    counter = 0

    async def create_contact_request(
        *,
        email: str | None = None,
        reason: str = "hire_services",
        message: str | None = None,
        created_at: datetime | None = None,
    ) -> ContactRequest:
        nonlocal counter
        counter += 1

        contact_request = ContactRequest(
            email=email or f"contact{counter}@dtmones.dev",
            reason=reason,
            message=message or f"Test contact request {counter}",
        )
        if created_at is not None:
            contact_request.created_at = created_at

        db_session.add(contact_request)
        await db_session.commit()
        await db_session.refresh(contact_request)
        return contact_request

    return create_contact_request


@pytest_asyncio.fixture
async def player_category_factory(
    db_session: AsyncSession,
) -> Callable[[Player, Category], Awaitable[PlayerCategory]]:
    async def create_player_category(
        player: Player,
        category: Category,
    ) -> PlayerCategory:
        player_category = PlayerCategory(
            player_id=player.id,
            category_id=category.id,
        )

        db_session.add(player_category)
        await db_session.commit()
        return player_category

    return create_player_category
