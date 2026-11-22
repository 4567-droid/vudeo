/**
 * Fechas de la app, siempre en la hora de Buenos Aires.
 *
 * Un "día" se representa como clave "YYYY-MM-DD" (DateKey). Las cuentas entre
 * días se hacen en UTC sobre esa clave, así no dependen de la zona horaria del
 * dispositivo.
 */

export const TIME_ZONE = "America/Argentina/Buenos_Aires";

export type DateKey = string;

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function zonedParts(date: Date = new Date()): ZonedParts {
  const parts: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function todayKey(now: Date = new Date()): DateKey {
  const p = zonedParts(now);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

function keyToUTC(key: DateKey): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function utcToKey(ms: number): DateKey {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(key: DateKey, days: number): DateKey {
  return utcToKey(keyToUTC(key) + days * DAY_MS);
}

/** Días de `from` a `to` (positivo si `to` es posterior). */
export function diffDays(from: DateKey, to: DateKey): number {
  return Math.round((keyToUTC(to) - keyToUTC(from)) / DAY_MS);
}

/** 0 = domingo … 6 = sábado. */
export function weekday(key: DateKey): number {
  return new Date(keyToUTC(key)).getUTCDay();
}

export function isValidKey(key: string): key is DateKey {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return utcToKey(keyToUTC(key)) === key;
}

const longFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

const shortFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});

const weekdayShortFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  weekday: "narrow",
});

/** "sábado 21 de noviembre" */
export function formatLong(key: DateKey): string {
  return longFormatter.format(new Date(keyToUTC(key))).replace(",", "");
}

/** "21 nov" */
export function formatShort(key: DateKey): string {
  return shortFormatter.format(new Date(keyToUTC(key))).replace(".", "");
}

/** "S" */
export function formatWeekdayNarrow(key: DateKey): string {
  return weekdayShortFormatter.format(new Date(keyToUTC(key))).toUpperCase();
}

export function greeting(now: Date = new Date()): string {
  const { hour } = zonedParts(now);
  if (hour >= 5 && hour < 13) return "Buen día";
  if (hour >= 13 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

/** Milisegundos hasta la próxima vez que en Buenos Aires sean las HH:MM. */
export function msUntilNext(hhmm: string, now: Date = new Date()): number {
  const [h, m] = hhmm.split(":").map(Number);
  const p = zonedParts(now);
  const nowSec = p.hour * 3600 + p.minute * 60 + p.second;
  let delta = h * 3600 + m * 60 - nowSec;
  if (delta <= 0) delta += 24 * 3600;
  return delta * 1000 - now.getMilliseconds();
}

/** La DateKey que tendrá el momento `now + ms`. */
export function keyAfter(ms: number, now: Date = new Date()): DateKey {
  return todayKey(new Date(now.getTime() + ms));
}
