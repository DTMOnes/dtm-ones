# Stdlib
import uuid
from datetime import datetime, timezone
from typing import Annotated

# Third-party
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import desc, distinct, func, select
from sqlalchemy.orm import selectinload

# Local
from core.dependencies.auth import CurrentUser
from core.dependencies.db import DbSession
from models import Category, Player, PlayerCategory
from schemas.common import MessageResponse
from schemas.players import CreatePlayerInput, PlayerRead, UpdatePlayerInput
from serializers.players import serialize_player
from services import blob
from services.categories import find_many_categories
from services.players import find_player

router = APIRouter(prefix="/players", tags=["players"])

_BLOB_IMAGE_TYPES = ("image", "institutional_picture")


@router.get("", response_model=list[PlayerRead])
async def get_all_players(
    db: DbSession,
    q: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
    c: Annotated[list[str] | None, Query()] = None,
) -> list[PlayerRead]:
    stmt = select(Player).options(
        selectinload(Player.player_categories).selectinload(PlayerCategory.category),
        selectinload(Player.player_media),
    )

    if q:
        stmt = stmt.where(Player.full_name.ilike(f"%{q}%"))

    if c:
        categories = await find_many_categories(db, c)

        if len(c) != len(categories):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Category not found."
            )

        stmt = (
            stmt.join(PlayerCategory, PlayerCategory.player_id == Player.id)
            .join(Category, Category.id == PlayerCategory.category_id)
            .where(Category.id.in_(c))
            .group_by(Player.id)
            .having(func.count(distinct(Category.id)) == len(c))
        )

    stmt = stmt.order_by(desc(Player.created_at))

    result = await db.execute(stmt)
    players = result.scalars().unique().all()

    return [serialize_player(player) for player in players]


@router.get("/{player_id}", response_model=PlayerRead)
async def get_player(player_id: uuid.UUID, db: DbSession) -> PlayerRead:
    player = await find_player(db, player_id)
    return serialize_player(player)


@router.post("", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
async def create_player(
    payload: CreatePlayerInput, db: DbSession, _: CurrentUser
) -> PlayerRead:
    categories = await find_many_categories(db, payload.category_ids)
    if len(payload.category_ids) != len(categories):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found."
        )

    player = Player(
        full_name=payload.full_name,
        height=payload.height,
        date_of_birth=payload.date_of_birth,
        nationality=payload.nationality,
        last_club=payload.last_club,
    )

    db.add(player)

    await db.flush()

    for category_id in payload.category_ids:
        player_category = PlayerCategory(player_id=player.id, category_id=category_id)

        db.add(player_category)

    await db.commit()

    created_player = await find_player(db, player.id)

    return serialize_player(created_player)


@router.patch("/{player_id}", response_model=PlayerRead)
async def update_player(
    player_id: uuid.UUID,
    payload: UpdatePlayerInput,
    db: DbSession,
    _: CurrentUser,
) -> PlayerRead:
    player = await find_player(db, player_id)

    data = payload.model_dump(exclude_unset=True, exclude={"category_ids"})

    for field, value in data.items():
        if value is not None:
            setattr(player, field, value)
    player.updated_at = datetime.now(timezone.utc)

    if payload.category_ids is not None:
        categories = await find_many_categories(db, payload.category_ids)
        if len(payload.category_ids) != len(categories):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Category not found."
            )

        for link in list(player.player_categories):
            await db.delete(link)
        await db.flush()
        for category_id in payload.category_ids:
            db.add(PlayerCategory(player_id=player.id, category_id=category_id))

    await db.commit()

    return serialize_player(await find_player(db, player.id))


@router.delete("/{player_id}", response_model=MessageResponse)
async def delete_player(
    player_id: uuid.UUID, db: DbSession, _: CurrentUser
) -> MessageResponse:
    player = await find_player(db, player_id)

    image_urls = [
        media.url
        for media in player.player_media
        if media.media_type in _BLOB_IMAGE_TYPES
    ]

    if image_urls:
        await blob.delete(image_urls)

    await db.delete(player)
    await db.commit()

    return MessageResponse(message="Player deleted successfully.")
