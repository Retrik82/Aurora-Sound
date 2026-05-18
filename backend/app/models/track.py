from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Track(Base):
    __tablename__ = "tracks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_login: Mapped[str] = mapped_column(String(32), default="legacy", index=True)
    title: Mapped[str] = mapped_column(String(160))
    mode: Mapped[str] = mapped_column(String(32), index=True)
    duration_seconds: Mapped[int] = mapped_column(Integer)
    file_path: Mapped[str] = mapped_column(Text)
    public_url: Mapped[str] = mapped_column(Text)
    waveform: Mapped[list[float]] = mapped_column(JSON, default=list)
    bpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    key: Mapped[str | None] = mapped_column(String(32), nullable=True)
    mood: Mapped[str | None] = mapped_column(String(80), nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
