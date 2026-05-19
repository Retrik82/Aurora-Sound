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
  const currentUser = typeof window === "undefined" ? "" : localStorage.getItem("aurora-auth-user") ?? "";

  useEffect(() => {
    if (!track || !ref.current) return;
    const isMobile = window.innerWidth < 640;
    wavesurfer.current?.destroy();
    wavesurfer.current = WaveSurfer.create({
      container: ref.current,
      waveColor: "rgba(255,255,255,0.22)",
      progressColor: "#67e8f9",
      cursorColor: "#8b5cf6",
      height: isMobile ? 36 : 56,
      barWidth: 2,
      barGap: isMobile ? 1 : 2,
      url: track.public_url
    });
    wavesurfer.current.on("play", () => setPlaying(true));
    wavesurfer.current.on("pause", () => setPlaying(false));
    return () => wavesurfer.current?.destroy();
  }, [track]);

  if (!track) return null;
  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 px-3 pb-2 pt-2 lg:bottom-0 lg:left-72 lg:px-4 lg:pb-4">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl glass p-3 sm:p-4">
      <button onClick={clearTrack} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-slate-200 transition hover:bg-white/20" aria-label={t("player.close")}>
        <X className="h-4 w-4" />
      </button>
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 pr-9 md:flex md:items-center md:gap-3 md:pr-0">
        <button onClick={() => wavesurfer.current?.playPause()} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-ink sm:h-12 sm:w-12">
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{track.title}</div>
          <div ref={ref} className="mt-1 min-w-0 overflow-hidden sm:mt-2" />
        </div>
        <a href={`${API_BASE}/track/${track.id}/download?user=${encodeURIComponent(currentUser)}`} className="col-span-2 inline-flex w-full max-w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold md:w-auto md:py-3">
          <Download className="h-4 w-4" /> {t("player.download")}
        </a>
      </div>
      </div>
    </div>
  );
}
