# Stdlib
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

# Third-party
from pydantic import ConfigDict
from sqlalchemy import Column, DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field, Relationship, SQLModel

# Local
from models.base import Base

if TYPE_CHECKING:
    from models.player import Player


class PlayerCategory(Base, table=True):
    __tablename__ = "player_categories"

    player_id: uuid.UUID = Field(
        sa_column=Column(
            "player_id",
            UUID(as_uuid=True),
            ForeignKey("players.id", ondelete="cascade"),
            primary_key=True,
            nullable=False,
        )
    )
    category_id: uuid.UUID = Field(
        sa_column=Column(
            "category_id",
            UUID(as_uuid=True),
            ForeignKey("categories.id", ondelete="cascade"),
            primary_key=True,
            nullable=False,
        )
    )


class CategoryBase(SQLModel):
    name: str


class CategoryCreate(SQLModel):
    name: str = Field(min_length=1, max_length=100)


class CategoryUpdate(SQLModel):
    name: str = Field(min_length=1, max_length=100)


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class CategoryWithCount(CategoryRead):
    player_count: int


class Category(CategoryBase, Base, table=True):
    __tablename__ = "categories"

    id: uuid.UUID = Field(
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
            server_default=text("gen_random_uuid()"),
        )
    )
    name: str = Field(sa_column=Column(String(100), nullable=False))
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=text("now()"),
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            "updated_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=text("now()"),
        )
    )

    players: list["Player"] = Relationship(
        back_populates="categories",
        link_model=PlayerCategory,
    )
