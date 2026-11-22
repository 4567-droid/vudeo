import { asArray, asNumber, asRecord, LocalStore, newId } from "../data/local-store";
import type { DateKey } from "../date";
import type { FinanceRepository } from "./repository";
import type { Debt, FinanceData, FinanceSettings, SavingsGoal, Transaction } from "./types";

export function createFinanceData(): FinanceData {
  return {
    version: 1,
    transactions: [],
    budgets: {},
    debts: [],
    goals: [
      {
        id: "fondo-emergencia",
        name: "Fondo de emergencia",
        target: 0,
        saved: 0,
        kind: "emergencia",
        createdAt: new Date().toISOString(),
      },
    ],
    phaseTasks: [],
    settings: { usdRate: 0, display: "ARS", extraPayment: 0 },
  };
}

export function normalizeFinance(raw: unknown): FinanceData {
  const base = createFinanceData();
  const r = asRecord<unknown>(raw);
  const s = asRecord<unknown>(r.settings);
  const goals = asArray<SavingsGoal>(r.goals);
  return {
    version: 1,
    transactions: asArray<Transaction>(r.transactions),
    budgets: asRecord<number>(r.budgets),
    debts: asArray<Debt>(r.debts),
    goals: goals.some((g) => g.kind === "emergencia") ? goals : [...base.goals, ...goals],
    phaseTasks: asArray<string>(r.phaseTasks),
    settings: {
      usdRate: asNumber(s.usdRate),
      display: s.display === "USD" ? "USD" : "ARS",
      extraPayment: asNumber(s.extraPayment),
    },
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

export class LocalFinanceRepository implements FinanceRepository {
  private store = new LocalStore<FinanceData>("rumbo:finanzas:v1", createFinanceData, normalizeFinance);

  async load() {
    return this.store.read();
  }

  subscribe(listener: (data: FinanceData) => void) {
    return this.store.subscribe(listener);
  }

  addTransaction(tx: Omit<Transaction, "id" | "createdAt">) {
    return this.store.mutate((d) => ({
      ...d,
      transactions: [
        ...d.transactions,
        { ...tx, amount: round(tx.amount), id: newId(), createdAt: new Date().toISOString() },
      ],
    }));
  }

  deleteTransaction(id: string) {
    return this.store.mutate((d) => ({
      ...d,
      transactions: d.transactions.filter((t) => t.id !== id),
    }));
  }

  setBudget(category: string, limit: number | null) {
    return this.store.mutate((d) => {
      const budgets = { ...d.budgets };
      if (limit === null || limit <= 0) delete budgets[category];
      else budgets[category] = round(limit);
      return { ...d, budgets };
    });
  }

  saveDebt(debt: Omit<Debt, "id" | "createdAt"> & { id?: string }) {
    return this.store.mutate((d) => {
      const existing = debt.id ? d.debts.find((x) => x.id === debt.id) : undefined;
      const next: Debt = {
        id: existing?.id ?? newId(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        name: debt.name.trim() || "Deuda",
        balance: round(Math.max(0, debt.balance)),
        payment: round(Math.max(0, debt.payment)),
        annualRate: Math.max(0, debt.annualRate),
      };
      return {
        ...d,
        debts: existing ? d.debts.map((x) => (x.id === next.id ? next : x)) : [...d.debts, next],
      };
    });
  }

  deleteDebt(id: string) {
    return this.store.mutate((d) => ({ ...d, debts: d.debts.filter((x) => x.id !== id) }));
  }

  payDebt(id: string, amount: number, date: DateKey) {
    return this.store.mutate((d) => {
      const debt = d.debts.find((x) => x.id === id);
      if (!debt || amount <= 0) return d;
      return {
        ...d,
        debts: d.debts.map((x) =>
          x.id === id ? { ...x, balance: round(Math.max(0, x.balance - amount)) } : x,
        ),
        transactions: [
          ...d.transactions,
          {
            id: newId(),
            date,
            type: "gasto",
            amount: round(amount),
            category: "Deudas",
            note: `Pago: ${debt.name}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  }

  saveGoal(goal: Omit<SavingsGoal, "id" | "createdAt"> & { id?: string }) {
    return this.store.mutate((d) => {
      const existing = goal.id ? d.goals.find((x) => x.id === goal.id) : undefined;
      const next: SavingsGoal = {
        id: existing?.id ?? newId(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        name: goal.name.trim() || "Meta",
        target: round(Math.max(0, goal.target)),
        saved: round(Math.max(0, goal.saved)),
        kind: existing?.kind ?? goal.kind,
      };
      return {
        ...d,
        goals: existing ? d.goals.map((x) => (x.id === next.id ? next : x)) : [...d.goals, next],
      };
    });
  }

  deleteGoal(id: string) {
    return this.store.mutate((d) => ({
      ...d,
      // El fondo de emergencia no se borra: se puede dejar en 0.
      goals: d.goals.filter((x) => x.id !== id || x.kind === "emergencia"),
    }));
  }

  contributeGoal(id: string, amount: number) {
    return this.store.mutate((d) => ({
      ...d,
      goals: d.goals.map((x) =>
        x.id === id ? { ...x, saved: round(Math.max(0, x.saved + amount)) } : x,
      ),
    }));
  }

  togglePhaseTask(taskId: string) {
    return this.store.mutate((d) => ({
      ...d,
      phaseTasks: d.phaseTasks.includes(taskId)
        ? d.phaseTasks.filter((t) => t !== taskId)
        : [...d.phaseTasks, taskId],
    }));
  }

  updateSettings(patch: Partial<FinanceSettings>) {
    return this.store.mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }
}
