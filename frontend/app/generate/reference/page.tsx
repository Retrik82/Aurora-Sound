"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { GeneratePanel } from "@/components/ui/GeneratePanel";
import { useSubmitGeneration } from "@/features/generation/useSubmitGeneration";
import { mergeTrackProfiles, trackProfiles } from "@/features/reference/trackProfiles";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useI18n } from "@/i18n/i18n";
import { useGenerationStore } from "@/store/generation-store";

export default function ReferencePage() {
  const { locale } = useI18n();
  const [selected, setSelected] = useState([trackProfiles[0].id, trackProfiles[2].id]);
  const defaultNotesEn = "Unify references into one coherent direction with subtle contrast and clean transitions.";
  const defaultNotesRu = "Объедини референсы в единый стиль, сохраняя мягкий контраст и аккуратные переходы.";
  const [notes, setNotes] = useState(defaultNotesEn);
  const [generationType, setGenerationType] = useState<"music" | "song">("music");
  const [voice, setVoice] = useState("neutral");
  const [language, setLanguage] = useState("auto");
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const prevLocaleRef = useRef(locale);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const generationId = useGenerationStore((state) => state.generationIds["/generate/reference"]);
  const submission = useGenerationStore((state) => state.submissions["/generate/reference"]);
  const submit = useSubmitGeneration("/generate/reference");
  const { generation, track } = useGenerationPolling(generationId);
  const loading = Boolean(submission?.isSubmitting) || submit.isPending || Boolean(generation.data && !["completed", "failed"].includes(generation.data.status));
  const merged = mergeTrackProfiles(selected);
  const voiceOptions = [{ value: "neutral", ru: "Нейтральный" }, { value: "female airy", ru: "Женский воздушный" }, { value: "female cinematic", ru: "Женский кинематографичный" }, { value: "male warm", ru: "Мужской теплый" }, { value: "male deep", ru: "Мужской глубокий" }, { value: "choir soft", ru: "Мягкий хор" }, { value: "spoken", ru: "Разговорный" }];

  const onAudioPlay = (trackId: string) => {
    setActiveAudio(trackId);
    Object.entries(audioRefs.current).forEach(([id, node]) => {
      if (id !== trackId && node && !node.paused) {
        node.pause();
        node.currentTime = 0;
      }
    });
  };

  useEffect(() => {
    const prevLocale = prevLocaleRef.current;
    const prevDefault = prevLocale === "ru" ? defaultNotesRu : defaultNotesEn;
    const nextDefault = locale === "ru" ? defaultNotesRu : defaultNotesEn;
    if (notes === prevDefault || notes.trim().length === 0) {
      setNotes(nextDefault);
    }
    prevLocaleRef.current = locale;
  }, [defaultNotesEn, defaultNotesRu, locale, notes]);

  return <GeneratePanel title={locale === "ru" ? "Генерация по референсам" : "Reference Track Generation"} eyebrow={locale === "ru" ? "Синтез стиля" : "Style synthesis"} loading={loading} progress={generation.data?.progress} status={generation.data?.status} track={track.data} error={submission?.error ?? submit.error?.message ?? generation.data?.error} onGenerate={() => submit.mutate({ preset_ids: selected, notes, duration_seconds: 45, generation_type: generationType, voice, language, merged_profile: merged })}>
    <div className="space-y-3">
      {trackProfiles.map((preset) => <div key={preset.id} className={`rounded-2xl border px-4 py-4 ${selected.includes(preset.id) ? "border-cyan bg-cyan/15" : "border-white/10 bg-white/8"}`}>
        <button onClick={() => setSelected((prev) => prev.includes(preset.id) ? prev.filter((item) => item !== preset.id) : [...prev, preset.id])} className="w-full text-left">
          <div className="text-sm font-semibold">{preset.title}</div>
          <div className="mt-1 text-xs text-slate-400">{preset.genre}, {preset.mood}, {preset.bpm} BPM</div>
        </button>
        <audio ref={(node) => { audioRefs.current[preset.id] = node; }} className="mt-3 w-full max-w-full" controls preload="none" onPlay={() => onAudioPlay(preset.id)} onPause={() => activeAudio === preset.id ? setActiveAudio(null) : undefined} src={`/tracks/${encodeURIComponent(preset.fileName)}`} />
      </div>)}
    </div>
    {merged && <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-300">{locale === "ru" ? "Объединенный профиль" : "Merged profile"}: {merged.genre}, {merged.mood}, {merged.texture}, {merged.key}, {merged.bpm} BPM, {Math.round(merged.energy * 100)}% {locale === "ru" ? "энергии" : "energy"}. {merged.modifiers.length > 0 ? `${locale === "ru" ? "Модификаторы" : "Modifiers"}: ${merged.modifiers.join(", ")}.` : ""}</div>}
    <div className="grid gap-4 md:grid-cols-3">
      <Field label={locale === "ru" ? "Режим" : "Mode"}><select className="premium-input w-full rounded-2xl px-4 py-3" value={generationType} onChange={(e) => setGenerationType(e.target.value as "music" | "song")}><option value="music">{locale === "ru" ? "Музыка" : "Music"}</option><option value="song">{locale === "ru" ? "Песня" : "Song"}</option></select></Field>
      <Field label={locale === "ru" ? "Голос" : "Voice"}><select className="premium-input w-full rounded-2xl px-4 py-3" value={voice} onChange={(e) => setVoice(e.target.value)}>{voiceOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.value}</option>)}</select></Field>
      <Field label={locale === "ru" ? "Язык" : "Language"}><select className="premium-input w-full rounded-2xl px-4 py-3" value={language} onChange={(e) => setLanguage(e.target.value)}><option value="auto">{locale === "ru" ? "Авто" : "Auto"}</option><option value="en">{locale === "ru" ? "Английский" : "English"}</option><option value="ru">{locale === "ru" ? "Русский" : "Russian"}</option><option value="es">{locale === "ru" ? "Испанский" : "Spanish"}</option><option value="fr">{locale === "ru" ? "Французский" : "French"}</option><option value="de">{locale === "ru" ? "Немецкий" : "German"}</option></select></Field>
    </div>
    <Field label={locale === "ru" ? "Пометка перед генерацией" : "Pre-generation note"}><textarea className="premium-input min-h-36 w-full rounded-3xl p-5" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
  </GeneratePanel>;
}
