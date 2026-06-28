# Stdlib
import uuid
from datetime import datetime

# Third-party
from pydantic import BaseModel, ConfigDict, Field


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    created_at: datetime
    updated_at: datetime


class CategoryWithCount(CategoryRead):
    player_count: int


class CreateCategoryInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class UpdateCategoryInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
