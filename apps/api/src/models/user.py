# Stdlib
from datetime import datetime
from typing import Literal
from uuid import uuid4

# Third-party
from pydantic import ConfigDict, EmailStr, model_validator
from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Index, Text, text
from sqlmodel import Field, Relationship, SQLModel

# Local
from models.base import Base

UserRole = Literal["user", "admin"]


class UserBase(SQLModel):
    name: str
    email: str
    role: str | None = None


class UserCreate(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1)
    role: UserRole


class UserUpdate(SQLModel):
    name: str = Field(min_length=1)
    email: EmailStr


class UserPasswordChange(SQLModel):
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=1)

    @model_validator(mode="after")
    def _passwords_match(self) -> "UserPasswordChange":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class UserRoleUpdate(SQLModel):
    role: UserRole


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class UserDetail(UserRead):
    admin_count: int
    is_only_admin: bool


class User(UserBase, Base, table=True):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role in ('user', 'admin')", name="users_role_check"),
    )

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        sa_column=Column(Text, primary_key=True),
    )
    name: str = Field(sa_column=Column(Text, nullable=False))
    email: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    password_hash: str = Field(sa_column=Column("password_hash", Text, nullable=False))
    role: str = Field(default="user", sa_column=Column(Text, nullable=False))
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

    refresh_tokens: list["RefreshToken"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class RefreshToken(Base, table=True):
    __tablename__ = "auth_refresh_tokens"
    __table_args__ = (
        Index("auth_refresh_tokens_user_id_idx", "user_id"),
        Index("auth_refresh_tokens_token_hash_idx", "token_hash", unique=True),
    )

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        sa_column=Column(Text, primary_key=True),
    )
    token_hash: str = Field(sa_column=Column("token_hash", Text, nullable=False))
    user_id: str = Field(
        sa_column=Column(
            "user_id",
            Text,
            ForeignKey("users.id", ondelete="cascade"),
            nullable=False,
        )
    )
    expires_at: datetime = Field(
        sa_column=Column("expires_at", DateTime(timezone=True), nullable=False)
    )
    revoked_at: datetime | None = Field(
        default=None,
        sa_column=Column("revoked_at", DateTime(timezone=True), nullable=True),
    )
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=text("now()"),
        )
    )

    user: User | None = Relationship(back_populates="refresh_tokens")
