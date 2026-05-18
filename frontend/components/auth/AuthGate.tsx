"use client";

import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, Music2 } from "lucide-react";

const AUTH_STORAGE_KEY = "aurora-auth-user";

const users = [
  { login: "artem", password: "ak824" },
  { login: "ieh", password: "192837465" },
  { login: "test1", password: "f18228" },
  { login: "test2", password: "f21643" },
  { login: "test3", password: "f37952" }
];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem(AUTH_STORAGE_KEY)));
    setIsReady(true);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedLogin = login.trim();
    const user = users.find(
      (item) => item.login === normalizedLogin && item.password === password
    );

    if (!user) {
      setError("Неверный логин или пароль");
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, user.login);
    setError("");
    setIsAuthenticated(true);
  }

  if (!isReady) {
    return <div className="min-h-screen" />;
  }

  if (isAuthenticated) {
    return children;
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] glass p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-aurora shadow-glow">
            <Music2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Aurora Sound</h1>
            <p className="text-sm text-slate-400">Войдите, чтобы продолжить</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">Логин</span>
            <input
              className="premium-input rounded-2xl px-4"
              autoComplete="username"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">Пароль</span>
            <input
              className="premium-input rounded-2xl px-4"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-ink transition hover:bg-cyan"
          >
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Войти
          </button>
        </form>
      </section>
    </main>
  );
}

export { AUTH_STORAGE_KEY };
