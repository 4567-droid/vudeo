import { createModule } from "@/hooks/createModule";
import { LocalSalesRepository } from "./local-repository";
import type { SalesRepository } from "./repository";
import type { SalesData } from "./types";

export * from "./types";
export type { SalesRepository } from "./repository";

let instance: SalesRepository | null = null;

/** Punto único donde se elige la persistencia de Ventas. */
export function getSalesRepository(): SalesRepository {
  if (!instance) instance = new LocalSalesRepository();
  return instance;
}

export const [SalesProvider, useSales] = createModule<SalesData, SalesRepository>(
  "Sales",
  getSalesRepository,
);
