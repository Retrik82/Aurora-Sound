import logging

from app.core.database import SessionLocal, create_db
from app.models.generation import Generation
from app.services.pipeline import GenerationPipeline

logger = logging.getLogger(__name__)


async def run_generation_inline(generation_id: str) -> None:
    await create_db()
    async with SessionLocal() as session:
        generation = await session.get(Generation, generation_id)
        if not generation:
            logger.warning("Generation %s was not found", generation_id)
            return
        await GenerationPipeline(session).run(generation)
