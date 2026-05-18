from pathlib import Path
import math
import random
import struct
import wave

from app.core.config import settings


class LocalAudioStorage:
    sample_rate = 44100

    def __init__(self):
        settings.audio_storage_dir.mkdir(parents=True, exist_ok=True)

    def path_for(self, generation_id: str, suffix: str = "wav") -> Path:
        return settings.audio_storage_dir / f"{generation_id}.{suffix}"

    def save_bytes(self, generation_id: str, content: bytes, suffix: str = "wav") -> Path:
        path = self.path_for(generation_id, suffix)
        path.write_bytes(content)
        return path

    def public_url(self, path: Path) -> str:
        return f"{settings.backend_public_url}/track-file/{path.name}"

    def create_mock_audio(self, generation_id: str, duration_seconds: int, flavor: str) -> Path:
        seconds = max(3, min(duration_seconds, 180))
        base = 110 if flavor == "ambient" else 220
        path = self.path_for(generation_id)
        rng = random.Random(generation_id)
        frame_count = self.sample_rate * seconds
        with wave.open(str(path), "wb") as wav:
            wav.setnchannels(2)
            wav.setsampwidth(2)
            wav.setframerate(self.sample_rate)
            frames = bytearray()
            for i in range(frame_count):
                t = i / self.sample_rate
                fade_in = min(1.0, t / 2.0)
                fade_out = min(1.0, (seconds - t) / 2.0)
                envelope = max(0.0, min(fade_in, fade_out))
                pad = 0.18 * math.sin(2 * math.pi * base * t)
                pad += 0.11 * math.sin(2 * math.pi * base * 1.5 * t)
                shimmer_freq = base * 4 + 8 * math.sin(t * 0.2)
                shimmer = 0.04 * math.sin(2 * math.pi * shimmer_freq * t)
                noise = 0.015 * rng.uniform(-1, 1)
                mono = max(-1.0, min(1.0, (pad + shimmer + noise) * envelope))
                left = int(mono * 32767)
                right = int(mono * (0.92 + 0.06 * math.sin(t * 0.4)) * 32767)
                frames.extend(struct.pack("<hh", left, right))
            wav.writeframes(frames)
        return path

    def waveform(self, path: Path, points: int = 96) -> list[float]:
        try:
            with wave.open(str(path), "rb") as wav:
                frames = wav.readframes(wav.getnframes())
                samples = struct.unpack(f"<{len(frames) // 2}h", frames)
                if wav.getnchannels() > 1:
                    data = [abs((samples[i] + samples[i + 1]) / 2) for i in range(0, len(samples) - 1, 2)]
                else:
                    data = [abs(sample) for sample in samples]
        except Exception:
            return [0.2] * points
        if not data:
            return [0.2] * points
        chunk_size = max(1, len(data) // points)
        peaks = []
        for index in range(points):
            chunk = data[index * chunk_size : (index + 1) * chunk_size]
            peaks.append((max(chunk) / 32767) if chunk else 0)
        top = max(peaks) or 1
        return [round(value / top, 3) for value in peaks]
