# pyright: reportMissingImports=false

# Stdlib
from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
import uuid

# Third-party
from httpx import AsyncClient
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Local
from models import User


def _valid_user_payload(
    *,
    email: str = "new.user@dtmones.dev",
    password: str = "Password123!",
    name: str = "New User",
    role: str = "user",
) -> dict[str, str]:
    return {
        "email": email,
        "password": password,
        "name": name,
        "role": role,
    }


async def _set_user_created_at(
    db_session: AsyncSession,
    user: User,
    created_at: datetime,
) -> None:
    user.created_at = created_at
    user.updated_at = created_at
    await db_session.commit()
    await db_session.refresh(user)


@pytest.mark.parametrize(
    ("method", "path", "json"),
    [
        ("GET", "/users", None),
        ("GET", f"/users/{uuid.uuid4()}", None),
        ("POST", "/users", _valid_user_payload()),
        ("PATCH", f"/users/{uuid.uuid4()}", {"name": "Updated", "email": "updated@dtmones.dev"}),
        (
            "PATCH",
            f"/users/{uuid.uuid4()}/password",
            {"password": "NewPassword123!", "confirm_password": "NewPassword123!"},
        ),
        ("PATCH", f"/users/{uuid.uuid4()}/role", {"role": "admin"}),
        ("DELETE", f"/users/{uuid.uuid4()}", None),
    ],
)
@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
    ],
)
async def test_user_endpoints_reject_missing_or_invalid_admin_token(
    api_client: AsyncClient,
    method: str,
    path: str,
    json: dict[str, str] | None,
    headers: dict[str, str],
) -> None:
    response = await api_client.request(method, path, json=json, headers=headers)

    assert response.status_code == 401


@pytest.mark.parametrize(
    ("method", "path", "json"),
    [
        ("GET", "/users", None),
        ("GET", f"/users/{uuid.uuid4()}", None),
        ("POST", "/users", _valid_user_payload()),
        ("PATCH", f"/users/{uuid.uuid4()}", {"name": "Updated", "email": "updated@dtmones.dev"}),
        (
            "PATCH",
            f"/users/{uuid.uuid4()}/password",
            {"password": "NewPassword123!", "confirm_password": "NewPassword123!"},
        ),
        ("PATCH", f"/users/{uuid.uuid4()}/role", {"role": "admin"}),
        ("DELETE", f"/users/{uuid.uuid4()}", None),
    ],
)
async def test_user_endpoints_reject_regular_users(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    method: str,
    path: str,
    json: dict[str, str] | None,
) -> None:
    response = await api_client.request(
        method,
        path,
        json=json,
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 403


async def test_list_users_returns_newest_first(
    api_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    older_user = await user_factory(
        email="older@dtmones.dev",
        name="Older User",
        role="user",
    )
    newer_user = await user_factory(
        email="newer@dtmones.dev",
        name="Newer User",
        role="admin",
    )
    await _set_user_created_at(
        db_session,
        admin_user,
        datetime(2025, 12, 31, 12, 0, 0, tzinfo=timezone.utc),
    )
    await _set_user_created_at(
        db_session,
        older_user,
        datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
    )
    await _set_user_created_at(
        db_session,
        newer_user,
        datetime(2026, 1, 2, 12, 0, 0, tzinfo=timezone.utc),
    )

    response = await api_client.get("/users", headers=auth_headers(admin_user))

    assert response.status_code == 200
    body = response.json()
    assert [user["id"] for user in body] == [
        newer_user.id,
        older_user.id,
        admin_user.id,
    ]
    assert body[0]["email"] == "newer@dtmones.dev"
    assert body[0]["name"] == "Newer User"
    assert body[0]["role"] == "admin"
    assert body[1]["email"] == "older@dtmones.dev"
    assert body[1]["name"] == "Older User"
    assert body[1]["role"] == "user"


async def test_get_user_returns_detail_with_admin_metadata(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.get(
        f"/users/{admin_user.id}",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "id": admin_user.id,
        "email": admin_user.email,
        "name": admin_user.name,
        "role": "admin",
        "created_at": body["created_at"],
        "updated_at": body["updated_at"],
        "admin_count": 1,
        "is_only_admin": True,
    }


async def test_get_user_returns_404_for_missing_user(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.get(
        f"/users/{uuid.uuid4()}",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "User not found."}


async def test_create_user_persists_user_and_normalizes_email(
    api_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.post(
        "/users",
        json=_valid_user_payload(
            email="CREATED.USER@dtmones.dev",
            name="Created User",
            role="admin",
        ),
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body == {
        "id": body["id"],
        "email": "created.user@dtmones.dev",
        "name": "Created User",
        "role": "admin",
        "created_at": body["created_at"],
        "updated_at": body["updated_at"],
    }

    created_user = (
        await db_session.execute(select(User).where(User.id == body["id"]))
    ).scalar_one()
    assert created_user.email == "created.user@dtmones.dev"
    assert created_user.name == "Created User"
    assert created_user.role == "admin"


async def test_create_user_rejects_duplicate_email_case_insensitive(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    await user_factory(email="existing@dtmones.dev")

    response = await api_client.post(
        "/users",
        json=_valid_user_payload(email="EXISTING@dtmones.dev"),
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "A user with this email already exists."}


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("email", "not-an-email"),
        ("password", "short"),
        ("name", ""),
        ("role", "owner"),
    ],
)
async def test_create_user_rejects_invalid_payload(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    field: str,
    value: str,
) -> None:
    payload = _valid_user_payload()
    payload[field] = value

    response = await api_client.post(
        "/users",
        json=payload,
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 422


async def test_update_user_persists_general_fields_and_normalizes_email(
    api_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    user = await user_factory(email="old.email@dtmones.dev", name="Old Name")

    response = await api_client.patch(
        f"/users/{user.id}",
        json={"name": "New Name", "email": "NEW.EMAIL@dtmones.dev"},
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "id": user.id,
        "email": "new.email@dtmones.dev",
        "name": "New Name",
        "role": "user",
        "created_at": body["created_at"],
        "updated_at": body["updated_at"],
    }

    updated_user = (
        await db_session.execute(select(User).where(User.id == user.id))
    ).scalar_one()
    assert updated_user.email == "new.email@dtmones.dev"
    assert updated_user.name == "New Name"


async def test_update_user_returns_404_for_missing_user(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.patch(
        f"/users/{uuid.uuid4()}",
        json={"name": "New Name", "email": "new.email@dtmones.dev"},
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "User not found."}


async def test_update_user_rejects_duplicate_email(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    await user_factory(email="taken@dtmones.dev")
    user = await user_factory(email="available@dtmones.dev")

    response = await api_client.patch(
        f"/users/{user.id}",
        json={"name": "Available User", "email": "TAKEN@dtmones.dev"},
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "A user with this email already exists."}


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("email", "not-an-email"),
        ("name", ""),
    ],
)
async def test_update_user_rejects_invalid_payload(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
    field: str,
    value: str,
) -> None:
    user = await user_factory()
    payload = {"name": "Valid Name", "email": "valid@dtmones.dev"}
    payload[field] = value

    response = await api_client.patch(
        f"/users/{user.id}",
        json=payload,
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 422


async def test_change_user_password_allows_login_with_new_password(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    user = await user_factory(
        email="password.user@dtmones.dev",
        password="OldPassword123!",
    )

    response = await api_client.patch(
        f"/users/{user.id}/password",
        json={
            "password": "NewPassword123!",
            "confirm_password": "NewPassword123!",
        },
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Password updated successfully."}

    login_response = await api_client.post(
        "/auth/login",
        json={"email": "password.user@dtmones.dev", "password": "NewPassword123!"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["user"]["id"] == user.id


async def test_change_user_password_returns_404_for_missing_user(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.patch(
        f"/users/{uuid.uuid4()}/password",
        json={
            "password": "NewPassword123!",
            "confirm_password": "NewPassword123!",
        },
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "User not found."}


@pytest.mark.parametrize(
    "payload",
    [
        {"password": "short", "confirm_password": "short"},
        {"password": "NewPassword123!", "confirm_password": "OtherPassword123!"},
    ],
)
async def test_change_user_password_rejects_invalid_payload(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
    payload: dict[str, str],
) -> None:
    user = await user_factory()

    response = await api_client.patch(
        f"/users/{user.id}/password",
        json=payload,
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 422


async def test_set_user_role_persists_role_changes(
    api_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    user = await user_factory(role="user")

    promote_response = await api_client.patch(
        f"/users/{user.id}/role",
        json={"role": "admin"},
        headers=auth_headers(admin_user),
    )

    assert promote_response.status_code == 200
    assert promote_response.json() == {"message": "Role updated successfully."}
    promoted_user = (
        await db_session.execute(select(User).where(User.id == user.id))
    ).scalar_one()
    assert promoted_user.role == "admin"

    demote_response = await api_client.patch(
        f"/users/{user.id}/role",
        json={"role": "user"},
        headers=auth_headers(admin_user),
    )

    assert demote_response.status_code == 200
    assert demote_response.json() == {"message": "Role updated successfully."}
    demoted_user = (
        await db_session.execute(select(User).where(User.id == user.id))
    ).scalar_one()
    assert demoted_user.role == "user"


async def test_set_user_role_rejects_demoting_only_admin(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.patch(
        f"/users/{admin_user.id}/role",
        json={"role": "user"},
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": (
            "Cannot remove administrator role from the only admin. Promote another "
            "user or create a new administrator first."
        )
    }


async def test_set_user_role_returns_404_for_missing_user(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.patch(
        f"/users/{uuid.uuid4()}/role",
        json={"role": "admin"},
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "User not found."}


async def test_set_user_role_rejects_invalid_role(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    user = await user_factory()

    response = await api_client.patch(
        f"/users/{user.id}/role",
        json={"role": "owner"},
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 422


async def test_delete_user_removes_other_user(
    api_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    user = await user_factory()

    response = await api_client.delete(
        f"/users/{user.id}",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "User deleted successfully."}

    deleted_user = (
        await db_session.execute(select(User).where(User.id == user.id))
    ).scalar_one_or_none()
    assert deleted_user is None


async def test_delete_user_rejects_deleting_only_admin(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        f"/users/{admin_user.id}",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": (
            "Cannot delete the only administrator. Promote another user or create "
            "a new administrator first."
        )
    }


async def test_delete_user_rejects_self_delete(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    user_factory: Callable[..., Awaitable[User]],
) -> None:
    await user_factory(role="admin")

    response = await api_client.delete(
        f"/users/{admin_user.id}",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "You cannot delete your own account."}


async def test_delete_user_returns_404_for_missing_user(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        f"/users/{uuid.uuid4()}",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "User not found."}
