import type { DateKey } from "../date";

export type TxType = "gasto" | "ingreso";

/** Un movimiento. El monto se guarda siempre en pesos (ARS). */
export interface Transaction {
  id: string;
  date: DateKey;
  type: TxType;
  amount: number;
  category: string;
  note: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  name: string;
  /** Lo que falta pagar, en ARS. */
  balance: number;
  /** Cuota mensual, en ARS. */
  payment: number;
  /** Tasa nominal anual en %. 0 si no se sabe o no tiene interés. */
  annualRate: number;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  kind: "emergencia" | "meta";
  createdAt: string;
}

export interface FinanceSettings {
  /** Pesos por dólar. 0 = todavía no se cargó. */
  usdRate: number;
  display: "ARS" | "USD";
  /** Monto extra por mes para acelerar la bola de nieve, en ARS. */
  extraPayment: number;
}

export interface FinanceData {
  version: 1;
  transactions: Transaction[];
  /** Presupuesto mensual por categoría de gasto, en ARS. */
  budgets: Record<string, number>;
  debts: Debt[];
  goals: SavingsGoal[];
  /** Tareas del plan de 3 fases ya hechas. */
  phaseTasks: string[];
  settings: FinanceSettings;
}
