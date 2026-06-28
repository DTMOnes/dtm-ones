"""Create initial API schema.

Revision ID: 20260627_0001
Revises:
Create Date: 2026-06-27
"""

# Third-party
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260627_0001"
down_revision = None
branch_labels = None
depends_on = None


player_media_types = postgresql.ENUM(
    "image",
    "institutional_picture",
    "video",
    name="player_media_types",
    create_type=False,
)


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE player_media_types AS ENUM (
                'image',
                'institutional_picture',
                'video'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END
        $$;
        """
    )

    op.create_table(
        "categories",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "contact_request",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "players",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("height", sa.String(length=20), nullable=False),
        sa.Column("date_of_birth", sa.String(length=50), nullable=False),
        sa.Column("nationality", sa.String(length=100), nullable=False),
        sa.Column("last_club", sa.String(length=150), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("role in ('user', 'admin')", name="users_role_check"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "auth_refresh_tokens",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("token_hash", sa.Text(), nullable=False),
        sa.Column("user_id", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "auth_refresh_tokens_token_hash_idx",
        "auth_refresh_tokens",
        ["token_hash"],
        unique=True,
    )
    op.create_index(
        "auth_refresh_tokens_user_id_idx",
        "auth_refresh_tokens",
        ["user_id"],
        unique=False,
    )

    op.create_table(
        "player_categories",
        sa.Column("player_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="cascade"),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("player_id", "category_id"),
    )

    op.create_table(
        "player_media",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("player_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("media_type", player_media_types, nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("player_media")
    op.drop_table("player_categories")
    op.drop_index(
        "auth_refresh_tokens_user_id_idx",
        table_name="auth_refresh_tokens",
    )
    op.drop_index(
        "auth_refresh_tokens_token_hash_idx",
        table_name="auth_refresh_tokens",
    )
    op.drop_table("auth_refresh_tokens")
    op.drop_table("users")
    op.drop_table("players")
    op.drop_table("contact_request")
    op.drop_table("categories")
    player_media_types.drop(op.get_bind(), checkfirst=True)
