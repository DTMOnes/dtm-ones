# Third-party
from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class SuccessMessageResponse(MessageResponse):
    pass
