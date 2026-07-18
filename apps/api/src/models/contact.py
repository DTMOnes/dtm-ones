# Stdlib
import uuid
from datetime import datetime
from typing import Literal

# Third-party
from pydantic import ConfigDict, EmailStr
from sqlalchemy import CheckConstraint, Column, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field, SQLModel

# Local
from models.base import Base

ContactRequestReason = Literal["hire_services", "seek_representation"]


class ContactRequestBase(SQLModel):
    reason: ContactRequestReason
    email: str
    message: str


class ContactRequestCreate(SQLModel):
    reason: ContactRequestReason
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)


class ContactRequestRead(ContactRequestBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class ContactRequest(ContactRequestBase, Base, table=True):
    __tablename__ = "contact_request"
    __table_args__ = (
        CheckConstraint(
            "reason in ('hire_services', 'seek_representation')",
            name="contact_request_reason_check",
        ),
    )

    id: uuid.UUID = Field(
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
            server_default=text("gen_random_uuid()"),
        )
    )
    reason: str = Field(sa_column=Column(Text, nullable=False))
    email: str = Field(sa_column=Column(Text, nullable=False))
    message: str = Field(sa_column=Column(Text, nullable=False))
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=text("now()"),
        )
    )
