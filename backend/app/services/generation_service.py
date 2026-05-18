from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.auth import CurrentUser
from app.core.errors import AppError
from app.models.generation import Generation
from app.schemas.generation import GenerationResponse


class GenerationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, mode: str, payload: dict, user: CurrentUser, background_tasks=None) -> GenerationResponse:
        if user.generation_limit is not None:
            result = await self.session.execute(
                select(func.count()).select_from(Generation).where(Generation.user_login == user.login)
            )
            used = result.scalar_one()
            if used >= user.generation_limit:
                raise AppError(f"Лимит генераций исчерпан: {user.generation_limit}", 429)

        generation = Generation(user_login=user.login, mode=mode, request_payload=payload, status="queued", progress=3)
        self.session.add(generation)
        await self.session.commit()
        await self.session.refresh(generation)
        if settings.local_inline_jobs:
            if background_tasks is None:
                raise RuntimeError("BackgroundTasks is required when LOCAL_INLINE_JOBS=true")
            from app.workers.inline import run_generation_inline

            background_tasks.add_task(run_generation_inline, generation.id)
        else:
            from app.workers.tasks import run_generation

            run_generation.send(generation.id)
        return GenerationResponse(
            id=generation.id,
            mode=generation.mode,
            status=generation.status,
            progress=generation.progress,
            error=generation.error,
            track_id=generation.track_id,
        )
