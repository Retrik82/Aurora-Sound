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
    <section className="glass rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan sm:text-sm sm:tracking-[0.35em]">{t("library.generated")}</p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">{t("library.title")}</h1>
      {isLoading ? <p className="mt-8 text-slate-400">{t("library.loading")}</p> : null}
      {error ? <p className="mt-8 text-red-200">{error.message}</p> : null}
      <div className="mt-8 grid gap-4">
        {data?.map((track) => <article key={track.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-xl font-semibold">{track.title}</h2><p className="mt-1 text-sm text-slate-400">{t(`modeLabel.${track.mode}`)} · {track.duration_seconds}s · {track.bpm} BPM · {track.key}</p></div>
            <button onClick={() => setTrack(track)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink md:w-auto"><Play className="h-4 w-4" /> {t("library.play")}</button>
          </div>
          <div className="mt-5 flex h-16 items-end gap-1">{track.waveform.map((value, index) => <div key={index} className="flex-1 rounded-full bg-gradient-to-t from-aurora to-cyan" style={{ height: `${Math.max(6, value * 60)}px` }} />)}</div>
        </article>)}
      </div>
    </section>
  );
}
