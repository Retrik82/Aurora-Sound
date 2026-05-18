from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, get_current_user
from app.core.database import get_session
from app.core.errors import AppError
from app.models.generation import Generation
from app.models.track import Track
from app.schemas.generation import GenerationResponse
from app.schemas.track import TrackResponse

router = APIRouter(tags=["tracks"])


@router.get("/account/generation-usage")
async def get_generation_usage(
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    result = await session.execute(
        select(func.count()).select_from(Generation).where(Generation.user_login == user.login)
    )
    used = result.scalar_one()
    remaining = None if user.generation_limit is None else max(user.generation_limit - used, 0)
    return {
        "login": user.login,
        "used": used,
        "limit": user.generation_limit,
        "remaining": remaining,
    }


@router.get("/generation/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: str,
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    generation = await session.get(Generation, generation_id)
    if not generation or generation.user_login != user.login:
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
async def list_tracks(
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    result = await session.execute(select(Track).where(Track.user_login == user.login).order_by(Track.created_at.desc()))
    return result.scalars().all()


@router.get("/track/{track_id}", response_model=TrackResponse)
async def get_track(
    track_id: str,
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    track = await session.get(Track, track_id)
    if not track or track.user_login != user.login:
        raise AppError("Track not found", 404)
    return track


@router.get("/track/{track_id}/download")
async def download_track(
    track_id: str,
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    track = await session.get(Track, track_id)
    if not track or track.user_login != user.login:
        raise AppError("Track not found", 404)
    return FileResponse(track.file_path, media_type="audio/wav", filename=f"{track.title}.wav")
