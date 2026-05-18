"use client";

import { useState } from "react";
import { useEffect, useRef } from "react";
import { Field } from "@/components/ui/Field";
import { GeneratePanel } from "@/components/ui/GeneratePanel";
import { useSubmitGeneration } from "@/features/generation/useSubmitGeneration";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useI18n } from "@/i18n/i18n";
import { useGenerationStore } from "@/store/generation-store";

export default function TextToMusicPage() {
  const { locale } = useI18n();
  const defaultPromptEn = "Dark cinematic synthwave with rain, emotional felt piano, and distant analog pads";
  const defaultPromptRu = "Тёмный кинематографичный синтвейв с дождём, эмоциональным фетровым пиано и дальними аналоговыми пэдами";
  const [prompt, setPrompt] = useState(defaultPromptEn);
  const prevLocaleRef = useRef(locale);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState(0.65);
  const [instrumental, setInstrumental] = useState(true);
  const [generationType, setGenerationType] = useState<"music" | "song">("music");
  const [voice, setVoice] = useState("neutral");
  const [language, setLanguage] = useState("auto");
  const voiceOptions = [
    { value: "neutral", ru: "Нейтральный", en: "Neutral" },
    { value: "female airy", ru: "Женский воздушный", en: "Female airy" },
    { value: "female cinematic", ru: "Женский кинематографичный", en: "Female cinematic" },
    { value: "male warm", ru: "Мужской теплый", en: "Male warm" },
    { value: "male deep", ru: "Мужской глубокий", en: "Male deep" },
    { value: "choir soft", ru: "Мягкий хор", en: "Soft choir" },
    { value: "spoken", ru: "Разговорный", en: "Spoken" }
  ];
  const generationId = useGenerationStore((state) => state.generationIds["/generate/text"]);
  const submission = useGenerationStore((state) => state.submissions["/generate/text"]);
  const submit = useSubmitGeneration("/generate/text");
  const { generation, track } = useGenerationPolling(generationId);
  const loading = Boolean(submission?.isSubmitting) || submit.isPending || Boolean(generation.data && !["completed", "failed"].includes(generation.data.status));

  useEffect(() => {
    const prevLocale = prevLocaleRef.current;
    const prevDefault = prevLocale === "ru" ? defaultPromptRu : defaultPromptEn;
    const nextDefault = locale === "ru" ? defaultPromptRu : defaultPromptEn;
    if (prompt === prevDefault || prompt.trim().length === 0) {
      setPrompt(nextDefault);
    }
    prevLocaleRef.current = locale;
  }, [defaultPromptEn, defaultPromptRu, locale, prompt]);

  return (
      <GeneratePanel
      title={locale === "ru" ? "Текст в музыку" : "Text to Music"}
      eyebrow={locale === "ru" ? "Конструктор промпта" : "Prompt composer"}
      loading={loading}
      progress={generation.data?.progress}
      status={generation.data?.status}
      track={track.data}
      error={submission?.error ?? submit.error?.message ?? generation.data?.error}
      onGenerate={() =>
        submit.mutate({
          prompt,
          duration_seconds: duration,
          intensity,
          instrumental,
          generation_type: generationType,
          voice,
          language
        })
      }
    >
      <Field label={locale === "ru" ? "Опишите трек" : "Describe the track"}>
        <textarea className="premium-input min-h-44 w-full rounded-3xl p-5 text-lg" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
      </Field>
      <Field label={`${locale === "ru" ? "Длительность" : "Duration"}: ${duration}s`}><input className="range w-full" type="range" min={5} max={180} value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></Field>
      <Field label={`${locale === "ru" ? "Интенсивность" : "Intensity"}: ${Math.round(intensity * 100)}%`}><input className="range w-full" type="range" min={0} max={1} step={0.01} value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} /></Field>
      <Field label={locale === "ru" ? "Режим генерации" : "Generation mode"}>
        <select className="premium-input w-full rounded-2xl px-4 py-3" value={generationType} onChange={(event) => setGenerationType(event.target.value as "music" | "song")}>
          <option value="music">{locale === "ru" ? "Музыка (без вокала)" : "Music (instrumental)"}</option>
          <option value="song">{locale === "ru" ? "Песня (с вокалом)" : "Song (with vocals)"}</option>
        </select>
      </Field>
      <Field label={locale === "ru" ? "Голос" : "Voice"}>
        <select className="premium-input w-full rounded-2xl px-4 py-3" value={voice} onChange={(event) => setVoice(event.target.value)}>
          {voiceOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.en}</option>)}
        </select>
      </Field>
      <Field label={locale === "ru" ? "Язык" : "Language"}>
        <select className="premium-input w-full rounded-2xl px-4 py-3" value={language} onChange={(event) => setLanguage(event.target.value)}>
          <option value="auto">{locale === "ru" ? "Авто" : "Auto"}</option>
          <option value="en">{locale === "ru" ? "Английский" : "English"}</option>
          <option value="ru">{locale === "ru" ? "Русский" : "Russian"}</option>
          <option value="es">{locale === "ru" ? "Испанский" : "Spanish"}</option>
          <option value="fr">{locale === "ru" ? "Французский" : "French"}</option>
          <option value="de">{locale === "ru" ? "Немецкий" : "German"}</option>
          <option value="it">{locale === "ru" ? "Итальянский" : "Italian"}</option>
          <option value="pt">{locale === "ru" ? "Португальский" : "Portuguese"}</option>
          <option value="ja">{locale === "ru" ? "Японский" : "Japanese"}</option>
          <option value="ko">{locale === "ru" ? "Корейский" : "Korean"}</option>
          <option value="zh">{locale === "ru" ? "Китайский" : "Chinese"}</option>
        </select>
      </Field>
      <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={instrumental} disabled={generationType === "song"} onChange={(event) => setInstrumental(event.target.checked)} /> {locale === "ru" ? "Инструментальный" : "Instrumental"}</label>
    </GeneratePanel>
  );
}
