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
from models import ContactRequest, User


def _valid_contact_request_payload(
    *,
    email: str = "player@example.com",
    reason: str = "hire_services",
    message: str = "I would like more information about your services.",
) -> dict[str, str]:
    return {
        "email": email,
        "reason": reason,
        "message": message,
    }


async def test_create_contact_request_is_public_and_persists_request(
    api_client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    response = await api_client.post(
        "/contact-requests",
        json=_valid_contact_request_payload(
            email="prospect@example.com",
            reason="seek_representation",
            message="Please contact me about player representation.",
        ),
    )

    assert response.status_code == 201
    assert response.json() == {"message": "Your message was sent successfully."}

    contact_request = (
        await db_session.execute(
            select(ContactRequest).where(ContactRequest.email == "prospect@example.com")
        )
    ).scalar_one()
    assert contact_request.email == "prospect@example.com"
    assert contact_request.reason == "seek_representation"
    assert contact_request.message == "Please contact me about player representation."
    assert contact_request.created_at is not None


@pytest.mark.parametrize(
    "payload",
    [
        _valid_contact_request_payload(email="not-an-email"),
        _valid_contact_request_payload(reason="other"),
        _valid_contact_request_payload(message=""),
        _valid_contact_request_payload(message="x" * 5001),
    ],
)
async def test_create_contact_request_rejects_invalid_payload(
    api_client: AsyncClient,
    payload: dict[str, str],
) -> None:
    response = await api_client.post("/contact-requests", json=payload)

    assert response.status_code == 422


async def test_list_contact_requests_requires_admin_and_returns_newest_first(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    contact_request_factory: Callable[..., Awaitable[ContactRequest]],
) -> None:
    older_request = await contact_request_factory(
        email="older@example.com",
        reason="hire_services",
        message="Older contact request",
        created_at=datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
    )
    newer_request = await contact_request_factory(
        email="newer@example.com",
        reason="seek_representation",
        message="Newer contact request",
        created_at=datetime(2026, 1, 2, 12, 0, 0, tzinfo=timezone.utc),
    )

    response = await api_client.get(
        "/contact-requests",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 200
    body = response.json()
    assert body == [
        {
            "id": str(newer_request.id),
            "email": "newer@example.com",
            "reason": "seek_representation",
            "message": "Newer contact request",
            "created_at": body[0]["created_at"],
        },
        {
            "id": str(older_request.id),
            "email": "older@example.com",
            "reason": "hire_services",
            "message": "Older contact request",
            "created_at": body[1]["created_at"],
        },
    ]
    assert body[0]["created_at"]
    assert body[1]["created_at"]


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
    ],
)
async def test_list_contact_requests_rejects_missing_or_invalid_admin_token(
    api_client: AsyncClient,
    headers: dict[str, str],
) -> None:
    response = await api_client.get("/contact-requests", headers=headers)

    assert response.status_code == 401


async def test_list_contact_requests_rejects_regular_users(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.get(
        "/contact-requests",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 403


async def test_delete_contact_request_requires_admin_and_removes_request(
    api_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    contact_request_factory: Callable[..., Awaitable[ContactRequest]],
) -> None:
    contact_request = await contact_request_factory()

    response = await api_client.delete(
        f"/contact-requests/{contact_request.id}",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Contact request deleted successfully."}

    deleted_request = (
        await db_session.execute(
            select(ContactRequest).where(ContactRequest.id == contact_request.id)
        )
    ).scalar_one_or_none()
    assert deleted_request is None


async def test_delete_contact_request_returns_404_for_missing_request(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        f"/contact-requests/{uuid.uuid4()}",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Contact request not found."}


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
    ],
)
async def test_delete_contact_request_rejects_missing_or_invalid_admin_token(
    api_client: AsyncClient,
    contact_request_factory: Callable[..., Awaitable[ContactRequest]],
    headers: dict[str, str],
) -> None:
    contact_request = await contact_request_factory()

    response = await api_client.delete(
        f"/contact-requests/{contact_request.id}",
        headers=headers,
    )

    assert response.status_code == 401


async def test_delete_contact_request_rejects_regular_users(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    contact_request_factory: Callable[..., Awaitable[ContactRequest]],
) -> None:
    contact_request = await contact_request_factory()

    response = await api_client.delete(
        f"/contact-requests/{contact_request.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 403


async def test_delete_contact_request_rejects_invalid_uuid(
    api_client: AsyncClient,
    admin_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        "/contact-requests/not-a-uuid",
        headers=auth_headers(admin_user),
    )

    assert response.status_code == 422
