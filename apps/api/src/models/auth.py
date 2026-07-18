# Third-party
from pydantic import EmailStr
from sqlmodel import Field, SQLModel

# Local
from models.common import MessageResponse
from models.user import UserRead


class SessionUser(UserRead):
    """Authenticated user resolved from an API access token."""


class LoginInput(SQLModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RefreshTokenInput(SQLModel):
    refresh_token: str = Field(min_length=1)


class LogoutInput(RefreshTokenInput):
    pass


class TokenResponse(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: SessionUser


class LogoutResponse(MessageResponse):
    pass
