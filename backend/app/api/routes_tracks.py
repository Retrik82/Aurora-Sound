from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.errors import AppError
from app.models.generation import Generation
from app.models.track import Track
from app.schemas.generation import GenerationResponse
from app.schemas.track import TrackResponse

router = APIRouter(tags=["tracks"])


@router.get("/generation/{generation_id}", response_model=GenerationResponse)
async def get_generation(generation_id: str, session: AsyncSession = Depends(get_session)):
    generation = await session.get(Generation, generation_id)
    if not generation:
        raise AppError("Generation not found", 404)
    return GenerationResponse(
        id=generation.id,
        mode=generation.mode,
        status=generation.status,
        progress=generation.progress,
        error=generation.error,
        track_id=generation.track_id,
    )


@router.get("/tracks", response_model=list[TrackResponse])
async def list_tracks(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Track).order_by(Track.created_at.desc()))
    return result.scalars().all()


@router.get("/track/{track_id}", response_model=TrackResponse)
async def get_track(track_id: str, session: AsyncSession = Depends(get_session)):
    track = await session.get(Track, track_id)
    if not track:
        raise AppError("Track not found", 404)
    return track


@router.get("/track/{track_id}/download")
async def download_track(track_id: str, session: AsyncSession = Depends(get_session)):
    track = await session.get(Track, track_id)
    if not track:
        raise AppError("Track not found", 404)
    return FileResponse(track.file_path, media_type="audio/wav", filename=f"{track.title}.wav")
