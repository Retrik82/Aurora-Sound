import asyncio
import logging

import dramatiq

from app.core.database import SessionLocal, create_db
from app.models.generation import Generation
from app.services.pipeline import GenerationPipeline
from app.workers.broker import redis_broker  # noqa: F401

logger = logging.getLogger(__name__)


@dramatiq.actor(max_retries=1, time_limit=1000 * 60 * 30)
def run_generation(generation_id: str) -> None:
    asyncio.run(_run_generation(generation_id))


async def _run_generation(generation_id: str) -> None:
    await create_db()
    async with SessionLocal() as session:
        generation = await session.get(Generation, generation_id)
        if not generation:
            logger.warning("Generation %s was not found", generation_id)
            return
        await GenerationPipeline(session).run(generation)
