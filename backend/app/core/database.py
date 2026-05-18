from collections.abc import AsyncIterator

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(settings.database_url, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def create_db() -> None:
    from app.models.generation import Generation  # noqa: F401
    from app.models.track import Track  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_ensure_owner_columns)


def _ensure_owner_columns(conn) -> None:
    inspector = inspect(conn)
    for table_name in ("generations", "tracks"):
        columns = {column["name"] for column in inspector.get_columns(table_name)}
        if "user_login" not in columns:
            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN user_login VARCHAR(32) NOT NULL DEFAULT 'legacy'"))


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
