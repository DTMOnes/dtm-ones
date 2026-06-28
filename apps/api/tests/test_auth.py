# pyright: reportMissingImports=false

# Stdlib
from collections.abc import Awaitable, Callable

# Third-party
from httpx import AsyncClient
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Local
from core.security import hash_refresh_token
from models import RefreshToken, User


async def test_health_returns_ok(api_client: AsyncClient) -> None:
    response = await api_client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_login_returns_tokens_and_user(
    api_client: AsyncClient,
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    user = await user_factory(
        email="player@dtmones.dev",
        password="Password123!",
        name="Player One",
    )

    response = await api_client.post(
        "/auth/login",
        json={"email": "PLAYER@dtmones.dev", "password": "Password123!"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"
    assert body["expires_in"] > 0
    assert body["user"] == {
        "id": user.id,
        "email": "player@dtmones.dev",
        "name": "Player One",
        "role": "user",
        "created_at": body["user"]["created_at"],
        "updated_at": body["user"]["updated_at"],
    }


@pytest.mark.parametrize(
    ("payload", "expected_status"),
    [
        ({"email": "missing@dtmones.dev", "password": "Password123!"}, 401),
        ({"email": "not-an-email", "password": "Password123!"}, 422),
        ({"email": "player@dtmones.dev", "password": ""}, 422),
    ],
)
async def test_login_rejects_invalid_requests(
    api_client: AsyncClient,
    user_factory: Callable[..., Awaitable[User]],
    payload: dict[str, str],
    expected_status: int,
) -> None:
    await user_factory(email="player@dtmones.dev", password="Password123!")

    response = await api_client.post("/auth/login", json=payload)

    assert response.status_code == expected_status


async def test_refresh_rotates_refresh_token(
    api_client: AsyncClient,
    db_session: AsyncSession,
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    await user_factory(email="player@dtmones.dev", password="Password123!")
    login_response = await api_client.post(
        "/auth/login",
        json={"email": "player@dtmones.dev", "password": "Password123!"},
    )
    old_refresh_token = login_response.json()["refresh_token"]

    response = await api_client.post(
        "/auth/refresh",
        json={"refresh_token": old_refresh_token},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["refresh_token"] != old_refresh_token

    old_token = (
        await db_session.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == hash_refresh_token(old_refresh_token)
            )
        )
    ).scalar_one()
    assert old_token.revoked_at is not None


@pytest.mark.parametrize(
    ("payload", "expected_status"),
    [
        ({"refresh_token": "unknown-refresh-token"}, 401),
        ({"refresh_token": ""}, 422),
    ],
)
async def test_refresh_rejects_invalid_requests(
    api_client: AsyncClient,
    payload: dict[str, str],
    expected_status: int,
) -> None:
    response = await api_client.post("/auth/refresh", json=payload)

    assert response.status_code == expected_status


async def test_refresh_rejects_reused_refresh_token(
    api_client: AsyncClient,
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    await user_factory(email="player@dtmones.dev", password="Password123!")
    login_response = await api_client.post(
        "/auth/login",
        json={"email": "player@dtmones.dev", "password": "Password123!"},
    )
    refresh_token = login_response.json()["refresh_token"]
    first_refresh = await api_client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )

    response = await api_client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )

    assert first_refresh.status_code == 200
    assert response.status_code == 401


async def test_logout_revokes_refresh_token(
    api_client: AsyncClient,
    db_session: AsyncSession,
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    await user_factory(email="player@dtmones.dev", password="Password123!")
    login_response = await api_client.post(
        "/auth/login",
        json={"email": "player@dtmones.dev", "password": "Password123!"},
    )
    refresh_token = login_response.json()["refresh_token"]

    response = await api_client.post(
        "/auth/logout",
        json={"refresh_token": refresh_token},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Signed out successfully."}

    stored_token = (
        await db_session.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == hash_refresh_token(refresh_token)
            )
        )
    ).scalar_one()
    assert stored_token.revoked_at is not None


async def test_logout_unknown_token_is_success(api_client: AsyncClient) -> None:
    response = await api_client.post(
        "/auth/logout",
        json={"refresh_token": "unknown-refresh-token"},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Signed out successfully."}


async def test_me_returns_current_user(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.get(
        "/auth/me",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == regular_user.id
    assert body["email"] == regular_user.email
    assert body["name"] == regular_user.name
    assert body["role"] == "user"


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
    ],
)
async def test_me_rejects_missing_or_invalid_access_token(
    api_client: AsyncClient,
    headers: dict[str, str],
) -> None:
    response = await api_client.get("/auth/me", headers=headers)

    assert response.status_code == 401


async def test_me_rejects_refresh_token(
    api_client: AsyncClient,
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    await user_factory(email="player@dtmones.dev", password="Password123!")
    login_response = await api_client.post(
        "/auth/login",
        json={"email": "player@dtmones.dev", "password": "Password123!"},
    )

    response = await api_client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {login_response.json()['refresh_token']}"},
    )

    assert response.status_code == 401

