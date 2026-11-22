import type { DateKey } from "../date";

export type ProspectStatus = "nuevo" | "contactado" | "negociando" | "cerrado" | "perdido";

export interface Prospect {
  id: string;
  name: string;
  phone: string;
  status: ProspectStatus;
  /** Próximo contacto. "" si no hay. */
  nextContact: DateKey | "";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type Counter = "calls" | "contacts" | "closings";

export interface SalesDay {
  date: DateKey;
  calls: number;
  contacts: number;
  closings: number;
  /** Pasos del ritual de preparación ya hechos. */
  prep: string[];
  /** Repaso al terminar. */
  wins: string;
  improve: string;
}

export interface SalesGoals {
  dailyCalls: number;
  dailyContacts: number;
  dailyClosings: number;
  weeklyCalls: number;
  weeklyContacts: number;
  weeklyClosings: number;
  /** Comisión estimada por cierre, en ARS. 0 = no se muestra. */
  commissionPerClosing: number;
}

export type ScriptKind = "apertura" | "objecion" | "cierre";

export interface Script {
  id: string;
  kind: ScriptKind;
  title: string;
  body: string;
  updatedAt: string;
}

export interface SalesData {
  version: 1;
  goals: SalesGoals;
  days: Record<DateKey, SalesDay>;
  prospects: Prospect[];
  scripts: Script[];
}
