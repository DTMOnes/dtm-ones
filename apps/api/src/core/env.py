# Stdlib
from functools import lru_cache
from typing import Any

# Third-party
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


ASYNC_POSTGRES_DRIVER = "postgresql+asyncpg"
DEV_AUTH_SECRET_KEY = "dev-only-change-me-dev-only-change-me"


class Settings(BaseSettings):
    """Runtime configuration for the FastAPI service."""

    model_config = SettingsConfigDict(
        env_file=("../../.env.local", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    APP_ENV: str = "development"
    DATABASE_URL: str | None = None

    # API auth settings.
    AUTH_SECRET_KEY: str = DEV_AUTH_SECRET_KEY
    AUTH_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    AUTH_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    AUTH_ALGORITHM: str = "HS256"

    # Development bootstrap admin used by the API seed script.
    DEV_SEED_ADMIN_EMAIL: str | None = None
    DEV_SEED_ADMIN_PASSWORD: str | None = None
    DEV_SEED_ADMIN_NAME: str = "Admin"

    # Vercel Blob read/write token (server-side uploads + deletes).
    BLOB_READ_WRITE_TOKEN: str | None = None

    # Comma separated list of allowed CORS origins (landing + dashboard).
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @model_validator(mode="after")
    def _validate_database_url(self) -> "Settings":
        self._normalized_database_settings()
        return self

    @property
    def database_url(self) -> str:
        return (self.DATABASE_URL or "").strip()

    @property
    def sqlalchemy_database_url(self) -> str:
        database_url, _ = self._normalized_database_settings()
        return database_url

    @property
    def sqlalchemy_connect_args(self) -> dict[str, Any]:
        _, connect_args = self._normalized_database_settings()
        return connect_args

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def auth_secret_key(self) -> str:
        if self.is_production and self.AUTH_SECRET_KEY == DEV_AUTH_SECRET_KEY:
            raise ValueError("AUTH_SECRET_KEY must be set in production.")
        return self.AUTH_SECRET_KEY

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    def _normalized_database_settings(self) -> tuple[str, dict[str, Any]]:
        if not self.database_url:
            raise ValueError("DATABASE_URL must be set.")

        try:
            url = make_url(self.database_url)
        except Exception as exc:
            raise ValueError("DATABASE_URL must be a valid database URL.") from exc

        if url.drivername == "postgresql":
            url = url.set(drivername=ASYNC_POSTGRES_DRIVER)

        if url.drivername != ASYNC_POSTGRES_DRIVER:
            raise ValueError(
                "DATABASE_URL must use postgresql:// or postgresql+asyncpg://."
            )

        query = dict(url.query)
        connect_args: dict[str, Any] = {}

        sslmode = query.pop("sslmode", None)
        if _requires_ssl(sslmode):
            connect_args["ssl"] = True

        ssl = query.pop("ssl", None)
        if _requires_ssl(ssl):
            connect_args["ssl"] = True

        query.pop("channel_binding", None)
        url = url.set(query=query)

        return url.render_as_string(hide_password=False), connect_args


def _requires_ssl(value: Any) -> bool:
    if isinstance(value, (list, tuple)):
        value = value[0] if value else None

    return str(value).lower() in {
        "1",
        "true",
        "yes",
        "require",
        "required",
        "verify-ca",
        "verify-full",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
