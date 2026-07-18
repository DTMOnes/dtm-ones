# Third-party
from sqlmodel import SQLModel


class MessageResponse(SQLModel):
    message: str


class SuccessMessageResponse(MessageResponse):
    pass
