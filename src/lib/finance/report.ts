import { formatLong, formatShort, type DateKey } from "../date";
import { PdfReport } from "../pdf";
import {
  budgetLines,
  formatArs,
  formatMonth,
  monthOf,
  monthSummary,
  percent,
  ratio,
  snowballPlan,
  type MonthKey,
} from "./calc";
import type { FinanceData } from "./types";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Resumen mensual en PDF. Los montos van en pesos; si hay tipo de cambio, también en dólares. */
export function financeMonthReport(data: FinanceData, month: MonthKey, today: DateKey): Blob {
  const s = monthSummary(data, month);
  const rate = data.settings.usdRate;
  const usd = (ars: number) =>
    rate > 0 ? ` (US$ ${(ars / rate).toLocaleString("es-AR", { maximumFractionDigits: 0 })})` : "";

  const r = new PdfReport("Resumen financiero", `${cap(formatMonth(month))} · generado el ${formatLong(today)}`);

  r.heading("Resultado del mes");
  r.keyValues([
    ["Ingresos", formatArs(s.income) + usd(s.income)],
    ["Gastos", formatArs(s.expense) + usd(s.expense)],
    ["Saldo", formatArs(s.balance) + usd(s.balance)],
  ]);
  if (rate > 0) r.paragraph(`Tipo de cambio usado: ${formatArs(rate)} por dólar.`, "muted");

  r.heading("Gastos por categoría");
  if (s.byCategory.length === 0) r.paragraph("No hay gastos registrados en este mes.", "muted");
  else {
    r.table(
      ["Categoría", "Gastado", "Presupuesto", "Uso"],
      s.byCategory.map((c) => {
        const limit = data.budgets[c.category];
        return [
          c.category,
          formatArs(c.amount),
          limit ? formatArs(limit) : "-",
          limit ? percent(ratio(c.amount, limit)) : "-",
        ];
      }),
      [3, 2, 2, 1],
      [1, 2, 3],
    );
  }

  const lines = budgetLines(data, month);
  if (lines.length > 0) {
    r.heading("Presupuesto");
    for (const l of lines) {
      r.bar(l.category, l.ratio, `${formatArs(l.spent)} de ${formatArs(l.limit)} (${percent(l.ratio)})`);
    }
  }

  r.heading("Deudas (método bola de nieve)");
  const plan = snowballPlan(data.debts, data.settings.extraPayment, monthOf(today));
  if (plan.order.length === 0) r.paragraph("No hay deudas cargadas.", "muted");
  else {
    const total = plan.order.reduce((a, d) => a + d.debt.balance, 0);
    r.keyValues([
      ["Deuda total", formatArs(total)],
      ["Pago mensual (cuotas + extra)", formatArs(plan.monthlyBudget)],
      ["Fin estimado", plan.endMonth ? cap(formatMonth(plan.endMonth)) : "No se termina con estas cuotas"],
    ]);
    r.table(
      ["Orden", "Deuda", "Saldo", "Cuota", "Fin estimado"],
      plan.order.map((d, i) => [
        String(i + 1),
        d.debt.name,
        formatArs(d.debt.balance),
        formatArs(d.debt.payment),
        d.endMonth ? cap(formatMonth(d.endMonth)) : "-",
      ]),
      [1, 3, 2, 2, 3],
      [2, 3],
    );
    if (plan.stuck) {
      r.paragraph(
        "Con estas cuotas, alguna deuda no baja: el interés es mayor que el pago. Conviene subir la cuota o el extra.",
        "amber",
      );
    }
  }

  r.heading("Ahorro");
  for (const g of data.goals) {
    if (g.target > 0) {
      r.bar(g.name, ratio(g.saved, g.target), `${formatArs(g.saved)} de ${formatArs(g.target)} (${percent(ratio(g.saved, g.target))})`);
    } else {
      r.paragraph(`${g.name}: ${formatArs(g.saved)} ahorrados, sin objetivo definido.`, "muted");
    }
  }

  r.heading("Movimientos");
  if (s.transactions.length === 0) r.paragraph("Sin movimientos.", "muted");
  else {
    r.table(
      ["Fecha", "Tipo", "Categoría", "Nota", "Monto"],
      [...s.transactions]
        .reverse()
        .map((t) => [
          formatShort(t.date),
          t.type === "ingreso" ? "Ingreso" : "Gasto",
          t.category,
          t.note || "-",
          (t.type === "ingreso" ? "+" : "-") + formatArs(t.amount),
        ]),
      [1.4, 1.4, 2, 3, 2],
      [4],
    );
  }

  r.paragraph("Resumen para uso personal. No es asesoramiento financiero.", "muted");
  return r.blob();
}
