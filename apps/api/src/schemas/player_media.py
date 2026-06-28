# Stdlib
import uuid
from datetime import datetime
from typing import Literal

# Third-party
from pydantic import BaseModel, ConfigDict, field_validator

# Local
from services.youtube import parse_youtube_video_id


class PlayerMediaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    player_id: uuid.UUID
    media_type: Literal["image", "institutional_picture", "video"]
    url: str
    created_at: datetime


class CreatePlayerVideoInput(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def _validate_youtube_url(cls, value: str) -> str:
        if parse_youtube_video_id(value) is None:
            raise ValueError("Introduce una URL válida de YouTube.")
        return value
