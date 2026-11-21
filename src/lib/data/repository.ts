import type { DateKey } from "../date";
import type { AppData, HabitId, Settings } from "./types";

/**
 * Contrato de persistencia de Rumbo.
 *
 * La interfaz de usuario solo conoce esta interfaz. Hoy la implementa
 * LocalRepository (localStorage); para pasar a Supabase alcanza con escribir
 * otra clase que la cumpla (por ejemplo, una tabla por cada colección de
 * AppData) y cambiarla en ./index.ts.
 *
 * Cada operación devuelve el estado completo actualizado.
 */
export interface RumboRepository {
  load(): Promise<AppData>;

  setHabit(date: DateKey, habit: HabitId, done: boolean): Promise<AppData>;

  /** Registra un desliz el día `date`: la racha vuelve a 0 y el historial se conserva. */
  registerSlip(date: DateKey): Promise<AppData>;
  /** Deshace un desliz registrado por error. */
  undoSlip(slipId: string): Promise<AppData>;

  startCraving(): Promise<AppData>;
  toggleCravingAction(cravingId: string, action: string): Promise<AppData>;
  endCraving(cravingId: string): Promise<AppData>;

  updateSettings(patch: Partial<Settings>): Promise<AppData>;

  /** Avisa cuando los datos cambian desde otro lado (otra pestaña, otro dispositivo). */
  subscribe(listener: (data: AppData) => void): () => void;
}
