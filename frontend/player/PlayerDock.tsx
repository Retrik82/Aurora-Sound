"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Download, Pause, Play, X } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { API_BASE } from "@/services/api";
import { usePlayerStore } from "@/store/player-store";

export function PlayerDock() {
  const track = usePlayerStore((state) => state.track);
  const clearTrack = usePlayerStore((state) => state.clearTrack);
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!track || !ref.current) return;
    wavesurfer.current?.destroy();
    wavesurfer.current = WaveSurfer.create({
      container: ref.current,
      waveColor: "rgba(255,255,255,0.22)",
      progressColor: "#67e8f9",
      cursorColor: "#8b5cf6",
      height: 56,
      barWidth: 2,
      barGap: 2,
      url: track.public_url
    });
    wavesurfer.current.on("play", () => setPlaying(true));
    wavesurfer.current.on("pause", () => setPlaying(false));
    return () => wavesurfer.current?.destroy();
  }, [track]);

  if (!track) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 lg:left-72">
      <div className="relative mx-auto max-w-7xl rounded-3xl glass p-4">
      <button onClick={clearTrack} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-slate-200 transition hover:bg-white/20" aria-label={t("player.close")}>
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <button onClick={() => wavesurfer.current?.playPause()} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-ink">
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{track.title}</div>
          <div ref={ref} className="mt-2" />
        </div>
        <a href={`${API_BASE}/track/${track.id}/download`} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold">
          <Download className="h-4 w-4" /> {t("player.download")}
        </a>
      </div>
      </div>
    </div>
  );
}
