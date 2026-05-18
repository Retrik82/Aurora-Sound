from pathlib import Path
from array import array
import math
import os
import random
import shutil
import subprocess
import sys
import wave

from app.music.stable_audio_client import StableAudioClient
from app.schemas.llm import MusicProfile
from app.storage.local import LocalAudioStorage


class SoundscapeEngine:
    source_duration_seconds = 80
    segment_count = 15
    crossfade_seconds = 5

    def __init__(self):
        self.storage = LocalAudioStorage()
        self.generator = StableAudioClient()

    async def render(self, generation_id: str, payload: dict, profile: MusicProfile) -> Path:
        duration = payload.get("duration_seconds", 60)
        source_path = await self.generator.generate(
            f"{generation_id}-source",
            prompt=self._source_prompt(payload, profile),
            negative_prompt=profile.negative_prompt,
            duration_seconds=self.source_duration_seconds,
        )
        return self._cut_rearrange_and_stitch(generation_id, source_path, duration)

    def _source_prompt(self, payload: dict, profile: MusicProfile) -> str:
        weather = payload.get("weather", "rain")
        environment = payload.get("environment", "warm studio")
        rain_intensity = payload.get("rain_intensity", 0.7)
        return (
            f"{profile.stable_audio_prompt}. Create a seamless ambient melodic source bed for long-form looping: "
            f"mood {payload.get('mood', 'calm')}, weather {weather}, environment {environment}, "
            f"rain layer intensity {rain_intensity:.0%}, no hard ending, no fade out, "
            "slow evolving texture, soft melody, clean mix, stable tonal center."
        )

    def _cut_rearrange_and_stitch(self, generation_id: str, source_path: Path, duration_seconds: int) -> Path:
        source_path = self._ensure_wav_source(generation_id, source_path)

        with wave.open(str(source_path), "rb") as source:
            channels = source.getnchannels()
            sample_width = source.getsampwidth()
            frame_rate = source.getframerate()
            frame_count = source.getnframes()
            frames = source.readframes(frame_count)

        if sample_width != 2:
            raise RuntimeError("Ambient stitching supports 16-bit WAV source audio")

        source_samples = array("h")
        source_samples.frombytes(frames)
        if sys.byteorder != "little":
            source_samples.byteswap()
        segment_frames = max(1, frame_count // self.segment_count)
        segments = []
        for index in range(self.segment_count):
            start = index * segment_frames * channels
            end = (index + 1) * segment_frames * channels if index < self.segment_count - 1 else len(source_samples)
            segment = source_samples[start:end]
            if segment:
                segments.append(segment)

        rng = random.Random(generation_id)
        ordered_segments = self._ordered_segments(segments, rng)
        target_samples = max(1, duration_seconds * frame_rate * channels)
        crossfade_samples = min(self.crossfade_seconds * frame_rate * channels, max(0, min(len(item) for item in segments) // 3))

        output = array("h")
        index = 0
        while len(output) < target_samples + crossfade_samples:
            segment = ordered_segments[index % len(ordered_segments)]
            output = self._append_with_crossfade(output, segment, crossfade_samples, channels)
            index += 1

        output = self._fade_edges(output[:target_samples], frame_rate, channels)
        output_path = self.storage.path_for(generation_id)
        with wave.open(str(output_path), "wb") as result:
            result.setnchannels(channels)
            result.setsampwidth(sample_width)
            result.setframerate(frame_rate)
            result.writeframes(output.tobytes())
        return output_path

    def _ensure_wav_source(self, generation_id: str, source_path: Path) -> Path:
        if source_path.suffix.lower() != ".wav":
            ffmpeg = self._find_ffmpeg()
            if not ffmpeg:
                raise RuntimeError(
                    "Ambient source audio is MP3, but ffmpeg is not installed. "
                    "Install ffmpeg or configure the generator to return WAV."
                )
            converted_path = self.storage.path_for(f"{generation_id}-source-converted")
            subprocess.run(
                [
                    ffmpeg,
                    "-y",
                    "-i",
                    str(source_path),
                    "-acodec",
                    "pcm_s16le",
                    "-ac",
                    "2",
                    "-ar",
                    "44100",
                    str(converted_path),
                ],
                check=True,
                capture_output=True,
            )
            return converted_path
        return source_path

    def _find_ffmpeg(self) -> str | None:
        ffmpeg = shutil.which("ffmpeg")
        if ffmpeg:
            return ffmpeg

        local_app_data = os.environ.get("LOCALAPPDATA")
        if not local_app_data:
            return None

        winget_root = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
        if not winget_root.exists():
            return None

        matches = sorted(winget_root.glob("Gyan.FFmpeg_*/*/bin/ffmpeg.exe"))
        return str(matches[-1]) if matches else None

    def _ordered_segments(self, segments: list[array], rng: random.Random) -> list[array]:
        order = list(range(len(segments)))
        rng.shuffle(order)
        reversed_order = list(reversed(order[::2])) + order[1::2]
        return [segments[index] for index in order + reversed_order]

    def _append_with_crossfade(
        self,
        output: array,
        segment: array,
        crossfade_samples: int,
        channels: int,
    ) -> array:
        if not output or crossfade_samples <= channels:
            output.extend(segment)
            return output

        crossfade_samples -= crossfade_samples % channels
        crossfade_samples = min(crossfade_samples, len(output), len(segment))
        if crossfade_samples <= channels:
            output.extend(segment)
            return output

        head = output[:-crossfade_samples]
        tail = output[-crossfade_samples:]
        fade = array("h")
        fade_frames = crossfade_samples // channels
        for frame in range(fade_frames):
            progress = frame / max(1, fade_frames - 1)
            out_gain = math.cos(progress * math.pi / 2)
            in_gain = math.sin(progress * math.pi / 2)
            for channel in range(channels):
                sample_index = frame * channels + channel
                value = round(tail[sample_index] * out_gain + segment[sample_index] * in_gain)
                fade.append(max(-32768, min(32767, value)))
        head.extend(fade)
        head.extend(segment[crossfade_samples:])
        return head

    def _fade_edges(self, samples: array, frame_rate: int, channels: int) -> array:
        fade_samples = min(2 * frame_rate * channels, len(samples) // 4)
        fade_samples -= fade_samples % channels
        if fade_samples <= channels:
            return samples

        result = samples[:]
        fade_frames = fade_samples // channels
        for frame in range(fade_frames):
            gain = frame / max(1, fade_frames - 1)
            for channel in range(channels):
                start = frame * channels + channel
                end = len(result) - fade_samples + frame * channels + channel
                result[start] = round(result[start] * gain)
                result[end] = round(result[end] * (1 - gain))
        return result
