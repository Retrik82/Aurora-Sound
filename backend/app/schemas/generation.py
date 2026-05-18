from typing import Literal

from pydantic import BaseModel, Field


GenerationMode = Literal["text", "constructor", "emotion", "reference", "ambient"]
GenerationStatus = Literal["queued", "analyzing", "prompting", "generating", "processing", "completed", "failed"]
SongType = Literal["music", "song"]
SongLanguage = Literal["auto", "en", "ru", "es", "fr", "de", "it", "pt", "ja", "ko", "zh"]


class SongOptionsMixin(BaseModel):
    generation_type: SongType = "music"
    voice: str = "neutral"
    language: SongLanguage = "auto"


class TextGenerationRequest(SongOptionsMixin):
    prompt: str = Field(min_length=3, max_length=2000)
    duration_seconds: int = Field(default=30, ge=5, le=600)
    intensity: float = Field(default=0.6, ge=0, le=1)
    instrumental: bool = True


class ConstructorGenerationRequest(SongOptionsMixin):
    genre: str
    subgenre: str = ""
    bpm: int = Field(default=90, ge=40, le=220)
    key: str = "D minor"
    mood: str = "cinematic"
    energy: float = Field(default=0.6, ge=0, le=1)
    complexity: float = Field(default=0.5, ge=0, le=1)
    instruments: list[str] = []
    vocal_type: str = "instrumental"
    atmosphere: str = "wide atmospheric"
    cinematic_level: float = Field(default=0.7, ge=0, le=1)
    reverb_amount: float = Field(default=0.6, ge=0, le=1)
    texture: str = "analog warm"
    duration_seconds: int = Field(default=45, ge=5, le=600)


class EmotionPoint(BaseModel):
    emotion: str
    intensity: int = Field(ge=1, le=10)
    timeline_position: float = Field(ge=0, le=1)


class EmotionGenerationRequest(SongOptionsMixin):
    points: list[EmotionPoint] = Field(min_length=1, max_length=7)
    duration_seconds: int = Field(default=45, ge=5, le=600)


class ReferenceGenerationRequest(SongOptionsMixin):
    preset_ids: list[str] = []
    notes: str = ""
    duration_seconds: int = Field(default=45, ge=5, le=600)


class AmbientGenerationRequest(BaseModel):
    mood: str = "calm"
    state: str = "focused"
    activity: str = "deep work"
    weather: str = "rain"
    environment: str = "warm studio"
    relaxation_level: float = Field(default=0.7, ge=0, le=1)
    focus_level: float = Field(default=0.6, ge=0, le=1)
    sleep_mode: bool = False
    piano_amount: float = Field(default=0.25, ge=0, le=1)
    rain_intensity: float = Field(default=0.7, ge=0, le=1)
    thunder_rarity: float = Field(default=0.2, ge=0, le=1)
    warmth: float = Field(default=0.7, ge=0, le=1)
    binaural_effect: float = Field(default=0.2, ge=0, le=1)
    duration_seconds: int = Field(default=60, ge=10, le=1800)


class GenerationResponse(BaseModel):
    id: str
    mode: GenerationMode
    status: GenerationStatus
    progress: int
    error: str | None = None
    track_id: str | None = None
