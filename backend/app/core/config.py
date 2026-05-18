from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-4o-mini"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    suno_api_key: str = Field(default="", validation_alias=AliasChoices("SUNO_API_KEY", "STABLE_AUDIO_API_KEY"))
    suno_base_url: str = Field(
        default="https://sunor.cc/api/v1",
        validation_alias=AliasChoices("SUNO_BASE_URL", "STABLE_AUDIO_BASE_URL"),
    )
    mock_generation: bool = True
    local_inline_jobs: bool = True

    database_url: str = "sqlite+aiosqlite:///./app.db"
    redis_url: str = "redis://localhost:6379/0"
    audio_storage_dir: Path = Path("./storage/audio")
    soundscape_assets_dir: Path = Path("./assets/soundscape")
    backend_public_url: str = "http://localhost:8000"
    cors_origins_raw: str = Field(default="http://localhost:3000", alias="BACKEND_CORS_ORIGINS")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
