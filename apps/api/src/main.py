# Stdlib
from contextlib import asynccontextmanager

# Third-party
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Local
from core.env import settings
from core.db import engine
from routers import (
    auth,
    categories,
    contact_requests,
    player_media,
    players,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(title="DTM API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(players.router)
app.include_router(player_media.router)
app.include_router(categories.router)
app.include_router(users.router)
app.include_router(contact_requests.router)
