import { createModule } from "@/hooks/createModule";
import { LocalFinanceRepository } from "./local-repository";
import type { FinanceRepository } from "./repository";
import type { FinanceData } from "./types";

export * from "./types";
export type { FinanceRepository } from "./repository";

let instance: FinanceRepository | null = null;

/** Punto único donde se elige la persistencia de Finanzas. */
export function getFinanceRepository(): FinanceRepository {
  if (!instance) instance = new LocalFinanceRepository();
  return instance;
}

export const [FinanceProvider, useFinance] = createModule<FinanceData, FinanceRepository>(
  "Finance",
  getFinanceRepository,
);
