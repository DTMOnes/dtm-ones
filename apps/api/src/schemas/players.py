# Stdlib
import uuid
from datetime import datetime

# Third-party
from pydantic import BaseModel, ConfigDict, Field, field_validator

# Local
from schemas.categories import CategoryRead
from schemas.player_media import PlayerMediaRead


class PlayerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    height: str
    date_of_birth: str
    nationality: str
    last_club: str
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


class CreatePlayerInput(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    height: str = Field(min_length=1, max_length=20)
    date_of_birth: str = Field(min_length=1, max_length=50)
    nationality: str = Field(min_length=1, max_length=100)
    last_club: str = Field(min_length=1, max_length=150)
    category_ids: list[uuid.UUID] = Field(default_factory=list)

    _validate_category_ids = field_validator("category_ids")(_unique_category_ids)


class UpdatePlayerInput(BaseModel):
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
