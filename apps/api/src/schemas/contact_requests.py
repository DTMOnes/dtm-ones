# Stdlib
import uuid
from datetime import datetime
from typing import Literal

# Third-party
from pydantic import BaseModel, ConfigDict, EmailStr, Field

ContactRequestReason = Literal["hire_services", "seek_representation"]


class ContactRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reason: ContactRequestReason
    email: str
    message: str
    created_at: datetime


class CreateContactRequestInput(BaseModel):
    reason: ContactRequestReason
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)
