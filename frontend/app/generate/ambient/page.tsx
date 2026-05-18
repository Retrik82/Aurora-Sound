"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { GeneratePanel } from "@/components/ui/GeneratePanel";
import { useSubmitGeneration } from "@/features/generation/useSubmitGeneration";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useI18n } from "@/i18n/i18n";
import { useGenerationStore } from "@/store/generation-store";

const optionGroups = {
  mood: [{ value: "calmness", ru: "Спокойствие" }, { value: "dreamy", ru: "Мечтательность" }, { value: "mysterious", ru: "Таинственность" }, { value: "uplifting", ru: "Воодушевление" }, { value: "melancholy", ru: "Меланхолия" }],
  state: [{ value: "focused", ru: "Сфокусированность" }, { value: "relaxed", ru: "Расслабленность" }, { value: "creative", ru: "Творческий поток" }, { value: "sleepy", ru: "Сонливость" }, { value: "meditative", ru: "Медитативность" }],
  activity: [{ value: "writing", ru: "Письмо" }, { value: "reading", ru: "Чтение" }, { value: "coding", ru: "Программирование" }, { value: "yoga", ru: "Йога" }, { value: "deep work", ru: "Глубокая работа" }],
  weather: [{ value: "rain", ru: "Дождь" }, { value: "mist", ru: "Туман" }, { value: "wind", ru: "Ветер" }, { value: "night city", ru: "Ночной город" }, { value: "forest", ru: "Лес" }],
  environment: [{ value: "warm studio", ru: "Теплая студия" }, { value: "cathedral", ru: "Собор" }, { value: "cozy room", ru: "Уютная комната" }, { value: "mountains", ru: "Горы" }, { value: "seaside", ru: "Побережье" }]
} as const;

export default function AmbientPage() {
  const { locale } = useI18n();
  const [form, setForm] = useState({ mood: ["calmness"], state: ["focused"], activity: ["writing"], weather: ["rain"], environment: ["warm studio"], relaxation_level: 0.7, focus_level: 0.75, sleep_mode: false, piano_amount: 0.25, rain_intensity: 0.72, thunder_rarity: 0.18, warmth: 0.8, binaural_effect: 0.25, duration_seconds: 60 });
  const generationId = useGenerationStore((state) => state.generationIds["/generate/ambient"]);
  const submission = useGenerationStore((state) => state.submissions["/generate/ambient"]);
  const submit = useSubmitGeneration("/generate/ambient");
  const { generation, track } = useGenerationPolling(generationId);
  const loading = Boolean(submission?.isSubmitting) || submit.isPending || Boolean(generation.data && !["completed", "failed"].includes(generation.data.status));
  const set = (key: string, value: string[] | number | boolean) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleOption = (key: "mood" | "state" | "activity" | "weather" | "environment", value: string) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value] }));
  };

  return <GeneratePanel title={locale === "ru" ? "Фоновая музыка" : "Background Music"} eyebrow={locale === "ru" ? "Длинный ambient для работы и отдыха" : "Long-form ambient for focus and rest"} loading={loading} progress={generation.data?.progress} status={generation.data?.status} track={track.data} error={submission?.error ?? submit.error?.message ?? generation.data?.error} onGenerate={() => submit.mutate({ ...form, mood: form.mood.join(", "), state: form.state.join(", "), activity: form.activity.join(", "), weather: form.weather.join(", "), environment: form.environment.join(", ") })}>
    <div className="grid gap-4 md:grid-cols-2">{Object.entries(optionGroups).map(([key, values]) => <Field key={key} label={locale === "ru" ? ({ mood: "Настроение", state: "Состояние", activity: "Активность", weather: "Атмосфера", environment: "Окружение" }[key] ?? key) : key}><div className="flex flex-wrap gap-2">{values.map((item) => <button key={item.value} onClick={() => toggleOption(key as "mood" | "state" | "activity" | "weather" | "environment", item.value)} className={`rounded-full border px-3 py-2 text-xs ${form[key as keyof typeof optionGroups].includes(item.value) ? "border-cyan bg-cyan/15 text-white" : "border-white/10 bg-white/8 text-slate-300"}`}>{locale === "ru" ? item.ru : item.value}</button>)}</div></Field>)}</div>
    {[[locale === "ru" ? "Расслабление" : "Relaxation", "relaxation_level"], [locale === "ru" ? "Фокус" : "Focus", "focus_level"], ["Piano", "piano_amount"], [locale === "ru" ? "Дождь в фоне" : "Background rain", "rain_intensity"], [locale === "ru" ? "Вероятность грома" : "Thunder rarity", "thunder_rarity"], [locale === "ru" ? "Теплота" : "Warmth", "warmth"], ["Binaural", "binaural_effect"]].map(([label, key]) => <Field key={key} label={`${label}: ${Math.round(Number(form[key as keyof typeof form]) * 100)}%`}><input className="range w-full" type="range" min={0} max={1} step={0.01} value={Number(form[key as keyof typeof form])} onChange={(e) => set(String(key), Number(e.target.value))} /></Field>)}
    <Field label={`${locale === "ru" ? "Длительность" : "Duration"}: ${form.duration_seconds}s`}><input className="range w-full" type="range" min={10} max={1200} value={form.duration_seconds} onChange={(e) => set("duration_seconds", Number(e.target.value))} /></Field>
    <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={form.sleep_mode} onChange={(e) => set("sleep_mode", e.target.checked)} /> {locale === "ru" ? "Режим сна" : "Sleep mode"}</label>
  </GeneratePanel>;
}
