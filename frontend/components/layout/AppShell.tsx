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
    <div className="min-h-screen overflow-x-hidden pb-36">
      <div className="fixed right-4 top-4 z-40">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-2 py-2 backdrop-blur">
          <div className="hidden items-center gap-2 border-r border-white/10 px-2 text-xs font-semibold text-slate-300 sm:flex">
            <User className="h-4 w-4" aria-hidden="true" />
            {currentUser}
            <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-cyan">
              Осталось: {usage?.remaining === null ? "безлимит" : usage?.remaining ?? "..."}
            </span>
          </div>
          <div className="flex items-center gap-2 border-r border-white/10 pr-2">
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
      <main className="mx-auto max-w-7xl px-4 py-5 lg:ml-72 lg:px-8">{children}</main>
      <PlayerDock />
    </div>
  );
}
