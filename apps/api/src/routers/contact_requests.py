# Stdlib
import uuid

# Third-party
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import desc, select

# Local
from core.dependencies.auth import AdminUser
from core.dependencies.db import DbSession
from models import ContactRequest
from schemas.common import MessageResponse
from schemas.contact_requests import ContactRequestRead, CreateContactRequestInput

router = APIRouter(prefix="/contact-requests", tags=["contact-requests"])


@router.get("", response_model=list[ContactRequestRead])
async def get_all_contact_requests(
    db: DbSession, _: AdminUser
) -> list[ContactRequestRead]:
    stmt = select(ContactRequest).order_by(desc(ContactRequest.created_at))

    result = await db.execute(stmt)
    requests = result.scalars().all()

    return [ContactRequestRead.model_validate(request) for request in requests]


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_request(
    payload: CreateContactRequestInput, db: DbSession
) -> MessageResponse:
    contact_request = ContactRequest(
        reason=payload.reason,
        email=payload.email,
        message=payload.message,
    )

    db.add(contact_request)
    await db.commit()

    return MessageResponse(message="Your message was sent successfully.")


@router.delete("/{request_id}", response_model=MessageResponse)
async def delete_contact_request(
    request_id: uuid.UUID, db: DbSession, _: AdminUser
) -> MessageResponse:
    stmt = select(ContactRequest).where(ContactRequest.id == request_id)

    result = await db.execute(stmt)
    contact_request = result.scalar_one_or_none()

    if contact_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact request not found.",
        )

    await db.delete(contact_request)
    await db.commit()

    return MessageResponse(message="Contact request deleted successfully.")
