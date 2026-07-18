# Stdlib
import uuid
from datetime import datetime

# Third-party
from pydantic import ConfigDict, field_validator
from sqlalchemy import Column, DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field, Relationship, SQLModel

# Local
from models.base import Base
from models.category import Category, CategoryRead, PlayerCategory
from models.player_media import PlayerMedia, PlayerMediaRead


class PlayerBase(SQLModel):
    full_name: str
    height: str
    date_of_birth: str
    nationality: str
    last_club: str


class PlayerSummary(PlayerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class PlayerRead(PlayerSummary):
    categories: list[CategoryRead] = Field(default_factory=list)
    media: list[PlayerMediaRead] = Field(default_factory=list)


class CategoryDetail(CategoryRead):
    players: list[PlayerSummary] = Field(default_factory=list)


def _unique_category_ids(value: list[uuid.UUID]) -> list[uuid.UUID]:
    if len(set(value)) != len(value):
        raise ValueError("Do not repeat the same category.")
    return value


class PlayerCreate(PlayerBase):
    full_name: str = Field(min_length=1, max_length=150)
    height: str = Field(min_length=1, max_length=20)
    date_of_birth: str = Field(min_length=1, max_length=50)
    nationality: str = Field(min_length=1, max_length=100)
    last_club: str = Field(min_length=1, max_length=150)
    category_ids: list[uuid.UUID] = Field(default_factory=list)

    _validate_category_ids = field_validator("category_ids")(_unique_category_ids)


class PlayerUpdate(SQLModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    height: str | None = Field(default=None, min_length=1, max_length=20)
    date_of_birth: str | None = Field(default=None, min_length=1, max_length=50)
    nationality: str | None = Field(default=None, min_length=1, max_length=100)
    last_club: str | None = Field(default=None, min_length=1, max_length=150)
    category_ids: list[uuid.UUID] | None = None

    @field_validator("category_ids")
    @classmethod
    def _validate_category_ids(
        cls, value: list[uuid.UUID] | None
    ) -> list[uuid.UUID] | None:
        if value is None:
            return None
        return _unique_category_ids(value)


class Player(PlayerBase, Base, table=True):
    __tablename__ = "players"

    id: uuid.UUID = Field(
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
            server_default=text("gen_random_uuid()"),
        )
    )
    full_name: str = Field(sa_column=Column("full_name", String(150), nullable=False))
    height: str = Field(sa_column=Column(String(20), nullable=False))
    date_of_birth: str = Field(
        sa_column=Column("date_of_birth", String(50), nullable=False)
    )
    nationality: str = Field(sa_column=Column(String(100), nullable=False))
    last_club: str = Field(sa_column=Column("last_club", String(150), nullable=False))
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

    categories: list[Category] = Relationship(
        back_populates="players",
        link_model=PlayerCategory,
    )
    media: list[PlayerMedia] = Relationship(
        back_populates="player",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
