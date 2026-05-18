from datetime import datetime

from pydantic import BaseModel


class TrackResponse(BaseModel):
    id: str
    title: str
    mode: str
    duration_seconds: int
    public_url: str
    waveform: list[float]
    bpm: float | None
    key: str | None
    mood: str | None
    metadata_json: dict
    created_at: datetime

    model_config = {"from_attributes": True}
