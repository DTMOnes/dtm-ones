# pyright: reportMissingImports=false

# Stdlib
from collections.abc import Awaitable, Callable
import uuid

# Third-party
from httpx import AsyncClient
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Local
from models import Player, PlayerMedia, User
from services import blob


@pytest.fixture
def blob_put_mock(monkeypatch: pytest.MonkeyPatch) -> list[dict[str, object]]:
    calls: list[dict[str, object]] = []

    async def fake_put(
        pathname: str,
        body: bytes,
        *,
        content_type: str | None = None,
        add_random_suffix: bool = True,
        access: str = "public",
    ) -> dict[str, str]:
        calls.append(
            {
                "pathname": pathname,
                "body": body,
                "content_type": content_type,
                "add_random_suffix": add_random_suffix,
                "access": access,
            }
        )
        return {"url": f"https://cdn.dtmones.dev/{pathname}"}

    monkeypatch.setattr(blob, "put", fake_put)
    return calls


@pytest.fixture
def blob_delete_mock(monkeypatch: pytest.MonkeyPatch) -> list[str | list[str]]:
    calls: list[str | list[str]] = []

    async def fake_delete(urls: str | list[str]) -> None:
        calls.append(urls)

    monkeypatch.setattr(blob, "delete", fake_delete)
    return calls


@pytest.fixture
def image_upload_file() -> tuple[str, bytes, str]:
    return ("player.jpg", b"fake-image-bytes", "image/jpeg")


@pytest.fixture
def valid_youtube_url() -> str:
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ"


async def test_upload_player_image_requires_auth_and_persists_media(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    blob_put_mock: list[dict[str, object]],
    image_upload_file: tuple[str, bytes, str],
) -> None:
    player = await player_factory()

    response = await api_client.post(
        f"/players/{player.id}/media/image",
        data={"media_type": "image"},
        files={"file": image_upload_file},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["player_id"] == str(player.id)
    assert body["media_type"] == "image"
    assert body["url"] == "https://cdn.dtmones.dev/player-assets/player.jpg"
    assert body["created_at"]
    assert blob_put_mock == [
        {
            "pathname": "player-assets/player.jpg",
            "body": b"fake-image-bytes",
            "content_type": "image/jpeg",
            "add_random_suffix": True,
            "access": "public",
        }
    ]

    media = (
        await db_session.execute(
            select(PlayerMedia).where(PlayerMedia.id == uuid.UUID(body["id"]))
        )
    ).scalar_one()
    assert media.player_id == player.id
    assert media.media_type == "image"
    assert media.url == "https://cdn.dtmones.dev/player-assets/player.jpg"
    assert media.created_at is not None


async def test_upload_player_image_accepts_institutional_picture(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    blob_put_mock: list[dict[str, object]],
    image_upload_file: tuple[str, bytes, str],
) -> None:
    player = await player_factory()

    response = await api_client.post(
        f"/players/{player.id}/media/image",
        data={"media_type": "institutional_picture"},
        files={"file": image_upload_file},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["player_id"] == str(player.id)
    assert body["media_type"] == "institutional_picture"
    assert body["url"] == "https://cdn.dtmones.dev/player-assets/player.jpg"
    assert body["created_at"]
    assert len(blob_put_mock) == 1

    media = (
        await db_session.execute(
            select(PlayerMedia).where(PlayerMedia.id == uuid.UUID(body["id"]))
        )
    ).scalar_one()
    assert media.player_id == player.id
    assert media.media_type == "institutional_picture"
    assert media.url == "https://cdn.dtmones.dev/player-assets/player.jpg"


async def test_upload_player_image_rejects_invalid_media_type(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    blob_put_mock: list[dict[str, object]],
    image_upload_file: tuple[str, bytes, str],
) -> None:
    player = await player_factory()

    response = await api_client.post(
        f"/players/{player.id}/media/image",
        data={"media_type": "video"},
        files={"file": image_upload_file},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid media type."}
    assert blob_put_mock == []


async def test_upload_player_image_rejects_unsupported_content_type(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    blob_put_mock: list[dict[str, object]],
) -> None:
    player = await player_factory()

    response = await api_client.post(
        f"/players/{player.id}/media/image",
        data={"media_type": "image"},
        files={"file": ("player.txt", b"not an image", "text/plain")},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Unsupported image content type."}
    assert blob_put_mock == []


async def test_upload_player_image_returns_404_for_missing_player(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    blob_put_mock: list[dict[str, object]],
    image_upload_file: tuple[str, bytes, str],
) -> None:
    response = await api_client.post(
        f"/players/{uuid.uuid4()}/media/image",
        data={"media_type": "image"},
        files={"file": image_upload_file},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Player not found."}
    assert blob_put_mock == []


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
    ],
)
async def test_upload_player_image_rejects_missing_or_invalid_auth(
    api_client: AsyncClient,
    player_factory: Callable[..., Awaitable[Player]],
    image_upload_file: tuple[str, bytes, str],
    headers: dict[str, str],
) -> None:
    player = await player_factory()

    response = await api_client.post(
        f"/players/{player.id}/media/image",
        data={"media_type": "image"},
        files={"file": image_upload_file},
        headers=headers,
    )

    assert response.status_code == 401


@pytest.mark.parametrize(
    ("player_id", "files"),
    [
        ("not-a-uuid", {"file": ("player.jpg", b"fake-image-bytes", "image/jpeg")}),
        (str(uuid.uuid4()), {}),
    ],
)
async def test_upload_player_image_rejects_invalid_uuid_or_multipart(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_id: str,
    files: dict[str, tuple[str, bytes, str]],
) -> None:
    response = await api_client.post(
        f"/players/{player_id}/media/image",
        data={"media_type": "image"},
        files=files,
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


async def test_add_player_video_requires_auth_and_persists_media(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    valid_youtube_url: str,
) -> None:
    player = await player_factory()

    response = await api_client.post(
        f"/players/{player.id}/media/video",
        json={"url": valid_youtube_url},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["player_id"] == str(player.id)
    assert body["media_type"] == "video"
    assert body["url"] == valid_youtube_url
    assert body["created_at"]

    media = (
        await db_session.execute(
            select(PlayerMedia).where(PlayerMedia.id == uuid.UUID(body["id"]))
        )
    ).scalar_one()
    assert media.player_id == player.id
    assert media.media_type == "video"
    assert media.url == valid_youtube_url
    assert media.created_at is not None


async def test_add_player_video_returns_404_for_missing_player(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    valid_youtube_url: str,
) -> None:
    response = await api_client.post(
        f"/players/{uuid.uuid4()}/media/video",
        json={"url": valid_youtube_url},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Player not found."}


async def test_add_player_video_rejects_missing_auth(
    api_client: AsyncClient,
    player_factory: Callable[..., Awaitable[Player]],
    valid_youtube_url: str,
) -> None:
    player = await player_factory()

    response = await api_client.post(
        f"/players/{player.id}/media/video",
        json={"url": valid_youtube_url},
    )

    assert response.status_code == 401


@pytest.mark.parametrize(
    ("player_id", "url"),
    [
        (str(uuid.uuid4()), "https://example.com/video"),
        ("not-a-uuid", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ],
)
async def test_add_player_video_rejects_invalid_url_or_uuid(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_id: str,
    url: str,
) -> None:
    response = await api_client.post(
        f"/players/{player_id}/media/video",
        json={"url": url},
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422


@pytest.mark.parametrize("media_type", ["image", "institutional_picture"])
async def test_delete_player_media_removes_image_blob_and_db_record(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    player_media_factory: Callable[..., Awaitable[PlayerMedia]],
    blob_delete_mock: list[str | list[str]],
    media_type: str,
) -> None:
    player = await player_factory()
    media = await player_media_factory(
        player,
        media_type=media_type,
        url=f"https://cdn.dtmones.dev/{media_type}.jpg",
    )

    response = await api_client.delete(
        f"/player-media/{media.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Image deleted successfully."}
    assert blob_delete_mock == [f"https://cdn.dtmones.dev/{media_type}.jpg"]

    deleted_media = (
        await db_session.execute(select(PlayerMedia).where(PlayerMedia.id == media.id))
    ).scalar_one_or_none()
    assert deleted_media is None


async def test_delete_player_media_removes_video_without_deleting_blob(
    api_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    player_factory: Callable[..., Awaitable[Player]],
    player_media_factory: Callable[..., Awaitable[PlayerMedia]],
    blob_delete_mock: list[str | list[str]],
    valid_youtube_url: str,
) -> None:
    player = await player_factory()
    media = await player_media_factory(
        player,
        media_type="video",
        url=valid_youtube_url,
    )

    response = await api_client.delete(
        f"/player-media/{media.id}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Video deleted successfully."}
    assert blob_delete_mock == []

    deleted_media = (
        await db_session.execute(select(PlayerMedia).where(PlayerMedia.id == media.id))
    ).scalar_one_or_none()
    assert deleted_media is None


async def test_delete_player_media_returns_404_for_missing_media(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
    blob_delete_mock: list[str | list[str]],
) -> None:
    response = await api_client.delete(
        f"/player-media/{uuid.uuid4()}",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Media not found."}
    assert blob_delete_mock == []


async def test_delete_player_media_rejects_missing_auth(
    api_client: AsyncClient,
    player_factory: Callable[..., Awaitable[Player]],
    player_media_factory: Callable[..., Awaitable[PlayerMedia]],
) -> None:
    player = await player_factory()
    media = await player_media_factory(player)

    response = await api_client.delete(f"/player-media/{media.id}")

    assert response.status_code == 401


async def test_delete_player_media_rejects_invalid_uuid(
    api_client: AsyncClient,
    regular_user: User,
    auth_headers: Callable[[User | str], dict[str, str]],
) -> None:
    response = await api_client.delete(
        "/player-media/not-a-uuid",
        headers=auth_headers(regular_user),
    )

    assert response.status_code == 422
