import { addDays, formatLong, formatShort, type DateKey } from "../date";
import { formatArs } from "../finance/calc";
import { PdfReport } from "../pdf";
import { dayTotals, dueFollowUps, formatRate, rates, weekDates, weekTotals } from "./calc";
import { STATUS_LABELS, STATUSES } from "./content";
import type { SalesData } from "./types";

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/** Reporte semanal en PDF (lunes a domingo de la semana de `date`). */
export function salesWeekReport(data: SalesData, date: DateKey, today: DateKey): Blob {
  const days = weekDates(date);
  const t = weekTotals(data, date);
  const r0 = rates(t);
  const g = data.goals;

  const r = new PdfReport(
    "Reporte semanal de ventas",
    `Semana del ${formatShort(days[0])} al ${formatShort(days[6])} · generado el ${formatLong(today)}`,
  );

  r.heading("Resultado contra la meta");
  r.bar("Llamadas", g.weeklyCalls > 0 ? t.calls / g.weeklyCalls : 0, `${t.calls} de ${g.weeklyCalls}`);
  r.bar("Contactos efectivos", g.weeklyContacts > 0 ? t.contacts / g.weeklyContacts : 0, `${t.contacts} de ${g.weeklyContacts}`);
  r.bar("Cierres", g.weeklyClosings > 0 ? t.closings / g.weeklyClosings : 0, `${t.closings} de ${g.weeklyClosings}`);

  const rows: [string, string][] = [
    ["Tasa de contacto (contactos / llamadas)", formatRate(r0.contactRate)],
    ["Tasa de cierre (cierres / contactos)", formatRate(r0.closeRate)],
    ["Conversión total (cierres / llamadas)", formatRate(r0.conversion)],
  ];
  if (g.commissionPerClosing > 0) rows.push(["Comisión estimada", formatArs(t.closings * g.commissionPerClosing)]);
  r.keyValues(rows);

  r.heading("Día por día");
  r.table(
    ["Día", "Llamadas", "Contactos", "Cierres", "Conversión"],
    days.map((d, i) => {
      const x = dayTotals(data, d);
      return [
        `${WEEKDAYS[i]} ${formatShort(d)}`,
        String(x.calls),
        String(x.contacts),
        String(x.closings),
        formatRate(rates(x).conversion),
      ];
    }),
    [3, 1.4, 1.4, 1.4, 1.6],
    [1, 2, 3, 4],
  );

  r.heading("Prospectos");
  const counts = STATUSES.map((s) => [STATUS_LABELS[s], String(data.prospects.filter((p) => p.status === s).length)] as [string, string]);
  r.keyValues(counts);
  const due = dueFollowUps(data, addDays(days[6], 0));
  if (due.length > 0) {
    r.paragraph(`Seguimientos pendientes al cierre de la semana: ${due.length}.`, "amber");
    r.table(
      ["Prospecto", "Estado", "Próximo contacto"],
      due.slice(0, 20).map((p) => [p.name, STATUS_LABELS[p.status], formatShort(p.nextContact)]),
      [3, 2, 2],
    );
  }

  const reviews = days
    .map((d) => data.days[d])
    .filter((d) => d && (d.wins.trim() || d.improve.trim()));
  if (reviews.length > 0) {
    r.heading("Repaso de cada día");
    for (const d of reviews) {
      const label = formatLong(d.date);
      r.paragraph(label.charAt(0).toUpperCase() + label.slice(1), "muted");
      if (d.wins.trim()) r.paragraph(`Salió bien: ${d.wins.trim()}`);
      if (d.improve.trim()) r.paragraph(`Mejorar: ${d.improve.trim()}`);
    }
  }

  return r.blob();
}
