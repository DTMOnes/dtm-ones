"""Add contact request reason.

Revision ID: 20260628_0002
Revises: 20260627_0001
Create Date: 2026-06-28
"""

# Third-party
from alembic import op
import sqlalchemy as sa

revision = "20260628_0002"
down_revision = "20260627_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "contact_request",
        sa.Column(
            "reason",
            sa.Text(),
            server_default="hire_services",
            nullable=False,
        ),
    )
    op.create_check_constraint(
        "contact_request_reason_check",
        "contact_request",
        "reason in ('hire_services', 'seek_representation')",
    )
    op.alter_column("contact_request", "reason", server_default=None)


def downgrade() -> None:
    op.drop_constraint(
        "contact_request_reason_check",
        "contact_request",
        type_="check",
    )
    op.drop_column("contact_request", "reason")
