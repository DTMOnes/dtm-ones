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
from models import Category, Player, PlayerCategory, User


async def test_list_categories_returns_newest_first_with_player_count(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
) -> None:
    older_category = await category_factory(
        name="Older Category",
        created_at=datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
    )
    newer_category = await category_factory(
        name="Newer Category",
        created_at=datetime(2026, 1, 2, 12, 0, 0, tzinfo=timezone.utc),
    )
    player = await player_factory()
    await player_category_factory(player, newer_category)

    response = await api_client.get("/categories")

    assert response.status_code == 200
    body = response.json()
    assert [category["id"] for category in body] == [
        str(newer_category.id),
        str(older_category.id),
    ]
    assert body[0]["name"] == "Newer Category"
    assert body[0]["player_count"] == 1
    assert body[1]["name"] == "Older Category"
    assert body[1]["player_count"] == 0


async def test_list_categories_filters_by_query(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
) -> None:
    matching_category = await category_factory(name="Goalkeepers")
    await category_factory(name="Defenders")

    response = await api_client.get("/categories", params={"q": "keeper"})

    assert response.status_code == 200
    body = response.json()
    assert [category["id"] for category in body] == [str(matching_category.id)]
    assert body[0]["name"] == "Goalkeepers"
    assert body[0]["player_count"] == 0


@pytest.mark.parametrize("query", ["", "x" * 51])
async def test_list_categories_rejects_invalid_query(
    api_client: AsyncClient,
    query: str,
) -> None:
    response = await api_client.get("/categories", params={"q": query})

    assert response.status_code == 422


async def test_get_category_returns_players(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
) -> None:
    category = await category_factory(name="Midfielders")
    player = await player_factory(full_name="Player One")
    await player_category_factory(player, category)

    response = await api_client.get(f"/categories/{category.id}")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(category.id)
    assert body["name"] == "Midfielders"
    assert body["created_at"]
    assert body["updated_at"]
    assert body["players"] == [
        {
            "id": str(player.id),
            "full_name": "Player One",
            "height": player.height,
            "date_of_birth": player.date_of_birth,
            "nationality": player.nationality,
            "last_club": player.last_club,
            "created_at": body["players"][0]["created_at"],
            "updated_at": body["players"][0]["updated_at"],
        }
    ]


async def test_get_category_returns_404_for_missing_category(
    api_client: AsyncClient,
) -> None:
    response = await api_client.get(f"/categories/{uuid.uuid4()}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Category not found."}


async def test_get_category_rejects_invalid_uuid(api_client: AsyncClient) -> None:
    response = await api_client.get("/categories/not-a-uuid")

    assert response.status_code == 422


async def test_create_category_requires_auth_and_persists_category(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.post(
        "/categories",
        json={"name": "Forwards"},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["name"] == "Forwards"
    assert body["created_at"]
    assert body["updated_at"]

    category = (
        await db_session.execute(
            select(Category).where(Category.id == uuid.UUID(body["id"]))
        )
    ).scalar_one()
    assert category.name == "Forwards"


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
    ],
)
async def test_create_category_rejects_missing_or_invalid_auth(
    api_client: AsyncClient,
    headers: dict[str, str],
) -> None:
    response = await api_client.post(
        "/categories",
        json={"name": "Forwards"},
        headers=headers,
    )

    assert response.status_code == 401


@pytest.mark.parametrize("name", ["", "x" * 101])
async def test_create_category_rejects_invalid_name(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    name: str,
) -> None:
    response = await api_client.post(
        "/categories",
        json={"name": name},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


async def test_update_category_requires_auth_and_persists_name(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
) -> None:
    category = await category_factory(name="Old Name")

    response = await api_client.patch(
        f"/categories/{category.id}",
        json={"name": "New Name"},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(category.id)
    assert body["name"] == "New Name"
    assert body["created_at"]
    assert body["updated_at"]

    updated_category = (
        await db_session.execute(select(Category).where(Category.id == category.id))
    ).scalar_one()
    assert updated_category.name == "New Name"


async def test_update_category_returns_404_for_missing_category(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.patch(
        f"/categories/{uuid.uuid4()}",
        json={"name": "New Name"},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Category not found."}


async def test_update_category_rejects_missing_auth(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
) -> None:
    category = await category_factory()

    response = await api_client.patch(
        f"/categories/{category.id}",
        json={"name": "New Name"},
    )

    assert response.status_code == 401


async def test_update_category_rejects_invalid_uuid(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.patch(
        "/categories/not-a-uuid",
        json={"name": "New Name"},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


@pytest.mark.parametrize("name", ["", "x" * 101])
async def test_update_category_rejects_invalid_name(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
    name: str,
) -> None:
    category = await category_factory()

    response = await api_client.patch(
        f"/categories/{category.id}",
        json={"name": name},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


async def test_delete_category_requires_auth_and_removes_category(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
) -> None:
    category = await category_factory()

    response = await api_client.delete(
        f"/categories/{category.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Category deleted successfully."}

    deleted_category = (
        await db_session.execute(select(Category).where(Category.id == category.id))
    ).scalar_one_or_none()
    assert deleted_category is None


async def test_delete_category_returns_404_for_missing_category(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        f"/categories/{uuid.uuid4()}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Category not found."}


async def test_delete_category_rejects_missing_auth(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
) -> None:
    category = await category_factory()

    response = await api_client.delete(f"/categories/{category.id}")

    assert response.status_code == 401


async def test_delete_category_rejects_invalid_uuid(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        "/categories/not-a-uuid",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


async def test_remove_player_from_category_requires_auth_and_removes_relation(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
) -> None:
    category = await category_factory()
    player = await player_factory()
    await player_category_factory(player, category)

    response = await api_client.delete(
        f"/categories/{category.id}/players/{player.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Player removed from the category."}

    relation = (
        await db_session.execute(
            select(PlayerCategory).where(
                PlayerCategory.category_id == category.id,
                PlayerCategory.player_id == player.id,
            )
        )
    ).scalar_one_or_none()
    assert relation is None


async def test_remove_player_from_category_returns_404_for_missing_relation(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    category = await category_factory()
    player = await player_factory()

    response = await api_client.delete(
        f"/categories/{category.id}/players/{player.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "The player does not belong to this category."}


async def test_remove_player_from_category_returns_404_for_missing_category(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    player = await player_factory()

    response = await api_client.delete(
        f"/categories/{uuid.uuid4()}/players/{player.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "The player does not belong to this category."}


async def test_remove_player_from_category_returns_404_for_missing_player(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
) -> None:
    category = await category_factory()

    response = await api_client.delete(
        f"/categories/{category.id}/players/{uuid.uuid4()}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "The player does not belong to this category."}


async def test_remove_player_from_category_returns_404_for_player_in_other_category(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
) -> None:
    category = await category_factory()
    other_category = await category_factory()
    player = await player_factory()
    await player_category_factory(player, other_category)

    response = await api_client.delete(
        f"/categories/{category.id}/players/{player.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "The player does not belong to this category."}


async def test_remove_player_from_category_rejects_missing_auth(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    category = await category_factory()
    player = await player_factory()

    response = await api_client.delete(f"/categories/{category.id}/players/{player.id}")

    assert response.status_code == 401


@pytest.mark.parametrize(
    ("category_id", "player_id"),
    [
        ("not-a-uuid", str(uuid.uuid4())),
        (str(uuid.uuid4()), "not-a-uuid"),
    ],
)
async def test_remove_player_from_category_rejects_invalid_uuid(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_id: str,
    player_id: str,
) -> None:
    response = await api_client.delete(
        f"/categories/{category_id}/players/{player_id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422
