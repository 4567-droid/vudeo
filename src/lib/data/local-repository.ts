import { addDays, isValidKey, todayKey, type DateKey } from "../date";
import type { RumboRepository } from "./repository";
import type { AppData, Craving, HabitId, Settings, Slip } from "./types";

const STORAGE_KEY = "rumbo:data:v1";
const CORRUPT_BACKUP_KEY = "rumbo:data:corrupt";

function newId(): string {
  // crypto.randomUUID solo existe en contextos seguros (https o localhost).
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createInitialData(now: Date = new Date()): AppData {
  const today = todayKey(now);
  return {
    version: 1,
    createdAt: now.toISOString(),
    days: {},
    slips: [],
    cravings: [],
    settings: {
      planStartDate: today,
      streakStartDate: today,
      notificationsEnabled: false,
      day13Plan: "",
      dismissedAlerts: [],
    },
  };
}

/** Completa campos faltantes para que datos viejos o editados a mano no rompan la app. */
export function normalize(raw: unknown): AppData {
  const base = createInitialData();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AppData>;
  const s = (r.settings ?? {}) as Partial<Settings>;
  return {
    version: 1,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : base.createdAt,
    days: r.days && typeof r.days === "object" ? r.days : {},
    slips: Array.isArray(r.slips) ? r.slips : [],
    cravings: Array.isArray(r.cravings) ? r.cravings : [],
    settings: {
      planStartDate:
        s.planStartDate && isValidKey(s.planStartDate)
          ? s.planStartDate
          : base.settings.planStartDate,
      streakStartDate:
        s.streakStartDate && isValidKey(s.streakStartDate)
          ? s.streakStartDate
          : base.settings.streakStartDate,
      notificationsEnabled: Boolean(s.notificationsEnabled),
      day13Plan: typeof s.day13Plan === "string" ? s.day13Plan : "",
      dismissedAlerts: Array.isArray(s.dismissedAlerts)
        ? s.dismissedAlerts.slice(-60)
        : [],
    },
  };
}

/* ---------- Transformaciones puras sobre AppData ---------- */

function withHabit(
  data: AppData,
  date: DateKey,
  habit: HabitId,
  done: boolean | undefined,
): AppData {
  const prev = data.days[date] ?? { date, habits: {}, updatedAt: "" };
  const habits = { ...prev.habits };
  if (done === undefined) delete habits[habit];
  else habits[habit] = done;
  return {
    ...data,
    days: {
      ...data.days,
      [date]: { date, habits, updatedAt: new Date().toISOString() },
    },
  };
}

function maxKey(a: DateKey, b: DateKey): DateKey {
  return a > b ? a : b;
}

export function applySlip(data: AppData, date: DateKey): AppData {
  if (data.slips.some((s) => s.date === date)) return data;
  const slip: Slip = {
    id: newId(),
    date,
    at: new Date().toISOString(),
    previousStreakStart: data.settings.streakStartDate,
    previousClean: data.days[date]?.habits.clean,
  };
  const next = withHabit(data, date, "clean", false);
  return {
    ...next,
    slips: [...next.slips, slip].sort((a, b) => a.date.localeCompare(b.date)),
    settings: {
      ...next.settings,
      streakStartDate: maxKey(next.settings.streakStartDate, addDays(date, 1)),
    },
  };
}

export function applyUndoSlip(data: AppData, slipId: string): AppData {
  const slip = data.slips.find((s) => s.id === slipId);
  if (!slip) return data;
  const next = withHabit(data, slip.date, "clean", slip.previousClean);
  return {
    ...next,
    slips: next.slips.filter((s) => s.id !== slipId),
    settings: { ...next.settings, streakStartDate: slip.previousStreakStart },
  };
}

function updateCraving(
  data: AppData,
  id: string,
  fn: (c: Craving) => Craving,
): AppData {
  return {
    ...data,
    cravings: data.cravings.map((c) => (c.id === id ? fn(c) : c)),
  };
}

/* ---------- Implementación con localStorage ---------- */

export class LocalRepository implements RumboRepository {
  private cache: AppData | null = null;

  private read(): AppData {
    if (this.cache) return this.cache;
    let data: AppData;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      data = raw ? normalize(JSON.parse(raw)) : createInitialData();
      if (!raw) this.write(data);
    } catch {
      // Datos ilegibles: se guarda una copia y se arranca de cero.
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) window.localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
      } catch {
        /* sin acceso a localStorage */
      }
      data = createInitialData();
    }
    this.cache = data;
    return data;
  }

  private write(data: AppData): AppData {
    this.cache = data;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* almacenamiento lleno o bloqueado: los datos quedan en memoria */
    }
    return data;
  }

  private async mutate(fn: (data: AppData) => AppData): Promise<AppData> {
    return this.write(fn(this.read()));
  }

  async load(): Promise<AppData> {
    return this.read();
  }

  setHabit(date: DateKey, habit: HabitId, done: boolean) {
    return this.mutate((d) => withHabit(d, date, habit, done));
  }

  registerSlip(date: DateKey) {
    return this.mutate((d) => applySlip(d, date));
  }

  undoSlip(slipId: string) {
    return this.mutate((d) => applyUndoSlip(d, slipId));
  }

  startCraving() {
    return this.mutate((d) => ({
      ...d,
      cravings: [
        ...d.cravings,
        { id: newId(), startedAt: new Date().toISOString(), actions: [] },
      ],
    }));
  }

  toggleCravingAction(cravingId: string, action: string) {
    return this.mutate((d) =>
      updateCraving(d, cravingId, (c) => ({
        ...c,
        actions: c.actions.includes(action)
          ? c.actions.filter((a) => a !== action)
          : [...c.actions, action],
      })),
    );
  }

  endCraving(cravingId: string) {
    return this.mutate((d) =>
      updateCraving(d, cravingId, (c) => ({
        ...c,
        endedAt: c.endedAt ?? new Date().toISOString(),
      })),
    );
  }

  updateSettings(patch: Partial<Settings>) {
    return this.mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }

  subscribe(listener: (data: AppData) => void): () => void {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        this.cache = normalize(JSON.parse(e.newValue));
        listener(this.cache);
      } catch {
        /* ignorar cambios ilegibles */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
}
