# Stdlib
from datetime import datetime
from typing import Literal

# Third-party
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

UserRole = Literal["user", "admin"]


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    name: str
    role: str | None = None
    created_at: datetime
    updated_at: datetime


class UserDetail(UserRead):
    admin_count: int
    is_only_admin: bool


class CreateUserInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1)
    role: UserRole


class UpdateUserGeneralInput(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr


class ChangeUserPasswordInput(BaseModel):
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=1)

    @model_validator(mode="after")
    def _passwords_match(self) -> "ChangeUserPasswordInput":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class SetUserRoleInput(BaseModel):
    role: UserRole
