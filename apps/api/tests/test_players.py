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
from models import Category, Player, PlayerCategory, PlayerMedia, User
from services import blob


def _valid_player_payload(
    *,
    full_name: str = "Lionel Messi",
    height: str = "1.70m",
    date_of_birth: str = "1987-06-24",
    nationality: str = "Argentina",
    last_club: str = "Inter Miami",
    category_ids: list[str] | None = None,
) -> dict[str, object]:
    return {
        "full_name": full_name,
        "height": height,
        "date_of_birth": date_of_birth,
        "nationality": nationality,
        "last_club": last_club,
        "category_ids": category_ids or [],
    }


async def test_list_players_returns_newest_first_with_categories_and_media(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
    player_media_factory: Callable[..., Awaitable[PlayerMedia]],
) -> None:
    category = await category_factory(name="Forwards")
    older_player = await player_factory(
        full_name="Older Player",
        created_at=datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
    )
    newer_player = await player_factory(
        full_name="Newer Player",
        created_at=datetime(2026, 1, 2, 12, 0, 0, tzinfo=timezone.utc),
    )
    await player_category_factory(newer_player, category)
    media = await player_media_factory(
        newer_player,
        media_type="video",
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    )

    response = await api_client.get("/players")

    assert response.status_code == 200
    body = response.json()
    assert [player["id"] for player in body] == [
        str(newer_player.id),
        str(older_player.id),
    ]
    assert body[0]["full_name"] == "Newer Player"
    assert body[0]["categories"] == [
        {
            "id": str(category.id),
            "name": "Forwards",
            "created_at": body[0]["categories"][0]["created_at"],
            "updated_at": body[0]["categories"][0]["updated_at"],
        }
    ]
    assert body[0]["media"] == [
        {
            "id": str(media.id),
            "player_id": str(newer_player.id),
            "media_type": "video",
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "created_at": body[0]["media"][0]["created_at"],
        }
    ]
    assert body[1]["categories"] == []
    assert body[1]["media"] == []


async def test_list_players_filters_by_query(
    api_client: AsyncClient,
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    matching_player = await player_factory(full_name="Lionel Messi")
    await player_factory(full_name="Cristiano Ronaldo")

    response = await api_client.get("/players", params={"q": "messi"})

    assert response.status_code == 200
    body = response.json()
    assert [player["id"] for player in body] == [str(matching_player.id)]
    assert body[0]["full_name"] == "Lionel Messi"


async def test_list_players_filters_by_category(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
) -> None:
    forwards = await category_factory(name="Forwards")
    midfielders = await category_factory(name="Midfielders")
    matching_player = await player_factory(full_name="Forward Player")
    other_player = await player_factory(full_name="Midfielder Player")
    await player_category_factory(matching_player, forwards)
    await player_category_factory(other_player, midfielders)

    response = await api_client.get("/players", params={"c": str(forwards.id)})

    assert response.status_code == 200
    body = response.json()
    assert [player["id"] for player in body] == [str(matching_player.id)]
    assert body[0]["full_name"] == "Forward Player"


async def test_list_players_filters_by_all_requested_categories(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
) -> None:
    forwards = await category_factory(name="Forwards")
    captains = await category_factory(name="Captains")
    matching_player = await player_factory(full_name="Forward Captain")
    only_forward = await player_factory(full_name="Only Forward")
    only_captain = await player_factory(full_name="Only Captain")
    await player_category_factory(matching_player, forwards)
    await player_category_factory(matching_player, captains)
    await player_category_factory(only_forward, forwards)
    await player_category_factory(only_captain, captains)

    response = await api_client.get(
        "/players",
        params=[("c", str(forwards.id)), ("c", str(captains.id))],
    )

    assert response.status_code == 200
    body = response.json()
    assert [player["id"] for player in body] == [str(matching_player.id)]
    assert body[0]["full_name"] == "Forward Captain"


async def test_list_players_returns_404_for_missing_category_filter(
    api_client: AsyncClient,
) -> None:
    response = await api_client.get("/players", params={"c": str(uuid.uuid4())})

    assert response.status_code == 404
    assert response.json() == {"detail": "Category not found."}


@pytest.mark.parametrize("query", ["", "x" * 51])
async def test_list_players_rejects_invalid_query(
    api_client: AsyncClient,
    query: str,
) -> None:
    response = await api_client.get("/players", params={"q": query})

    assert response.status_code == 422


async def test_get_player_returns_categories_and_media(
    api_client: AsyncClient,
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
    player_media_factory: Callable[..., Awaitable[PlayerMedia]],
) -> None:
    category = await category_factory(name="Midfielders")
    player = await player_factory(full_name="Existing Player")
    await player_category_factory(player, category)
    media = await player_media_factory(
        player,
        media_type="image",
        url="https://cdn.dtmones.dev/player.jpg",
    )

    response = await api_client.get(f"/players/{player.id}")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(player.id)
    assert body["full_name"] == "Existing Player"
    assert body["categories"] == [
        {
            "id": str(category.id),
            "name": "Midfielders",
            "created_at": body["categories"][0]["created_at"],
            "updated_at": body["categories"][0]["updated_at"],
        }
    ]
    assert body["media"] == [
        {
            "id": str(media.id),
            "player_id": str(player.id),
            "media_type": "image",
            "url": "https://cdn.dtmones.dev/player.jpg",
            "created_at": body["media"][0]["created_at"],
        }
    ]


async def test_get_player_returns_404_for_missing_player(
    api_client: AsyncClient,
) -> None:
    response = await api_client.get(f"/players/{uuid.uuid4()}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Player not found."}


async def test_get_player_rejects_invalid_uuid(api_client: AsyncClient) -> None:
    response = await api_client.get("/players/not-a-uuid")

    assert response.status_code == 422


async def test_create_player_requires_auth_and_persists_player_with_categories(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
) -> None:
    forward = await category_factory(name="Forwards")
    captain = await category_factory(name="Captains")

    response = await api_client.post(
        "/players",
        json=_valid_player_payload(
            full_name="Created Player",
            category_ids=[str(forward.id), str(captain.id)],
        ),
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["full_name"] == "Created Player"
    assert body["height"] == "1.70m"
    assert body["date_of_birth"] == "1987-06-24"
    assert body["nationality"] == "Argentina"
    assert body["last_club"] == "Inter Miami"
    assert {category["id"] for category in body["categories"]} == {
        str(forward.id),
        str(captain.id),
    }
    assert body["media"] == []

    player = (
        await db_session.execute(
            select(Player).where(Player.id == uuid.UUID(body["id"]))
        )
    ).scalar_one()
    assert player.full_name == "Created Player"

    category_ids = (
        await db_session.execute(
            select(PlayerCategory.category_id).where(
                PlayerCategory.player_id == player.id
            )
        )
    ).scalars().all()
    assert set(category_ids) == {forward.id, captain.id}


async def test_create_player_returns_404_for_missing_category(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.post(
        "/players",
        json=_valid_player_payload(category_ids=[str(uuid.uuid4())]),
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Category not found."}


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
    ],
)
async def test_create_player_rejects_missing_or_invalid_auth(
    api_client: AsyncClient,
    headers: dict[str, str],
) -> None:
    response = await api_client.post(
        "/players",
        json=_valid_player_payload(),
        headers=headers,
    )

    assert response.status_code == 401


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("full_name", ""),
        ("full_name", "x" * 151),
        ("height", ""),
        ("height", "x" * 21),
        ("date_of_birth", ""),
        ("date_of_birth", "x" * 51),
        ("nationality", ""),
        ("nationality", "x" * 101),
        ("last_club", ""),
        ("last_club", "x" * 151),
    ],
)
async def test_create_player_rejects_invalid_fields(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    field: str,
    value: str,
) -> None:
    payload = _valid_player_payload()
    payload[field] = value

    response = await api_client.post(
        "/players",
        json=payload,
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


async def test_create_player_rejects_duplicate_category_ids(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
) -> None:
    category = await category_factory()

    response = await api_client.post(
        "/players",
        json=_valid_player_payload(
            category_ids=[str(category.id), str(category.id)],
        ),
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


async def test_update_player_requires_auth_and_persists_partial_fields(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    player = await player_factory(full_name="Old Name", height="1.80m")

    response = await api_client.patch(
        f"/players/{player.id}",
        json={"full_name": "New Name"},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(player.id)
    assert body["full_name"] == "New Name"
    assert body["height"] == "1.80m"

    updated_player = (
        await db_session.execute(select(Player).where(Player.id == player.id))
    ).scalar_one()
    assert updated_player.full_name == "New Name"
    assert updated_player.height == "1.80m"


async def test_update_player_replaces_categories(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
    player_category_factory: Callable[[Player, Category], Awaitable[PlayerCategory]],
) -> None:
    old_category = await category_factory(name="Old Category")
    new_category = await category_factory(name="New Category")
    player = await player_factory()
    await player_category_factory(player, old_category)

    response = await api_client.patch(
        f"/players/{player.id}",
        json={"category_ids": [str(new_category.id)]},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    body = response.json()
    assert {category["id"] for category in body["categories"]} == {
        str(new_category.id)
    }

    category_ids = (
        await db_session.execute(
            select(PlayerCategory.category_id).where(
                PlayerCategory.player_id == player.id
            )
        )
    ).scalars().all()
    assert category_ids == [new_category.id]


async def test_update_player_returns_404_for_missing_player(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.patch(
        f"/players/{uuid.uuid4()}",
        json={"full_name": "New Name"},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Player not found."}


async def test_update_player_returns_404_for_missing_category(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    player = await player_factory()

    response = await api_client.patch(
        f"/players/{player.id}",
        json={"category_ids": [str(uuid.uuid4())]},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Category not found."}


async def test_update_player_rejects_missing_auth(
    api_client: AsyncClient,
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    player = await player_factory()

    response = await api_client.patch(
        f"/players/{player.id}",
        json={"full_name": "New Name"},
    )

    assert response.status_code == 401


async def test_update_player_rejects_invalid_uuid(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.patch(
        "/players/not-a-uuid",
        json={"full_name": "New Name"},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("full_name", ""),
        ("full_name", "x" * 151),
        ("height", ""),
        ("height", "x" * 21),
        ("date_of_birth", ""),
        ("date_of_birth", "x" * 51),
        ("nationality", ""),
        ("nationality", "x" * 101),
        ("last_club", ""),
        ("last_club", "x" * 151),
    ],
)
async def test_update_player_rejects_invalid_fields(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    field: str,
    value: str,
) -> None:
    player = await player_factory()

    response = await api_client.patch(
        f"/players/{player.id}",
        json={field: value},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


async def test_update_player_rejects_duplicate_category_ids(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    category_factory: Callable[..., Awaitable[Category]],
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    category = await category_factory()
    player = await player_factory()

    response = await api_client.patch(
        f"/players/{player.id}",
        json={"category_ids": [str(category.id), str(category.id)]},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


async def test_delete_player_requires_auth_and_removes_player(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    player = await player_factory()

    response = await api_client.delete(
        f"/players/{player.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Player deleted successfully."}

    deleted_player = (
        await db_session.execute(select(Player).where(Player.id == player.id))
    ).scalar_one_or_none()
    assert deleted_player is None


async def test_delete_player_deletes_image_blobs(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    player_media_factory: Callable[..., Awaitable[PlayerMedia]],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    blob_delete_calls: list[str | list[str]] = []

    async def fake_delete(urls: str | list[str]) -> None:
        blob_delete_calls.append(urls)

    monkeypatch.setattr(blob, "delete", fake_delete)
    player = await player_factory()
    image_media = await player_media_factory(
        player,
        media_type="image",
        url="https://cdn.dtmones.dev/player.jpg",
    )
    video_media = await player_media_factory(
        player,
        media_type="video",
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    )

    response = await api_client.delete(
        f"/players/{player.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Player deleted successfully."}
    assert blob_delete_calls == [["https://cdn.dtmones.dev/player.jpg"]]

    deleted_media_ids = (
        await db_session.execute(
            select(PlayerMedia.id).where(
                PlayerMedia.id.in_([image_media.id, video_media.id])
            )
        )
    ).scalars().all()
    assert deleted_media_ids == []


async def test_delete_player_returns_404_for_missing_player(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        f"/players/{uuid.uuid4()}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Player not found."}


async def test_delete_player_rejects_missing_auth(
    api_client: AsyncClient,
    player_factory: Callable[..., Awaitable[Player]],
) -> None:
    player = await player_factory()

    response = await api_client.delete(f"/players/{player.id}")

    assert response.status_code == 401


async def test_delete_player_rejects_invalid_uuid(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        "/players/not-a-uuid",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422
