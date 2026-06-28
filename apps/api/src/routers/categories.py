# Stdlib
import uuid
from datetime import datetime, timezone
from typing import Annotated

# Third-party
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import and_, delete, desc, select
from sqlalchemy.orm import selectinload

# Local
from core.dependencies.auth import CurrentUser
from core.dependencies.db import DbSession
from models import Category, PlayerCategory
from schemas.categories import (
    CategoryRead,
    CategoryWithCount,
    CreateCategoryInput,
    UpdateCategoryInput,
)
from schemas.common import SuccessMessageResponse
from schemas.players import CategoryDetail, PlayerSummary
from services.categories import find_category

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryWithCount])
async def list_categories(
    db: DbSession,
    q: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
) -> list[CategoryWithCount]:
    categories = (
        (
            await db.execute(
                select(Category)
                .where(Category.name.ilike(f"%{(q or '').strip()}%"))
                .order_by(desc(Category.created_at))
                .options(selectinload(Category.player_categories))
            )
        )
        .scalars()
        .all()
    )

    return [
        CategoryWithCount(
            id=category.id,
            name=category.name,
            created_at=category.created_at,
            updated_at=category.updated_at,
            player_count=len(category.player_categories),
        )
        for category in categories
    ]


@router.get("/{category_id}", response_model=CategoryDetail)
async def get_category(category_id: uuid.UUID, db: DbSession) -> CategoryDetail:
    category = (
        await db.execute(
            select(Category)
            .where(Category.id == category_id)
            .options(
                selectinload(Category.player_categories).selectinload(
                    PlayerCategory.player
                )
            )
        )
    ).scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found."
        )

    return CategoryDetail(
        id=category.id,
        name=category.name,
        created_at=category.created_at,
        updated_at=category.updated_at,
        players=[
            PlayerSummary.model_validate(link.player)
            for link in category.player_categories
        ],
    )


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CreateCategoryInput, db: DbSession, _: CurrentUser
) -> CategoryRead:
    category = Category(name=payload.name)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return CategoryRead.model_validate(category)


@router.patch("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: uuid.UUID,
    payload: UpdateCategoryInput,
    db: DbSession,
    _: CurrentUser,
) -> CategoryRead:
    category = await find_category(db, category_id)
    category.name = payload.name
    category.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(category)
    return CategoryRead.model_validate(category)


@router.delete("/{category_id}", response_model=SuccessMessageResponse)
async def delete_category(
    category_id: uuid.UUID, db: DbSession, _: CurrentUser
) -> SuccessMessageResponse:
    category = await find_category(db, category_id)
    await db.delete(category)
    await db.commit()
    return SuccessMessageResponse(message="Category deleted successfully.")


@router.delete(
    "/{category_id}/players/{player_id}", response_model=SuccessMessageResponse
)
async def remove_player_from_category(
    category_id: uuid.UUID,
    player_id: uuid.UUID,
    db: DbSession,
    _: CurrentUser,
) -> SuccessMessageResponse:
    result = await db.execute(
        delete(PlayerCategory)
        .where(
            and_(
                PlayerCategory.category_id == category_id,
                PlayerCategory.player_id == player_id,
            )
        )
        .returning(PlayerCategory.player_id)
    )
    deleted = result.all()

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The player does not belong to this category.",
        )

    await db.commit()
    return SuccessMessageResponse(message="Player removed from the category.")
