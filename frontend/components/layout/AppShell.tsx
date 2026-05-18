"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Disc3, Globe, Library, LogOut, Map, Music2, SlidersHorizontal, Sparkles, User, Waves } from "lucide-react";
import { AUTH_STORAGE_KEY } from "@/components/auth/AuthGate";
import { useI18n } from "@/i18n/i18n";
import { PlayerDock } from "@/player/PlayerDock";
import { getGenerationUsage } from "@/services/api";

const nav = [
  { href: "/", key: "nav.overview", icon: Sparkles },
  { href: "/generate/text", key: "nav.text", icon: Music2 },
  { href: "/generate/builder", key: "nav.builder", icon: SlidersHorizontal },
  { href: "/generate/emotion", key: "nav.emotion", icon: Map },
  { href: "/generate/reference", key: "nav.reference", icon: Disc3 },
  { href: "/generate/ambient", key: "nav.ambient", icon: Waves },
  { href: "/library", key: "nav.library", icon: Library }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const [currentUser, setCurrentUser] = useState("");
  const { data: usage } = useQuery({
    queryKey: ["generation-usage", currentUser],
    queryFn: getGenerationUsage,
    enabled: Boolean(currentUser)
  });

  useEffect(() => {
    setCurrentUser(localStorage.getItem(AUTH_STORAGE_KEY) ?? "");
  }, []);

  function handleLogout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.reload();
  }

  return (
    <div className="min-h-screen overflow-x-hidden pb-44 lg:pb-36">
      <div className="fixed left-3 right-3 top-3 z-40 sm:left-auto sm:right-4 sm:top-4">
        <div className="ml-auto flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/55 px-2 py-2 backdrop-blur sm:w-auto sm:justify-start sm:bg-black/35">
          <Link href="/" className="flex min-w-0 items-center gap-2 px-1 lg:hidden">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-aurora shadow-glow">
              <Waves className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="truncate text-sm font-semibold">Aurora Sound</span>
          </Link>
          <div className="hidden items-center gap-2 border-r border-white/10 px-2 text-xs font-semibold text-slate-300 sm:flex">
            <User className="h-4 w-4" aria-hidden="true" />
            {currentUser}
            <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-cyan">
              Осталось: {usage?.remaining === null ? "безлимит" : usage?.remaining ?? "..."}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 border-r border-white/10 pr-2 sm:gap-2">
            <Globe className="h-4 w-4 text-slate-300" aria-hidden="true" />
            <span className="sr-only">{t("lang.label")}</span>
            <button onClick={() => setLocale("ru")} className={`rounded-lg px-2 py-1 text-xs font-semibold ${locale === "ru" ? "bg-white text-ink" : "text-slate-300 hover:bg-white/10"}`}>RU</button>
            <button onClick={() => setLocale("en")} className={`rounded-lg px-2 py-1 text-xs font-semibold ${locale === "en" ? "bg-white text-ink" : "text-slate-300 hover:bg-white/10"}`}>EN</button>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Выйти"
            title="Выйти"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <aside className="fixed left-4 top-4 z-30 hidden h-[calc(100vh-2rem)] w-64 overflow-hidden rounded-3xl glass p-4 lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 px-3 py-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-aurora shadow-glow">
            <Waves className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">Aurora Sound</div>
            <div className="text-xs text-slate-400">{t("brand.tagline")}</div>
          </div>
        </Link>
        <nav className="space-y-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${active ? "border border-cyan/25 bg-white/[0.12] text-white" : "border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="mx-auto max-w-7xl px-3 pb-6 pt-20 sm:px-4 lg:ml-72 lg:px-8 lg:py-5">{children}</main>
      <nav className="fixed bottom-3 left-3 right-3 z-40 rounded-3xl border border-white/10 bg-black/70 p-2 backdrop-blur lg:hidden" aria-label="Основная навигация">
        <div className="flex gap-1 overflow-x-auto overscroll-x-contain">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[4.75rem] flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors ${active ? "bg-white text-ink" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="max-w-full truncate">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <PlayerDock />
    </div>
  );
}
