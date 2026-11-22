"use client";

import type { ReactNode } from "react";
import { RumboProvider } from "@/hooks/useRumbo";
import { AssistantProvider } from "@/lib/assistant";
import { FinanceProvider } from "@/lib/finance";
import { LibraryProvider } from "@/lib/library";
import { SalesProvider } from "@/lib/sales";

/** Todos los estados de la app: racha, finanzas, ventas, biblioteca y asistente. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <RumboProvider>
      <FinanceProvider>
        <SalesProvider>
          <LibraryProvider>
            <AssistantProvider>{children}</AssistantProvider>
          </LibraryProvider>
        </SalesProvider>
      </FinanceProvider>
    </RumboProvider>
  );
}
