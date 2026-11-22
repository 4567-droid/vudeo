import { addDays, formatLong, zonedParts, type DateKey } from "../date";
import type { AppData } from "../data/types";
import {
  budgetLines,
  formatArs,
  monthOf,
  monthSummary,
  percent,
  ratio,
  snowballPlan,
  formatMonth,
} from "../finance/calc";
import type { FinanceData } from "../finance/types";
import { HABIT_COUNT, habitsFor } from "../habits";
import { planProgress } from "../plan";
import { dayTotals, dueFollowUps, formatRate, lastImprovement, rates, weekTotals } from "../sales/calc";
import type { SalesData } from "../sales/types";
import { computeStreak } from "../streak";

/**
 * Resumen de los datos que se manda con cada consulta al asistente. Solo números y
 * estados: no incluye nombres de prospectos, notas ni movimientos uno por uno.
 */
export function buildContext(
  core: AppData | null,
  finance: FinanceData | null,
  sales: SalesData | null,
  today: DateKey,
): string {
  const lines: string[] = [];
  const now = zonedParts();
  lines.push(`Fecha: ${formatLong(today)}, ${String(now.hour).padStart(2, "0")}:${String(now.minute).padStart(2, "0")} (Buenos Aires).`);

  if (core) {
    const s = computeStreak(core, today);
    lines.push(
      s.dayNumber === 0
        ? "Racha sin consumir: hoy registró un desliz; mañana empieza el día 1."
        : `Racha sin consumir: día ${s.dayNumber} (${s.cleanDays} días cumplidos).` +
            (s.daysUntilCritical > 0 ? ` Faltan ${s.daysUntilCritical} días para el día 13.` : s.dayNumber === 13 ? " Hoy es el día 13, su punto crítico." : ""),
    );
    lines.push(`Plan escrito para el día 13: ${core.settings.day13Plan.trim() ? "sí" : "no"}.`);
    const plan = planProgress(core.settings.planStartDate, today);
    if (plan.month) lines.push(`Plan de 90 días: día ${plan.day}, mes ${plan.month}.`);

    const habits = habitsFor(today);
    const log = core.days[today]?.habits ?? {};
    const done = habits.filter((h) => log[h.id]).map((h) => h.title);
    const pending = habits.filter((h) => !log[h.id]).map((h) => `${h.title}${h.time ? ` (${h.time})` : ""}`);
    lines.push(`Hábitos de hoy: ${done.length} de ${HABIT_COUNT}. Hechos: ${done.join(", ") || "ninguno"}. Pendientes: ${pending.join(", ") || "ninguno"}.`);

    let clean = 0;
    let habitTotal = 0;
    for (let i = 1; i <= 7; i++) {
      const d = core.days[addDays(today, -i)];
      if (d?.habits.clean) clean++;
      habitTotal += Object.values(d?.habits ?? {}).filter(Boolean).length;
    }
    const slips = core.slips.filter((x) => x.date > addDays(today, -8)).length;
    const cravings = core.cravings.filter((c) => c.endedAt && c.startedAt.slice(0, 10) > addDays(today, -8)).length;
    lines.push(
      `Últimos 7 días: ${clean} días sin consumir confirmados, ${slips} deslices, ${cravings} momentos de ganas atravesados, ${habitTotal} hábitos cumplidos en total.`,
    );
  }

  if (finance) {
    const month = monthOf(today);
    const m = monthSummary(finance, month);
    lines.push(
      `Finanzas de ${formatMonth(month)}: ingresos ${formatArs(m.income)}, gastos ${formatArs(m.expense)}, saldo ${formatArs(m.balance)}.`,
    );
    if (m.byCategory.length > 0) {
      lines.push(`Gastos principales: ${m.byCategory.slice(0, 5).map((c) => `${c.category} ${formatArs(c.amount)}`).join(", ")}.`);
    }
    const budgets = budgetLines(finance, month);
    if (budgets.length > 0) {
      lines.push(`Presupuesto: ${budgets.map((b) => `${b.category} ${percent(b.ratio)} usado`).join(", ")}.`);
    }
    const plan = snowballPlan(finance.debts, finance.settings.extraPayment, month);
    if (plan.order.length > 0) {
      const total = plan.order.reduce((a, d) => a + d.debt.balance, 0);
      lines.push(
        `Deudas: ${plan.order.length}, total ${formatArs(total)}, pago mensual ${formatArs(plan.monthlyBudget)}. ` +
          (plan.endMonth ? `Fin estimado con bola de nieve: ${formatMonth(plan.endMonth)}. ` : "Con estas cuotas alguna no se termina. ") +
          `La más chica: ${formatArs(plan.order[0].debt.balance)}.`,
      );
    } else lines.push("Deudas: ninguna cargada.");
    for (const g of finance.goals) {
      lines.push(
        g.target > 0
          ? `${g.name}: ${formatArs(g.saved)} de ${formatArs(g.target)} (${percent(ratio(g.saved, g.target))}).`
          : `${g.name}: ${formatArs(g.saved)}, sin objetivo definido.`,
      );
    }
  }

  if (sales) {
    const t = dayTotals(sales, today);
    const g = sales.goals;
    lines.push(
      `Ventas hoy: ${t.calls}/${g.dailyCalls} llamadas, ${t.contacts}/${g.dailyContacts} contactos efectivos, ${t.closings}/${g.dailyClosings} cierres. Conversión ${formatRate(rates(t).conversion)}.`,
    );
    const w = weekTotals(sales, today);
    lines.push(
      `Ventas de la semana: ${w.calls}/${g.weeklyCalls} llamadas, ${w.contacts}/${g.weeklyContacts} contactos, ${w.closings}/${g.weeklyClosings} cierres. Conversión ${formatRate(rates(w).conversion)}.`,
    );
    if (g.commissionPerClosing > 0) lines.push(`Comisión estimada de la semana: ${formatArs(w.closings * g.commissionPerClosing)}.`);
    const active = sales.prospects.filter((p) => p.status !== "cerrado" && p.status !== "perdido").length;
    lines.push(`Prospectos activos: ${active}. Seguimientos pendientes para hoy: ${dueFollowUps(sales, today).length}.`);
    const imp = lastImprovement(sales, today);
    if (imp) lines.push(`Lo que se propuso mejorar en ventas: "${imp.text.slice(0, 200)}".`);
  }

  return lines.join("\n");
}
