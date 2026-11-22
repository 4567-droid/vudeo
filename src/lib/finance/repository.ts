import type { DateKey } from "../date";
import type { Debt, FinanceData, FinanceSettings, SavingsGoal, Transaction } from "./types";

/**
 * Contrato de persistencia de Finanzas. Hoy lo cumple LocalFinanceRepository;
 * para Supabase alcanza con una clase que lo implemente (una tabla por colección).
 */
export interface FinanceRepository {
  load(): Promise<FinanceData>;
  subscribe(listener: (data: FinanceData) => void): () => void;

  addTransaction(tx: Omit<Transaction, "id" | "createdAt">): Promise<FinanceData>;
  deleteTransaction(id: string): Promise<FinanceData>;

  /** `null` quita el presupuesto de esa categoría. */
  setBudget(category: string, limit: number | null): Promise<FinanceData>;

  saveDebt(debt: Omit<Debt, "id" | "createdAt"> & { id?: string }): Promise<FinanceData>;
  deleteDebt(id: string): Promise<FinanceData>;
  /** Baja el saldo de la deuda y registra el pago como gasto en "Deudas". */
  payDebt(id: string, amount: number, date: DateKey): Promise<FinanceData>;

  saveGoal(goal: Omit<SavingsGoal, "id" | "createdAt"> & { id?: string }): Promise<FinanceData>;
  deleteGoal(id: string): Promise<FinanceData>;
  /** Suma (o resta, con monto negativo) a lo ahorrado en una meta. */
  contributeGoal(id: string, amount: number): Promise<FinanceData>;

  togglePhaseTask(taskId: string): Promise<FinanceData>;
  updateSettings(patch: Partial<FinanceSettings>): Promise<FinanceData>;
}
