"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { I18nProvider } from "@/i18n/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <AuthGate>{children}</AuthGate>
      </I18nProvider>
    </QueryClientProvider>
  );
}
