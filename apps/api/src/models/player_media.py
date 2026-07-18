# Stdlib
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Literal, Optional

# Third-party
from pydantic import ConfigDict, field_validator
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field, Relationship, SQLModel

# Local
from models.base import Base
from services.youtube import parse_youtube_video_id

if TYPE_CHECKING:
    from models.player import Player

PLAYER_MEDIA_TYPES = ("image", "institutional_picture", "video")

player_media_enum = Enum(
    *PLAYER_MEDIA_TYPES,
    name="player_media_types",
    create_type=False,
)

PlayerMediaType = Literal["image", "institutional_picture", "video"]


class PlayerMediaBase(SQLModel):
    media_type: PlayerMediaType
    url: str


class PlayerMediaRead(PlayerMediaBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    player_id: uuid.UUID
    created_at: datetime


class PlayerMediaVideoCreate(SQLModel):
    url: str

    @field_validator("url")
    @classmethod
    def _validate_youtube_url(cls, value: str) -> str:
        if parse_youtube_video_id(value) is None:
            raise ValueError("Introduce una URL válida de YouTube.")
        return value


class PlayerMedia(Base, table=True):
    __tablename__ = "player_media"

    id: uuid.UUID = Field(
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
            server_default=text("gen_random_uuid()"),
        )
    )
    player_id: uuid.UUID = Field(
        sa_column=Column(
            "player_id",
            UUID(as_uuid=True),
            ForeignKey("players.id", ondelete="cascade"),
            nullable=False,
        )
    )
    media_type: str = Field(
        sa_column=Column("media_type", player_media_enum, nullable=False)
    )
    url: str = Field(sa_column=Column(Text, nullable=False))
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=text("now()"),
        )
    )

    player: Optional["Player"] = Relationship(back_populates="media")
