import type { DateKey } from "../date";
import type { Debt, FinanceData, FinanceSettings, Transaction } from "./types";

/* ---------- Dinero ---------- */

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const usdFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Si el usuario eligió ver en dólares y hay tipo de cambio cargado. */
export function showsUsd(s: FinanceSettings): boolean {
  return s.display === "USD" && s.usdRate > 0;
}

/** Formatea un monto guardado en ARS según la moneda elegida. */
export function formatMoney(ars: number, s: FinanceSettings): string {
  if (showsUsd(s)) return usdFormatter.format(ars / s.usdRate).replace("USD", "US$");
  return arsFormatter.format(ars);
}

export function formatArs(ars: number): string {
  return arsFormatter.format(ars);
}

/** Convierte lo que se tipeó (en la moneda que se está viendo) a ARS. */
export function toArs(amount: number, s: FinanceSettings): number {
  return showsUsd(s) ? amount * s.usdRate : amount;
}

/** Lee montos escritos a la argentina: "1.500", "1500,50", "$ 2.000". */
export function parseAmount(input: string): number | null {
  let s = input.replace(/[^\d.,-]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/* ---------- Mes ---------- */

export type MonthKey = string; // "YYYY-MM"

export const monthOf = (date: DateKey): MonthKey => date.slice(0, 7);

const monthFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

/** "noviembre de 2026" */
export function formatMonth(month: MonthKey): string {
  const [y, m] = month.split("-").map(Number);
  return monthFormatter.format(new Date(Date.UTC(y, m - 1, 1)));
}

export function addMonths(month: MonthKey, n: number): MonthKey {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export interface MonthSummary {
  month: MonthKey;
  income: number;
  expense: number;
  balance: number;
  /** Gasto por categoría, de mayor a menor. */
  byCategory: { category: string; amount: number }[];
  transactions: Transaction[];
}

export function monthSummary(data: FinanceData, month: MonthKey): MonthSummary {
  const transactions = data.transactions
    .filter((t) => monthOf(t.date) === month)
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  let income = 0;
  let expense = 0;
  const cats: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === "ingreso") income += t.amount;
    else {
      expense += t.amount;
      cats[t.category] = (cats[t.category] ?? 0) + t.amount;
    }
  }
  return {
    month,
    income,
    expense,
    balance: income - expense,
    byCategory: Object.entries(cats)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    transactions,
  };
}

export interface BudgetLine {
  category: string;
  limit: number;
  spent: number;
  /** Gastado / presupuesto (puede pasar de 1). */
  ratio: number;
}

export function budgetLines(data: FinanceData, month: MonthKey): BudgetLine[] {
  const summary = monthSummary(data, month);
  const spentBy = Object.fromEntries(summary.byCategory.map((c) => [c.category, c.amount]));
  return Object.entries(data.budgets)
    .map(([category, limit]) => {
      const spent = spentBy[category] ?? 0;
      return { category, limit, spent, ratio: limit > 0 ? spent / limit : 0 };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

/** Promedio de gasto mensual de los últimos meses con datos (hasta 3, sin contar el actual). */
export function averageMonthlyExpense(data: FinanceData, current: MonthKey): number {
  const totals: number[] = [];
  for (let i = 1; i <= 3; i++) {
    const s = monthSummary(data, addMonths(current, -i));
    if (s.expense > 0) totals.push(s.expense);
  }
  if (totals.length === 0) {
    const now = monthSummary(data, current);
    return now.expense;
  }
  return totals.reduce((a, b) => a + b, 0) / totals.length;
}

/* ---------- Bola de nieve ---------- */

export interface SnowballDebt {
  debt: Debt;
  /** Meses hasta cancelarla (1 = el mes que viene). null si no se termina. */
  months: number | null;
  endMonth: MonthKey | null;
}

export interface SnowballPlan {
  order: SnowballDebt[];
  monthlyBudget: number;
  totalMonths: number | null;
  endMonth: MonthKey | null;
  /** true si con estas cuotas alguna deuda no baja nunca. */
  stuck: boolean;
}

const MAX_MONTHS = 600;

/**
 * Método bola de nieve: se pagan todas las cuotas y todo lo que sobra (el extra más
 * las cuotas de las deudas ya canceladas) va a la deuda de menor saldo.
 */
export function snowballPlan(debts: Debt[], extra: number, currentMonth: MonthKey): SnowballPlan {
  const active = debts.filter((d) => d.balance > 0);
  const order = [...active].sort((a, b) => a.balance - b.balance || a.payment - b.payment);
  const monthlyBudget = order.reduce((s, d) => s + d.payment, 0) + Math.max(0, extra);
  const balances = order.map((d) => d.balance);
  const doneAt: (number | null)[] = order.map(() => null);

  let month = 0;
  while (month < MAX_MONTHS && balances.some((b) => b > 0.01)) {
    month++;
    // Interés del mes.
    order.forEach((d, i) => {
      if (balances[i] > 0) balances[i] *= 1 + d.annualRate / 1200;
    });
    // Cuotas.
    let available = monthlyBudget;
    order.forEach((d, i) => {
      if (balances[i] <= 0) return;
      const pay = Math.min(d.payment, balances[i], available);
      balances[i] -= pay;
      available -= pay;
    });
    // Lo que sobra, a la deuda más chica que quede.
    for (let i = 0; i < order.length && available > 0; i++) {
      if (balances[i] <= 0) continue;
      const pay = Math.min(balances[i], available);
      balances[i] -= pay;
      available -= pay;
    }
    balances.forEach((b, i) => {
      if (b <= 0.01 && doneAt[i] === null) {
        balances[i] = 0;
        doneAt[i] = month;
      }
    });
  }

  const stuck = doneAt.some((m) => m === null);
  const totalMonths = stuck || order.length === 0 ? null : Math.max(...(doneAt as number[]));
  return {
    order: order.map((debt, i) => ({
      debt,
      months: doneAt[i],
      endMonth: doneAt[i] === null ? null : addMonths(currentMonth, doneAt[i] as number),
    })),
    monthlyBudget,
    totalMonths,
    endMonth: totalMonths === null ? null : addMonths(currentMonth, totalMonths),
    stuck,
  };
}

export const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : 0);

export const percent = (r: number) => `${Math.round(r * 100)}%`;
