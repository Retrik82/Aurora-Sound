from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, get_current_user
from app.core.database import get_session
from app.schemas.generation import (
    AmbientGenerationRequest,
    ConstructorGenerationRequest,
    EmotionGenerationRequest,
    GenerationResponse,
    ReferenceGenerationRequest,
    TextGenerationRequest,
)
from app.services.generation_service import GenerationService

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post("/text", response_model=GenerationResponse)
async def generate_text(
    payload: TextGenerationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    return await GenerationService(session).create("text", payload.model_dump(), user, background_tasks)


@router.post("/constructor", response_model=GenerationResponse)
async def generate_constructor(
    payload: ConstructorGenerationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    return await GenerationService(session).create("constructor", payload.model_dump(), user, background_tasks)


@router.post("/emotion", response_model=GenerationResponse)
async def generate_emotion(
    payload: EmotionGenerationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    return await GenerationService(session).create("emotion", payload.model_dump(), user, background_tasks)


@router.post("/reference", response_model=GenerationResponse)
async def generate_reference(
    payload: ReferenceGenerationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    return await GenerationService(session).create("reference", payload.model_dump(), user, background_tasks)


@router.post("/ambient", response_model=GenerationResponse)
async def generate_ambient(
    payload: AmbientGenerationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    user: CurrentUser = Depends(get_current_user),
):
    return await GenerationService(session).create("ambient", payload.model_dump(), user, background_tasks)
