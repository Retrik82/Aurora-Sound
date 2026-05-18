"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, Layers3, Radio, Sparkles, type LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

const modes = [
  ["mode.text.title", "mode.text.text", "/generate/text"],
  ["mode.builder.title", "mode.builder.text", "/generate/builder"],
  ["mode.emotion.title", "mode.emotion.text", "/generate/emotion"],
  ["mode.reference.title", "mode.reference.text", "/generate/reference"],
  ["mode.ambient.title", "mode.ambient.text", "/generate/ambient"]
];

const pillars: { icon: LucideIcon; titleKey: string; textKey: string }[] = [
  { icon: BrainCircuit, titleKey: "home.pillar1.title", textKey: "home.pillar1.text" },
  { icon: Layers3, titleKey: "home.pillar2.title", textKey: "home.pillar2.text" },
  { icon: Radio, titleKey: "home.pillar3.title", textKey: "home.pillar3.text" }
];

export default function Home() {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <section className="glass overflow-hidden rounded-[1.75rem] p-5 sm:rounded-[2.5rem] sm:p-8 md:p-12">
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan sm:text-sm sm:tracking-[0.4em]">{t("home.badge")}</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl">{t("home.title")}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {t("home.description")}
          </p>
          <Link href="/generate/text" className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-semibold text-ink sm:w-auto">
            {t("home.start")} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {pillars.map(({ icon: Icon, titleKey, textKey }) => (
          <div key={titleKey} className="glass rounded-3xl p-6">
            <Icon className="h-7 w-7 text-cyan" />
            <h2 className="mt-5 text-xl font-semibold">{t(titleKey)}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{t(textKey)}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modes.map(([titleKey, textKey, href]) => (
          <Link href={href} key={href} className="group rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.1]">
            <Sparkles className="h-6 w-6 text-aurora" />
            <h3 className="mt-5 text-2xl font-semibold">{t(titleKey)}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{t(textKey)}</p>
            <div className="mt-5 text-sm font-semibold text-cyan">{t("home.openMode")}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
