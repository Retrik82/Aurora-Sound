"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "ru";

type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    "nav.overview": "Overview",
    "nav.text": "Text to Music",
    "nav.builder": "Constructor",
    "nav.emotion": "Emotion Map",
    "nav.reference": "Reference",
    "nav.ambient": "Soundscapes",
    "nav.library": "Library",
    "brand.tagline": "AI audio studio",
    "lang.label": "Language",
    "player.download": "Download",
    "player.close": "Close player",
    "panel.generate": "Generate Audio",
    "panel.generation": "Generation",
    "panel.ready": "Ready",
    "panel.openPlayer": "Open Player",
    "panel.waveformPlaceholder": "Your generated waveform will appear here.",
    "library.generated": "Generated tracks",
    "library.title": "Library",
    "library.loading": "Loading tracks...",
    "library.play": "Play",
    "home.badge": "AI music generation platform",
    "home.title": "Generate cinematic music and living ambient worlds.",
    "home.description": "Aurora Sound turns emotional direction, genre control, and atmospheric intent into structured AI prompts, queued generation jobs, and playable local tracks.",
    "home.start": "Start generating",
    "home.openMode": "Open mode",
    "home.pillar1.title": "LLM Orchestration",
    "home.pillar1.text": "Structured JSON profiles for Suno prompts.",
    "home.pillar2.title": "Layer Engine",
    "home.pillar2.text": "Mock-ready ambient renderer with room for real loop assets.",
    "home.pillar3.title": "Async Jobs",
    "home.pillar3.text": "Dramatiq queue, polling states, track storage, waveform playback.",
    "mode.text.title": "Text to Music",
    "mode.text.text": "Describe a scene, mood, genre, or sonic memory.",
    "mode.builder.title": "Music Constructor",
    "mode.builder.text": "Dial genre, BPM, texture, instruments, and cinematic energy.",
    "mode.emotion.title": "Emotion Map",
    "mode.emotion.text": "Shape a track from 13 emotions across a timeline.",
    "mode.reference.title": "Reference Tracks",
    "mode.reference.text": "Synthesize a style profile from presets and notes.",
    "mode.ambient.title": "Ambient Soundscapes",
    "mode.ambient.text": "Layer living environments for focus, sleep, and atmosphere.",
    "status.queued": "Queued",
    "status.analyzing": "Analyzing",
    "status.prompting": "Prompting",
    "status.generating": "Generating",
    "status.processing": "Processing",
    "status.completed": "Completed",
    "status.failed": "Failed",
    "modeLabel.text": "Text",
    "modeLabel.constructor": "Constructor",
    "modeLabel.emotion": "Emotion",
    "modeLabel.reference": "Reference",
    "modeLabel.ambient": "Ambient"
  },
  ru: {
    "nav.overview": "Обзор",
    "nav.text": "Текст в музыку",
    "nav.builder": "Конструктор",
    "nav.emotion": "Карта эмоций",
    "nav.reference": "Референсы",
    "nav.ambient": "Саундскейпы",
    "nav.library": "Библиотека",
    "brand.tagline": "AI-студия аудио",
    "lang.label": "Язык",
    "player.download": "Скачать",
    "player.close": "Закрыть плеер",
    "panel.generate": "Сгенерировать аудио",
    "panel.generation": "Генерация",
    "panel.ready": "Готово",
    "panel.openPlayer": "Открыть плеер",
    "panel.waveformPlaceholder": "Здесь появится волна сгенерированного трека.",
    "library.generated": "Сгенерированные треки",
    "library.title": "Библиотека",
    "library.loading": "Загрузка треков...",
    "library.play": "Слушать",
    "home.badge": "Платформа генерации AI-музыки",
    "home.title": "Генерируйте кинематографичную музыку и живые ambient-миры.",
    "home.description": "Aurora Sound превращает эмоции, жанровые настройки и атмосферу в структурированные AI-промпты, очереди генерации и готовые локальные треки.",
    "home.start": "Начать генерацию",
    "home.openMode": "Открыть режим",
    "home.pillar1.title": "LLM-оркестрация",
    "home.pillar1.text": "Структурированные JSON-профили для промптов Suno.",
    "home.pillar2.title": "Движок слоев",
    "home.pillar2.text": "Ambient-рендерер с моками и поддержкой реальных луп-ассетов.",
    "home.pillar3.title": "Асинхронные задачи",
    "home.pillar3.text": "Очередь Dramatiq, статусы опроса, хранение треков и волновой формы.",
    "mode.text.title": "Текст в музыку",
    "mode.text.text": "Опишите сцену, настроение, жанр или звуковое воспоминание.",
    "mode.builder.title": "Музыкальный конструктор",
    "mode.builder.text": "Настройте жанр, BPM, текстуру, инструменты и кино-энергию.",
    "mode.emotion.title": "Карта эмоций",
    "mode.emotion.text": "Сформируйте трек из 13 эмоций на временной шкале.",
    "mode.reference.title": "Референс-треки",
    "mode.reference.text": "Соберите стилевой профиль из пресетов и заметок.",
    "mode.ambient.title": "Саундскейпы",
    "mode.ambient.text": "Слои живых окружений для фокуса, сна и атмосферы.",
    "status.queued": "В очереди",
    "status.analyzing": "Анализ",
    "status.prompting": "Подготовка промпта",
    "status.generating": "Генерация",
    "status.processing": "Обработка",
    "status.completed": "Завершено",
    "status.failed": "Ошибка",
    "modeLabel.text": "Текст",
    "modeLabel.constructor": "Конструктор",
    "modeLabel.emotion": "Эмоции",
    "modeLabel.reference": "Референс",
    "modeLabel.ambient": "Саундскейп"
  }
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("locale");
    if (saved === "en" || saved === "ru") {
      setLocaleState(saved);
      return;
    }
    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith("ru")) setLocaleState("ru");
  }, []);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
    window.localStorage.setItem("locale", value);
  };

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key: string) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
