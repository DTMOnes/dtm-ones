# Stdlib
import uuid

# Third-party
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

# Local
from models import Player, PlayerCategory


async def find_player(db: AsyncSession, player_id: uuid.UUID) -> Player:
    stmt = (
        select(Player)
        .where(Player.id == player_id)
        .options(
            selectinload(Player.player_categories).selectinload(
                PlayerCategory.category
            ),
            selectinload(Player.player_media),
        )
        .execution_options(populate_existing=True)
    )

    result = await db.execute(stmt)

    player = result.scalar_one_or_none()

    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Player not found."
        )

    return player
