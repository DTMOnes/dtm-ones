# Third-party
from pydantic import BaseModel, EmailStr, Field

# Local
from schemas.common import MessageResponse
from schemas.users import UserRead


class SessionUser(UserRead):
    """Authenticated user resolved from an API access token."""


class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RefreshTokenInput(BaseModel):
    refresh_token: str = Field(min_length=1)


class LogoutInput(RefreshTokenInput):
    pass


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: SessionUser


class LogoutResponse(MessageResponse):
    pass
