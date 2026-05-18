"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { GeneratePanel } from "@/components/ui/GeneratePanel";
import { useSubmitGeneration } from "@/features/generation/useSubmitGeneration";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useI18n } from "@/i18n/i18n";
import { useGenerationStore } from "@/store/generation-store";

const genreOptions = [{ value: "ambient", ru: "Эмбиент" }, { value: "cinematic", ru: "Кинематографичный" }, { value: "synthwave", ru: "Синтвейв" }, { value: "indie pop", ru: "Инди-поп" }, { value: "hip-hop", ru: "Хип-хоп" }, { value: "rock", ru: "Рок" }, { value: "electronic", ru: "Электроника" }, { value: "orchestral", ru: "Оркестровый" }];
const subgenreOptions = [{ value: "neo-noir", ru: "Нео-нуар" }, { value: "dream pop", ru: "Дрим-поп" }, { value: "lo-fi", ru: "Лоу-фай" }, { value: "trap", ru: "Трэп" }, { value: "post-rock", ru: "Пост-рок" }, { value: "industrial", ru: "Индастриал" }, { value: "afrobeat", ru: "Афробит" }, { value: "minimal", ru: "Минимал" }];
const keyOptions = [{ value: "C major", ru: "До мажор" }, { value: "A minor", ru: "Ля минор" }, { value: "D minor", ru: "Ре минор" }, { value: "E minor", ru: "Ми минор" }, { value: "F major", ru: "Фа мажор" }, { value: "G minor", ru: "Соль минор" }, { value: "B minor", ru: "Си минор" }];
const moodOptions = [{ value: "nostalgia", ru: "Ностальгия" }, { value: "melancholy", ru: "Меланхолия" }, { value: "uplifting", ru: "Воодушевление" }, { value: "tense", ru: "Напряжение" }, { value: "confident", ru: "Уверенность" }, { value: "mysterious", ru: "Таинственность" }, { value: "warm", ru: "Теплота" }];
const textureOptions = [{ value: "analog tape", ru: "Аналоговая лента" }, { value: "clean digital", ru: "Чистый цифровой" }, { value: "dusty vinyl", ru: "Пыльный винил" }, { value: "wide reverb", ru: "Широкий реверб" }, { value: "granular", ru: "Гранулярный" }, { value: "live room", ru: "Живая комната" }];
const voiceOptions = [{ value: "neutral", ru: "Нейтральный" }, { value: "female airy", ru: "Женский воздушный" }, { value: "female cinematic", ru: "Женский кинематографичный" }, { value: "male warm", ru: "Мужской теплый" }, { value: "male deep", ru: "Мужской глубокий" }, { value: "choir soft", ru: "Мягкий хор" }, { value: "spoken", ru: "Разговорный" }];

export default function BuilderPage() {
  const { locale } = useI18n();
  const [form, setForm] = useState({ genre: "ambient", subgenre: "neo-noir", bpm: 86, key: "D minor", mood: "nostalgia", energy: 0.55, complexity: 0.5, vocal_type: "instrumental", generation_type: "music", voice: "neutral", language: "auto", atmosphere: "ночной дождливый город", cinematic_level: 0.8, reverb_amount: 0.7, texture: "analog tape", duration_seconds: 45 });
  const generationId = useGenerationStore((state) => state.generationIds["/generate/constructor"]);
  const submission = useGenerationStore((state) => state.submissions["/generate/constructor"]);
  const submit = useSubmitGeneration("/generate/constructor");
  const { generation, track } = useGenerationPolling(generationId);
  const set = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));
  const loading = Boolean(submission?.isSubmitting) || submit.isPending || Boolean(generation.data && !["completed", "failed"].includes(generation.data.status));
  return (
    <GeneratePanel title={locale === "ru" ? "Музыкальный конструктор" : "Music Constructor"} eyebrow={locale === "ru" ? "Структурированные настройки" : "Structured controls"} loading={loading} progress={generation.data?.progress} status={generation.data?.status} track={track.data} error={submission?.error ?? submit.error?.message ?? generation.data?.error} onGenerate={() => submit.mutate({ ...form, instruments: ["felt piano", "warm pads", "soft strings"] })}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={locale === "ru" ? "Жанр" : "Genre"}>
          <select className="premium-input w-full rounded-2xl px-4 py-3" value={form.genre} onChange={(e) => set("genre", e.target.value)}>{genreOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.value}</option>)}</select>
        </Field>
        <Field label={locale === "ru" ? "Поджанр" : "Subgenre"}>
          <select className="premium-input w-full rounded-2xl px-4 py-3" value={form.subgenre} onChange={(e) => set("subgenre", e.target.value)}>{subgenreOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.value}</option>)}</select>
        </Field>
        <Field label={locale === "ru" ? "Тональность" : "Key"}>
          <select className="premium-input w-full rounded-2xl px-4 py-3" value={form.key} onChange={(e) => set("key", e.target.value)}>{keyOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.value}</option>)}</select>
        </Field>
        <Field label={locale === "ru" ? "Настроение" : "Mood"}>
          <select className="premium-input w-full rounded-2xl px-4 py-3" value={form.mood} onChange={(e) => set("mood", e.target.value)}>{moodOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.value}</option>)}</select>
        </Field>
        <Field label={locale === "ru" ? "Атмосфера" : "Atmosphere"}><input className="premium-input w-full rounded-2xl px-4 py-3" value={form.atmosphere} onChange={(e) => set("atmosphere", e.target.value)} /></Field>
        <Field label={locale === "ru" ? "Текстура" : "Texture"}>
          <select className="premium-input w-full rounded-2xl px-4 py-3" value={form.texture} onChange={(e) => set("texture", e.target.value)}>{textureOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.value}</option>)}</select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={locale === "ru" ? "Режим генерации" : "Generation mode"}>
          <select className="premium-input w-full rounded-2xl px-4 py-3" value={form.generation_type} onChange={(e) => set("generation_type", e.target.value)}>
            <option value="music">{locale === "ru" ? "Музыка" : "Music"}</option>
            <option value="song">{locale === "ru" ? "Песня" : "Song"}</option>
          </select>
        </Field>
        <Field label={locale === "ru" ? "Голос" : "Voice"}>
          <select className="premium-input w-full rounded-2xl px-4 py-3" value={form.voice} onChange={(e) => set("voice", e.target.value)}>{voiceOptions.map((item) => <option key={item.value} value={item.value}>{locale === "ru" ? item.ru : item.value}</option>)}</select>
        </Field>
        <Field label={locale === "ru" ? "Язык" : "Language"}>
          <select className="premium-input w-full rounded-2xl px-4 py-3" value={form.language} onChange={(e) => set("language", e.target.value)}>
            <option value="auto">{locale === "ru" ? "Авто" : "Auto"}</option><option value="en">{locale === "ru" ? "Английский" : "English"}</option><option value="ru">{locale === "ru" ? "Русский" : "Russian"}</option><option value="es">{locale === "ru" ? "Испанский" : "Spanish"}</option><option value="fr">{locale === "ru" ? "Французский" : "French"}</option><option value="de">{locale === "ru" ? "Немецкий" : "German"}</option>
          </select>
        </Field>
      </div>
      {[["BPM", "bpm", 40, 220], [locale === "ru" ? "Энергия" : "Energy", "energy", 0, 1], [locale === "ru" ? "Сложность" : "Complexity", "complexity", 0, 1], [locale === "ru" ? "Кино-уровень" : "Cinematic", "cinematic_level", 0, 1], [locale === "ru" ? "Реверберация" : "Reverb", "reverb_amount", 0, 1], [locale === "ru" ? "Длительность" : "Duration", "duration_seconds", 5, 180]].map(([label, key, min, max]) => <Field key={String(key)} label={`${label}: ${form[key as keyof typeof form]}`}><input className="range w-full" type="range" min={Number(min)} max={Number(max)} step={Number(max) === 1 ? 0.01 : 1} value={Number(form[key as keyof typeof form])} onChange={(e) => set(String(key), Number(e.target.value))} /></Field>)}
      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-300">{locale === "ru" ? "Сводка в реальном времени" : "Realtime summary"}: {form.genre}, {form.bpm} BPM, {form.key}, {form.mood}, {form.atmosphere}, {form.texture}.</div>
    </GeneratePanel>
  );
}
