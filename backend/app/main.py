from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_generate import router as generate_router
from app.api.routes_health import router as health_router
from app.api.routes_tracks import router as tracks_router
from app.core.config import settings
from app.core.database import create_db
from app.core.errors import install_error_handlers
from app.core.logging import configure_logging


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    await create_db()
    yield


app = FastAPI(title="Aurora Sound API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
install_error_handlers(app)
app.include_router(health_router)
app.include_router(generate_router)
app.include_router(tracks_router)
settings.audio_storage_dir.mkdir(parents=True, exist_ok=True)
app.mount("/track-file", StaticFiles(directory=settings.audio_storage_dir), name="track-file")
