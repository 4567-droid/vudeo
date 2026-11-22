import { addDays, diffDays, type DateKey } from "./date";
import type { AppData } from "./data/types";

export const CRITICAL_DAY = 13;
const MILESTONES = [CRITICAL_DAY, 30, 60, 90];

export interface StreakInfo {
  today: DateKey;
  streakStart: DateKey;
  /** "Día N" de la racha. 0 el día de un desliz. */
  dayNumber: number;
  /** Días sin consumir ya cumplidos (el de hoy cuenta cuando se confirma). */
  cleanDays: number;
  slippedToday: boolean;
  todayConfirmed: boolean;
  /** Próximo hito (13, 30, 60, 90) y avance hacia él, de 0 a 1. */
  milestone: number;
  milestoneProgress: number;
  /** Días que faltan para el día 13 (0 si es hoy, negativo si ya pasó). */
  daysUntilCritical: number;
  /** Días 11 y 12: aviso fuerte. Día 13: el día en sí. */
  criticalPhase: "warning" | "critical-day" | null;
}

export function computeStreak(data: AppData, today: DateKey): StreakInfo {
  const streakStart = data.settings.streakStartDate;
  const slippedToday = data.slips.some((s) => s.date === today);
  const todayConfirmed = data.days[today]?.habits.clean === true;

  const elapsed = diffDays(streakStart, today);
  const dayNumber = slippedToday || elapsed < 0 ? 0 : elapsed + 1;
  const cleanDays =
    dayNumber === 0 ? 0 : dayNumber - 1 + (todayConfirmed ? 1 : 0);

  const milestone =
    MILESTONES.find((m) => dayNumber <= m) ?? MILESTONES[MILESTONES.length - 1];
  const milestoneProgress = Math.min(1, dayNumber / milestone);

  const daysUntilCritical = CRITICAL_DAY - dayNumber;
  const criticalPhase =
    dayNumber === 11 || dayNumber === 12
      ? "warning"
      : dayNumber === CRITICAL_DAY
        ? "critical-day"
        : null;

  return {
    today,
    streakStart,
    dayNumber,
    cleanDays,
    slippedToday,
    todayConfirmed,
    milestone,
    milestoneProgress,
    daysUntilCritical,
    criticalPhase,
  };
}

export type GridStatus = "clean" | "slip" | "unconfirmed" | "today" | "outside";

export interface GridDay {
  date: DateKey;
  status: GridStatus;
  /** Si se puede tocar para confirmar o desconfirmar. */
  editable: boolean;
}

/** Los últimos `count` días, del más viejo a hoy. */
export function lastDays(data: AppData, today: DateKey, count = 14): GridDay[] {
  const slipDates = new Set(data.slips.map((s) => s.date));
  const trackingStart = [
    data.settings.planStartDate,
    data.settings.streakStartDate,
    data.createdAt.slice(0, 10),
  ].sort()[0];

  const result: GridDay[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const clean = data.days[date]?.habits.clean === true;
    let status: GridStatus;
    if (slipDates.has(date)) status = "slip";
    else if (clean) status = "clean";
    else if (date === today) status = "today";
    else if (date < trackingStart) status = "outside";
    else status = "unconfirmed";
    result.push({ date, status, editable: status !== "slip" && status !== "outside" });
  }
  return result;
}

/** Ayer está dentro de la racha y quedó sin confirmar. */
export function yesterdayNeedsConfirmation(
  data: AppData,
  today: DateKey,
): DateKey | null {
  const y = addDays(today, -1);
  if (y < data.settings.streakStartDate) return null;
  if (data.slips.some((s) => s.date === y)) return null;
  if (data.days[y]?.habits.clean === true) return null;
  return y;
}
