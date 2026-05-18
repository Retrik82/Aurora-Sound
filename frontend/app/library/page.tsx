"use client";

import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { listTracks } from "@/services/api";
import { usePlayerStore } from "@/store/player-store";

export default function LibraryPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["tracks"], queryFn: listTracks });
  const setTrack = usePlayerStore((state) => state.setTrack);
  const { t } = useI18n();
  return (
    <section className="glass rounded-[2rem] p-6 md:p-8">
      <p className="text-sm uppercase tracking-[0.35em] text-cyan">{t("library.generated")}</p>
      <h1 className="mt-4 text-5xl font-semibold">{t("library.title")}</h1>
      {isLoading ? <p className="mt-8 text-slate-400">{t("library.loading")}</p> : null}
      {error ? <p className="mt-8 text-red-200">{error.message}</p> : null}
      <div className="mt-8 grid gap-4">
        {data?.map((track) => <article key={track.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-xl font-semibold">{track.title}</h2><p className="mt-1 text-sm text-slate-400">{t(`modeLabel.${track.mode}`)} · {track.duration_seconds}s · {track.bpm} BPM · {track.key}</p></div>
            <button onClick={() => setTrack(track)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink"><Play className="h-4 w-4" /> {t("library.play")}</button>
          </div>
          <div className="mt-5 flex h-16 items-end gap-1">{track.waveform.map((value, index) => <div key={index} className="flex-1 rounded-full bg-gradient-to-t from-aurora to-cyan" style={{ height: `${Math.max(6, value * 60)}px` }} />)}</div>
        </article>)}
      </div>
    </section>
  );
}
