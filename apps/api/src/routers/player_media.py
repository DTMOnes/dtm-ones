# Stdlib
import uuid
from typing import Annotated

# Third-party
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select

# Local
from core.dependencies.auth import CurrentUser
from core.dependencies.db import DbSession
from models import PlayerMedia
from schemas.common import MessageResponse
from schemas.player_media import CreatePlayerVideoInput, PlayerMediaRead
from services import blob
from services.players import find_player

router = APIRouter(tags=["player-media"])

_BLOB_IMAGE_TYPES = ("image", "institutional_picture")
_ALLOWED_IMAGE_CONTENT_TYPES = (
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
)


@router.post(
    "/players/{player_id}/media/image",
    response_model=PlayerMediaRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_player_image(
    player_id: uuid.UUID,
    db: DbSession,
    _: CurrentUser,
    file: Annotated[UploadFile, File()],
    media_type: Annotated[str, Form()] = "image",
) -> PlayerMediaRead:
    if media_type not in _BLOB_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid media type.",
        )

    if file.content_type not in _ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image content type.",
        )

    await find_player(db, player_id)

    contents = await file.read()
    result = await blob.put(
        f"player-assets/{file.filename}",
        contents,
        content_type=file.content_type,
        add_random_suffix=True,
    )

    media = PlayerMedia(
        player_id=player_id,
        media_type=media_type,
        url=result["url"],
    )

    db.add(media)
    await db.commit()
    await db.refresh(media)

    return PlayerMediaRead.model_validate(media)


@router.post(
    "/players/{player_id}/media/video",
    response_model=PlayerMediaRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_player_video(
    player_id: uuid.UUID,
    payload: CreatePlayerVideoInput,
    db: DbSession,
    _: CurrentUser,
) -> PlayerMediaRead:
    await find_player(db, player_id)

    media = PlayerMedia(
        player_id=player_id,
        media_type="video",
        url=payload.url,
    )
    db.add(media)
    await db.commit()
    await db.refresh(media)

    return PlayerMediaRead.model_validate(media)


@router.delete("/player-media/{media_id}", response_model=MessageResponse)
async def delete_player_media(
    media_id: uuid.UUID, db: DbSession, _: CurrentUser
) -> MessageResponse:
    media = (
        await db.execute(select(PlayerMedia).where(PlayerMedia.id == media_id))
    ).scalar_one_or_none()

    if media is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Media not found."
        )

    is_image = media.media_type in _BLOB_IMAGE_TYPES
    if is_image:
        await blob.delete(media.url)

    await db.delete(media)
    await db.commit()

    message = (
        "Image deleted successfully." if is_image else "Video deleted successfully."
    )
    return MessageResponse(message=message)
