# Stdlib
import uuid
from datetime import datetime

# Third-party
from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Local
from models.base import Base

PLAYER_MEDIA_TYPES = ("image", "institutional_picture", "video")

player_media_enum = Enum(
    *PLAYER_MEDIA_TYPES,
    name="player_media_types",
    create_type=False,
)


class Player(Base):
    __tablename__ = "players"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    full_name: Mapped[str] = mapped_column("full_name", String(150), nullable=False)
    height: Mapped[str] = mapped_column(String(20), nullable=False)
    date_of_birth: Mapped[str] = mapped_column(
        "date_of_birth", String(50), nullable=False
    )
    nationality: Mapped[str] = mapped_column(String(100), nullable=False)
    last_club: Mapped[str] = mapped_column("last_club", String(150), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        "created_at",
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updated_at",
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    player_categories: Mapped[list["PlayerCategory"]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )
    player_media: Mapped[list["PlayerMedia"]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        "created_at",
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updated_at",
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    player_categories: Mapped[list["PlayerCategory"]] = relationship(
        back_populates="category", cascade="all, delete-orphan"
    )


class PlayerCategory(Base):
    __tablename__ = "player_categories"

    player_id: Mapped[uuid.UUID] = mapped_column(
        "player_id",
        UUID(as_uuid=True),
        ForeignKey("players.id", ondelete="cascade"),
        primary_key=True,
        nullable=False,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        "category_id",
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="cascade"),
        primary_key=True,
        nullable=False,
    )

    player: Mapped[Player] = relationship(back_populates="player_categories")
    category: Mapped[Category] = relationship(back_populates="player_categories")


class PlayerMedia(Base):
    __tablename__ = "player_media"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    player_id: Mapped[uuid.UUID] = mapped_column(
        "player_id",
        UUID(as_uuid=True),
        ForeignKey("players.id", ondelete="cascade"),
        nullable=False,
    )
    media_type: Mapped[str] = mapped_column(
        "media_type", player_media_enum, nullable=False
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        "created_at",
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    player: Mapped[Player] = relationship(back_populates="player_media")
