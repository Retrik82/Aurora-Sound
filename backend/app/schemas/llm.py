from pydantic import BaseModel, Field


class ProductionProfile(BaseModel):
    reverb: str = "large atmospheric"
    texture: str = "analog warmth"
    stereo_width: float = Field(default=0.8, ge=0, le=1)


class SoundDesignProfile(BaseModel):
    rain_density: float = Field(default=0.0, ge=0, le=1)
    vinyl_noise: float = Field(default=0.0, ge=0, le=1)
    ambience_density: float = Field(default=0.5, ge=0, le=1)


class MusicProfile(BaseModel):
    title: str = "Generated Track"
    genre: str
    tempo: int = Field(ge=40, le=220)
    key: str
    energy_curve: list[float]
    emotional_arc: list[str]
    instrumentation: list[str]
    production: ProductionProfile
    sound_design: SoundDesignProfile
    stable_audio_prompt: str
    negative_prompt: str = "low quality, distorted clipping, harsh noise, muddy mix"
