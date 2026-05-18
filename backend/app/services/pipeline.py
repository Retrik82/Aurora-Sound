import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.llm.orchestrator import LLMOrchestrator
from app.models.generation import Generation
from app.models.track import Track
from app.music.stable_audio_client import StableAudioClient
from app.soundscape.engine import SoundscapeEngine
from app.storage.local import LocalAudioStorage

logger = logging.getLogger(__name__)


class GenerationPipeline:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.llm = LLMOrchestrator()
        self.stable_audio = StableAudioClient()
        self.soundscape = SoundscapeEngine()
        self.storage = LocalAudioStorage()

    async def run(self, generation: Generation) -> None:
        try:
            await self._set_status(generation, "analyzing", 15)
            profile = await self.llm.create_profile(generation.mode, generation.request_payload)
            generation.llm_profile = profile.model_dump()
            generation.stable_prompt = profile.stable_audio_prompt

            await self._set_status(generation, "generating", 45)
            if generation.mode == "ambient":
                audio_path = await self.soundscape.render(generation.id, generation.request_payload, profile)
            else:
                generation_type = generation.request_payload.get("generation_type", "music")
                voice = generation.request_payload.get("voice", "neutral")
                language = generation.request_payload.get("language", "auto")
                audio_path = await self.stable_audio.generate(
                    generation.id,
                    prompt=profile.stable_audio_prompt,
                    negative_prompt=profile.negative_prompt,
                    duration_seconds=generation.request_payload.get("duration_seconds", 30),
                    generation_type=generation_type,
                    voice=voice,
                    language=language,
                )

            await self._set_status(generation, "processing", 82)
            waveform = self.storage.waveform(audio_path)
            title = self._title_for(generation.mode, profile, generation.request_payload)
            track = Track(
                user_login=generation.user_login,
                title=title,
                mode=generation.mode,
                duration_seconds=generation.request_payload.get("duration_seconds", 30),
                file_path=str(audio_path),
                public_url=self.storage.public_url(audio_path),
                waveform=waveform,
                bpm=float(profile.tempo),
                key=profile.key,
                mood=", ".join(profile.emotional_arc[:3]),
                metadata_json={
                    "profile": profile.model_dump(),
                    "generation_type": generation.request_payload.get("generation_type", "music"),
                    "voice": generation.request_payload.get("voice", "neutral"),
                    "language": generation.request_payload.get("language", "auto"),
                },
            )
            self.session.add(track)
            await self.session.flush()
            generation.track_id = track.id
            await self._set_status(generation, "completed", 100)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Generation failed")
            generation.status = "failed"
            generation.progress = 100
            generation.error = str(exc)
            await self.session.commit()

    async def _set_status(self, generation: Generation, status: str, progress: int) -> None:
        generation.status = status
        generation.progress = progress
        await self.session.commit()

    def _title_for(self, mode: str, profile, payload: dict) -> str:
        llm_title = profile.title.strip()
        if llm_title:
            return llm_title[:160]
        emotions = profile.emotional_arc
        label = " / ".join(emotions[:2]) if emotions else "Generated"
        kind = "Song" if payload.get("generation_type") == "song" else "Music"
        return f"{mode.title()} {kind} - {label.title()}"
