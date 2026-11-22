import type { DateKey } from "../date";

export type HabitId =
  | "wake"
  | "work"
  | "study"
  | "training"
  | "evening"
  | "clean"
  | "sleep";

/** Lo que pasó en un día: qué hábitos se tildaron. */
export interface DayLog {
  date: DateKey;
  habits: Partial<Record<HabitId, boolean>>;
  updatedAt: string;
}

/** Un desliz. Se guarda para el historial; nunca se borra al reiniciar la racha. */
export interface Slip {
  id: string;
  date: DateKey;
  at: string;
  /** Estado previo al desliz, para poder deshacerlo. */
  previousStreakStart: DateKey;
  previousClean?: boolean;
}

/** Un momento de ganas de consumir y cómo se atravesó. */
export interface Craving {
  id: string;
  startedAt: string;
  endedAt?: string;
  actions: string[];
}

export interface Settings {
  /** Día 1 del plan de 90 días. */
  planStartDate: DateKey;
  /** Día 1 de la racha actual. Un desliz lo mueve al día siguiente. */
  streakStartDate: DateKey;
  notificationsEnabled: boolean;
  day13Plan: string;
  /** Avisos ya vistos, por ejemplo "critical-11-2026-11-21". */
  dismissedAlerts: string[];
}

export interface AppData {
  version: 1;
  createdAt: string;
  days: Record<DateKey, DayLog>;
  slips: Slip[];
  cravings: Craving[];
  settings: Settings;
}
