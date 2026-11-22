import { addDays, weekday, type DateKey } from "../date";
import type { Prospect, SalesData, SalesDay } from "./types";

export interface Totals {
  calls: number;
  contacts: number;
  closings: number;
}

export function dayTotals(data: SalesData, date: DateKey): Totals {
  const d = data.days[date];
  return { calls: d?.calls ?? 0, contacts: d?.contacts ?? 0, closings: d?.closings ?? 0 };
}

/** Lunes de la semana de `date`. */
export function weekStart(date: DateKey): DateKey {
  return addDays(date, -((weekday(date) + 6) % 7));
}

export function weekDates(date: DateKey): DateKey[] {
  const start = weekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function weekTotals(data: SalesData, date: DateKey): Totals {
  return weekDates(date).reduce(
    (t, d) => {
      const x = dayTotals(data, d);
      return { calls: t.calls + x.calls, contacts: t.contacts + x.contacts, closings: t.closings + x.closings };
    },
    { calls: 0, contacts: 0, closings: 0 },
  );
}

export interface Rates {
  /** Contactos efectivos / llamadas. */
  contactRate: number | null;
  /** Cierres / contactos efectivos. */
  closeRate: number | null;
  /** Cierres / llamadas: la conversión total. */
  conversion: number | null;
}

export function rates(t: Totals): Rates {
  return {
    contactRate: t.calls > 0 ? t.contacts / t.calls : null,
    closeRate: t.contacts > 0 ? t.closings / t.contacts : null,
    conversion: t.calls > 0 ? t.closings / t.calls : null,
  };
}

export const formatRate = (r: number | null) => (r === null ? "–" : `${Math.round(r * 100)}%`);

/** Prospectos activos con seguimiento para hoy o atrasado, del más atrasado al más nuevo. */
export function dueFollowUps(data: SalesData, today: DateKey): Prospect[] {
  return data.prospects
    .filter(
      (p) =>
        p.nextContact !== "" &&
        p.nextContact <= today &&
        p.status !== "cerrado" &&
        p.status !== "perdido",
    )
    .sort((a, b) => a.nextContact.localeCompare(b.nextContact));
}

/** Lo que se anotó para mejorar el último día con repaso, antes de hoy. */
export function lastImprovement(data: SalesData, today: DateKey): { date: DateKey; text: string } | null {
  const days = Object.values(data.days)
    .filter((d: SalesDay) => d.date < today && d.improve.trim() !== "")
    .sort((a, b) => b.date.localeCompare(a.date));
  return days[0] ? { date: days[0].date, text: days[0].improve.trim() } : null;
}
