import type { DateKey } from "../date";
import type { Counter, Prospect, SalesData, SalesGoals, Script } from "./types";

/**
 * Contrato de persistencia de Ventas. Hoy lo cumple LocalSalesRepository;
 * para Supabase alcanza con otra clase que lo implemente.
 */
export interface SalesRepository {
  load(): Promise<SalesData>;
  subscribe(listener: (data: SalesData) => void): () => void;

  /** Suma `delta` (1 o -1) a un contador del día. Nunca baja de 0. */
  bump(date: DateKey, counter: Counter, delta: number): Promise<SalesData>;
  togglePrep(date: DateKey, stepId: string): Promise<SalesData>;
  setReview(date: DateKey, review: { wins?: string; improve?: string }): Promise<SalesData>;

  updateGoals(patch: Partial<SalesGoals>): Promise<SalesData>;

  saveProspect(p: Omit<Prospect, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<SalesData>;
  deleteProspect(id: string): Promise<SalesData>;

  saveScript(s: Omit<Script, "id" | "updatedAt"> & { id?: string }): Promise<SalesData>;
  deleteScript(id: string): Promise<SalesData>;
  /** Vuelve un guion de partida a su texto original. */
  resetScript(id: string): Promise<SalesData>;
}
