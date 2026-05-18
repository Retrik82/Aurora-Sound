"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { GeneratePanel } from "@/components/ui/GeneratePanel";
import { EmotionMap, emotionRu, type EmotionPoint } from "@/features/emotion-map/EmotionMap";
import { useSubmitGeneration } from "@/features/generation/useSubmitGeneration";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useI18n } from "@/i18n/i18n";
import { useGenerationStore } from "@/store/generation-store";

export default function EmotionPage() {
  const { locale } = useI18n();
  const [points, setPoints] = useState<EmotionPoint[]>([{ id: "1", emotion: "loneliness", intensity: 4, timeline_position: 0 }, { id: "2", emotion: "hope", intensity: 3, timeline_position: 1 }]);
  const [duration, setDuration] = useState(45);
  const [generationType, setGenerationType] = useState<"music" | "song">("music");
  const [voice, setVoice] = useState("neutral");
  const [language, setLanguage] = useState("auto");
  const generationId = useGenerationStore((state) => state.generationIds["/generate/emotion"]);
  const submission = useGenerationStore((state) => state.submissions["/generate/emotion"]);
  const submit = useSubmitGeneration("/generate/emotion");
  const { generation, track } = useGenerationPolling(generationId);
  const loading = Boolean(submission?.isSubmitting) || submit.isPending || Boolean(generation.data && !["completed", "failed"].includes(generation.data.status));
  const voiceOptions = [{ value: "neutral", ru: "Нейтральный" }, { value: "female airy", ru: "Женский воздушный" }, { value: "female cinematic", ru: "Женский кинематографичный" }, { value: "male warm", ru: "Мужской теплый" }, { value: "male deep", ru: "Мужской глубокий" }, { value: "choir soft", ru: "Мягкий хор" }, { value: "spoken", ru: "Разговорный" }];
  return (
    <GeneratePanel title={locale === "ru" ? "Карта эмоций" : "Emotion Map"} eyebrow={locale === "ru" ? "Колесо в стиле Беркли" : "Berkeley-inspired wheel"} loading={loading} progress={generation.data?.progress} status={generation.data?.status} track={track.data} error={submission?.error ?? submit.error?.message ?? generation.data?.error} onGenerate={() => submit.mutate({ points, duration_seconds: duration, generation_type: generationType, voice, language })}>
      <EmotionMap points={points} onChange={setPoints} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={locale === "ru" ? "Режим" : "Mode"}><select className="premium-input w-full rounded-2xl px-4 py-3" value={generationType} onChange={(e) => setGenerationType(e.target.value as "music" | "song")}><option value="music">{locale === "ru" ? "Музыка" : "Music"}</option><option value="song">{locale === "ru" ? "Песня" : "Song"}</option></select></Field>
        <Field label={locale === "ru" ? "Голос" : "Voice"}><select className="premium-input w-full rounded-2xl px-4 py-3" value={voice} onChange={(e) => setVoice(e.target.value)}>{voiceOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.value}</option>)}</select></Field>
        <Field label={locale === "ru" ? "Язык" : "Language"}><select className="premium-input w-full rounded-2xl px-4 py-3" value={language} onChange={(e) => setLanguage(e.target.value)}><option value="auto">{locale === "ru" ? "Авто" : "Auto"}</option><option value="en">{locale === "ru" ? "Английский" : "English"}</option><option value="ru">{locale === "ru" ? "Русский" : "Russian"}</option><option value="es">{locale === "ru" ? "Испанский" : "Spanish"}</option><option value="fr">{locale === "ru" ? "Французский" : "French"}</option><option value="de">{locale === "ru" ? "Немецкий" : "German"}</option></select></Field>
      </div>
      <Field label={`${locale === "ru" ? "Длительность" : "Duration"}: ${duration}s`}><input className="range w-full" type="range" min={10} max={180} value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></Field>
      <div className="space-y-3">
        {points.map((point) => <div key={point.id} className="grid gap-3 rounded-2xl bg-white/8 p-4 md:grid-cols-3"><span>{locale === "ru" ? (emotionRu[point.emotion] ?? point.emotion) : point.emotion}</span><input className="range" type="range" min={1} max={10} value={point.intensity} onChange={(e) => setPoints(points.map((p) => p.id === point.id ? { ...p, intensity: Number(e.target.value) } : p))} /><input className="range" type="range" min={0} max={1} step={0.01} value={point.timeline_position} onChange={(e) => setPoints(points.map((p) => p.id === point.id ? { ...p, timeline_position: Number(e.target.value) } : p))} /></div>)}
      </div>
    </GeneratePanel>
  );
}
