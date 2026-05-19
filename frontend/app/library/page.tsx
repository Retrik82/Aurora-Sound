"use client";

import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { listTracks } from "@/services/api";
import { usePlayerStore } from "@/store/player-store";

export default function LibraryPage() {
  const currentUser = typeof window === "undefined" ? "" : localStorage.getItem("aurora-auth-user");
  const { data, isLoading, error } = useQuery({ queryKey: ["tracks", currentUser], queryFn: listTracks });
  const setTrack = usePlayerStore((state) => state.setTrack);
  const { t } = useI18n();
  return (
    <section className="glass min-w-0 overflow-hidden rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan sm:text-sm sm:tracking-[0.35em]">{t("library.generated")}</p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">{t("library.title")}</h1>
      {isLoading ? <p className="mt-8 text-slate-400">{t("library.loading")}</p> : null}
      {error ? <p className="mt-8 text-red-200">{error.message}</p> : null}
      <div className="mt-6 grid min-w-0 gap-4 sm:mt-8">
        {data?.map((track) => <article key={track.id} className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0"><h2 className="truncate text-lg font-semibold sm:text-xl">{track.title}</h2><p className="mt-1 truncate text-sm text-slate-400">{t(`modeLabel.${track.mode}`)} · {track.duration_seconds}s · {track.bpm} BPM · {track.key}</p></div>
            <button onClick={() => setTrack(track)} className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink md:w-auto"><Play className="h-4 w-4 shrink-0" /> {t("library.play")}</button>
          </div>
          <div className="mt-4 flex h-10 min-w-0 items-end gap-0.5 overflow-hidden sm:h-14 sm:gap-1">{track.waveform.map((value, index) => <div key={index} className="min-w-0 flex-1 rounded-full bg-gradient-to-t from-aurora to-cyan" style={{ height: `${Math.max(5, value * 48)}px` }} />)}</div>
        </article>)}
      </div>
    </section>
  );
}
