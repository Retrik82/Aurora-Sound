import json

from app.llm.client import OpenRouterClient
from app.llm.prompts import MUSIC_SYSTEM_PROMPT
from app.schemas.llm import MusicProfile, ProductionProfile, SoundDesignProfile


class LLMOrchestrator:
    def __init__(self):
        self.client = OpenRouterClient()

    async def create_profile(self, mode: str, payload: dict) -> MusicProfile:
        user = self._build_user_prompt(mode, payload)
        data = await self.client.complete_json(MUSIC_SYSTEM_PROMPT, user)
        if data:
            return MusicProfile.model_validate(data)
        return self._mock_profile(mode, payload)

    def _build_user_prompt(self, mode: str, payload: dict) -> str:
        return json.dumps(
            {
                "mode": mode,
                "input": payload,
                "required_json_schema": {
                    "title": "short original track title, string up to 160 characters",
                    "genre": "string",
                    "tempo": "integer 40-220",
                    "key": "string",
                    "energy_curve": "array of floats 0-1",
                    "emotional_arc": "array of emotion strings",
                    "instrumentation": "array of instrument strings",
                    "production": {"reverb": "string", "texture": "string", "stereo_width": "float 0-1"},
                    "sound_design": {
                        "rain_density": "float 0-1",
                        "vinyl_noise": "float 0-1",
                        "ambience_density": "float 0-1",
                    },
                    "stable_audio_prompt": "string",
                    "negative_prompt": "string",
                },
            },
            ensure_ascii=False,
        )

    def _mock_profile(self, mode: str, payload: dict) -> MusicProfile:
        prompt = payload.get("prompt") or payload.get("mood") or payload.get("genre") or "cinematic ambient"
        duration = payload.get("duration_seconds", 30)
        emotions = self._emotions(mode, payload)
        genre = payload.get("genre", "ambient cinematic")
        tempo = int(payload.get("bpm", 82 if mode == "ambient" else 96))
        instruments = payload.get("instruments") or ["felt piano", "warm synth pads", "soft strings"]
        generation_type = payload.get("generation_type", "music")
        voice = payload.get("voice", "neutral")
        language = payload.get("language", "auto")
        vocal_note = (
            f"vocal performance, {voice} voice, lyrics language: {language}"
            if generation_type == "song"
            else "instrumental arrangement"
        )
        stable_prompt = (
            f"{genre}, {prompt}, emotional arc: {', '.join(emotions)}, "
            f"{tempo} BPM, expansive stereo image, premium cinematic production, "
            f"{', '.join(instruments)}, {vocal_note}, evolving over {duration} seconds, clean mix, atmospheric depth"
        )
        return MusicProfile(
            title=self._mock_title(mode, generation_type, emotions),
            genre=genre,
            tempo=tempo,
            key=payload.get("key", "D minor"),
            energy_curve=[0.2, payload.get("intensity", payload.get("energy", 0.55)), 0.78],
            emotional_arc=emotions,
            instrumentation=instruments,
            production=ProductionProfile(
                reverb="large atmospheric",
                texture=payload.get("texture", "analog tape warmth"),
                stereo_width=0.84,
            ),
            sound_design=SoundDesignProfile(
                rain_density=payload.get("rain_intensity", 0.25),
                vinyl_noise=0.12,
                ambience_density=0.7,
            ),
            stable_audio_prompt=stable_prompt,
        )

    def _emotions(self, mode: str, payload: dict) -> list[str]:
        if mode == "emotion":
            return [point["emotion"] for point in sorted(payload["points"], key=lambda item: item["timeline_position"])]
        if mode == "ambient":
            return [payload.get("mood", "calmness"), payload.get("state", "focus"), "warmth"]
        return [payload.get("mood", "nostalgia"), "tension", "hope"]

    def _mock_title(self, mode: str, generation_type: str, emotions: list[str]) -> str:
        label = " ".join(emotions[:2]) if emotions else "Generated"
        kind = "Song" if generation_type == "song" else "Music"
        return f"{mode.title()} {kind}: {label.title()}"
