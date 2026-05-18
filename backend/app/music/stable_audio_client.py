from pathlib import Path
from typing import Any
import asyncio

import httpx

from app.core.config import settings
from app.storage.local import LocalAudioStorage


class StableAudioClient:
    def __init__(self):
        self.storage = LocalAudioStorage()

    async def generate(
        self,
        generation_id: str,
        prompt: str,
        negative_prompt: str,
        duration_seconds: int,
        generation_type: str = "music",
        voice: str = "neutral",
        language: str = "auto",
    ) -> Path:
        if settings.mock_generation:
            return self.storage.create_mock_audio(generation_id, duration_seconds, flavor="music")

        if not settings.suno_api_key or settings.suno_api_key.startswith("your_"):
            raise RuntimeError("SUNO_API_KEY is not configured for real generation")

        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(
                f"{settings.suno_base_url.rstrip('/')}/task",
                headers={"Content-Type": "application/json", "x-api-key": settings.suno_api_key},
                json={
                    "model": "suno",
                    "task_type": "music",
                    "input": {
                        "gpt_description_prompt": prompt,
                        "make_instrumental": generation_type == "music",
                    },
                },
            )
            response.raise_for_status()
            payload = response.json()
            self._raise_api_error(payload)
            task_id = self._extract_task_id(payload)
            if not task_id:
                keys = ", ".join(sorted(payload.keys())) if isinstance(payload, dict) else type(payload).__name__
                raise RuntimeError(f"Suno API did not return task id (payload keys: {keys})")

            audio_url = await self._wait_for_audio_url(client, task_id)

            audio_response = await client.get(audio_url)
            audio_response.raise_for_status()
            suffix = "mp3" if ".mp3" in audio_url.lower().split("?")[0] else "wav"
            return self.storage.save_bytes(generation_id, audio_response.content, suffix=suffix)

    async def _wait_for_audio_url(self, client: httpx.AsyncClient, task_id: str) -> str:
        for _ in range(60):
            await asyncio.sleep(5)
            response = await client.get(
                f"{settings.suno_base_url.rstrip('/')}/task/{task_id}",
                headers={"x-api-key": settings.suno_api_key},
            )
            response.raise_for_status()
            payload = response.json()
            self._raise_api_error(payload)

            data = payload.get("data", {}) if isinstance(payload, dict) else {}
            status = data.get("status")
            if status == "success":
                audio_url = self._extract_audio_url(data.get("output"))
                if audio_url:
                    return audio_url
                raise RuntimeError("Suno task succeeded but did not return audio_url")
            if status in {"failure", "timeout"}:
                output = data.get("output") or {}
                reason = output.get("fail_reason") if isinstance(output, dict) else None
                raise RuntimeError(f"Suno task failed: {data.get('error') or reason or status}")

        raise RuntimeError("Suno task timed out while waiting for audio")

    def _extract_task_id(self, payload: Any) -> str | None:
        if not isinstance(payload, dict):
            return None
        data = payload.get("data")
        if isinstance(data, dict) and isinstance(data.get("task_id"), str):
            return data["task_id"]
        if isinstance(payload.get("task_id"), str):
            return payload["task_id"]
        return None

    def _raise_api_error(self, payload: Any) -> None:
        if isinstance(payload, dict) and ("code" in payload or "msg" in payload):
            code = payload.get("code")
            if isinstance(code, int) and code < 400:
                return
            if payload.get("msg"):
                raise RuntimeError(f"Suno API error: code={code} msg={payload.get('msg')}")

    def _extract_audio_url(self, payload: Any) -> str | None:
        known_keys = (
            "audio_url",
            "url",
            "file_url",
            "audioUrl",
            "fileUrl",
            "stream_url",
            "streamUrl",
            "source_url",
            "sourceUrl",
            "download_url",
            "downloadUrl",
        )

        if isinstance(payload, dict):
            for key in known_keys:
                value = payload.get(key)
                if isinstance(value, str) and value.startswith(("http://", "https://")):
                    return value
            for value in payload.values():
                found = self._extract_audio_url(value)
                if found:
                    return found
            return None

        if isinstance(payload, list):
            for item in payload:
                found = self._extract_audio_url(item)
                if found:
                    return found
            return None

        return None
