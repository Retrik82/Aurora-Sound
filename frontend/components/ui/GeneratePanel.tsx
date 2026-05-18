"use client";

import { motion } from "framer-motion";
import { Loader2, Play, WandSparkles } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import type { Track } from "@/services/api";
import { usePlayerStore } from "@/store/player-store";

export function GeneratePanel({
  title,
  eyebrow,
  children,
  onGenerate,
  loading,
  progress,
  status,
  track,
  error
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  onGenerate: () => void;
  loading: boolean;
  progress?: number;
  status?: string;
  track?: Track;
  error?: string | null;
}) {
  const setTrack = usePlayerStore((state) => state.setTrack);
  const { t } = useI18n();
  const resolvedStatus = status ? t(`status.${status}`) : t("panel.ready");
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="glass rounded-[2rem] p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>
        <div className="mt-8 space-y-6">{children}</div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-semibold text-ink transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <WandSparkles className="h-5 w-5" />}
          {t("panel.generate")}
        </button>
      </div>
      <div className="glass rounded-[2rem] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-slate-400">{t("panel.generation")}</div>
            <div className="mt-2 text-2xl font-semibold">{resolvedStatus}</div>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
            <WandSparkles className="h-6 w-6 text-cyan" />
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-aurora to-cyan transition-all" style={{ width: `${progress ?? 0}%` }} />
        </div>
        {error ? <p className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p> : null}
        {track ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-xl font-semibold">{track.title}</div>
            <div className="mt-2 text-sm text-slate-400">{track.bpm} BPM · {track.key} · {track.mood}</div>
            <div className="mt-5 flex h-20 items-end gap-1">
              {track.waveform.map((value, index) => (
                <div key={index} className="flex-1 rounded-full bg-cyan/70" style={{ height: `${Math.max(8, value * 76)}px` }} />
              ))}
            </div>
            <button onClick={() => setTrack(track)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-aurora px-4 py-3 text-sm font-semibold">
              <Play className="h-4 w-4" /> {t("panel.openPlayer")}
            </button>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-8 text-center text-slate-400">{t("panel.waveformPlaceholder")}</div>
        )}
      </div>
    </motion.section>
  );
}
