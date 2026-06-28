# Stdlib
import uuid

# Third-party
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Local
from models import Category


async def find_many_categories(
    db: AsyncSession, category_ids: list[uuid.UUID]
) -> list[Category]:
    stmt = select(Category).where(Category.id.in_(category_ids))

    result = await db.execute(stmt)

    categories = result.scalars().all()

    return categories


async def find_category(db: AsyncSession, category_id: uuid.UUID) -> Category:
    stmt = select(Category).where(Category.id == category_id)

    result = await db.execute(stmt)

    category = result.scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found."
        )

    return category
