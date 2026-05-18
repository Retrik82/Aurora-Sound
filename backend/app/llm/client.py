import json

import httpx

from app.core.config import settings


class OpenRouterClient:
    async def complete_json(self, system: str, user: str) -> dict | None:
        if settings.mock_generation:
            return None

        if not settings.openrouter_api_key or settings.openrouter_api_key.startswith("your_"):
            raise RuntimeError("OPENROUTER_API_KEY is not configured for real generation")

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Aurora Sound",
                },
                json={
                    "model": settings.openrouter_model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.35,
                },
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)
