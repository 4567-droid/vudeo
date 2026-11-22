import { asArray, asNumber, asRecord, LocalStore, newId } from "../data/local-store";
import type { DateKey } from "../date";
import { DEFAULT_GOALS, DEFAULT_SCRIPTS } from "./content";
import type { SalesRepository } from "./repository";
import type { Counter, Prospect, SalesData, SalesDay, SalesGoals, Script } from "./types";

export function createSalesData(): SalesData {
  const now = new Date().toISOString();
  return {
    version: 1,
    goals: { ...DEFAULT_GOALS },
    days: {},
    prospects: [],
    scripts: DEFAULT_SCRIPTS.map((s) => ({ ...s, updatedAt: now })),
  };
}

export function normalizeSales(raw: unknown): SalesData {
  const base = createSalesData();
  const r = asRecord<unknown>(raw);
  const g = asRecord<unknown>(r.goals);
  const goals = Object.fromEntries(
    Object.entries(DEFAULT_GOALS).map(([k, v]) => [k, asNumber(g[k], v)]),
  ) as unknown as SalesGoals;
  return {
    version: 1,
    goals,
    days: asRecord<SalesDay>(r.days),
    prospects: asArray<Prospect>(r.prospects),
    scripts: Array.isArray(r.scripts) ? asArray<Script>(r.scripts) : base.scripts,
  };
}

function emptyDay(date: DateKey): SalesDay {
  return { date, calls: 0, contacts: 0, closings: 0, prep: [], wins: "", improve: "" };
}

function withDay(d: SalesData, date: DateKey, fn: (day: SalesDay) => SalesDay): SalesData {
  const day = { ...emptyDay(date), ...d.days[date] };
  return { ...d, days: { ...d.days, [date]: fn(day) } };
}

export class LocalSalesRepository implements SalesRepository {
  private store = new LocalStore<SalesData>("rumbo:ventas:v1", createSalesData, normalizeSales);

  async load() {
    return this.store.read();
  }

  subscribe(listener: (data: SalesData) => void) {
    return this.store.subscribe(listener);
  }

  bump(date: DateKey, counter: Counter, delta: number) {
    return this.store.mutate((d) =>
      withDay(d, date, (day) => ({ ...day, [counter]: Math.max(0, day[counter] + delta) })),
    );
  }

  togglePrep(date: DateKey, stepId: string) {
    return this.store.mutate((d) =>
      withDay(d, date, (day) => ({
        ...day,
        prep: day.prep.includes(stepId)
          ? day.prep.filter((s) => s !== stepId)
          : [...day.prep, stepId],
      })),
    );
  }

  setReview(date: DateKey, review: { wins?: string; improve?: string }) {
    return this.store.mutate((d) => withDay(d, date, (day) => ({ ...day, ...review })));
  }

  updateGoals(patch: Partial<SalesGoals>) {
    return this.store.mutate((d) => ({ ...d, goals: { ...d.goals, ...patch } }));
  }

  saveProspect(p: Omit<Prospect, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    return this.store.mutate((d) => {
      const now = new Date().toISOString();
      const existing = p.id ? d.prospects.find((x) => x.id === p.id) : undefined;
      const next: Prospect = {
        id: existing?.id ?? newId(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        name: p.name.trim() || "Sin nombre",
        phone: p.phone.trim(),
        status: p.status,
        nextContact: p.nextContact,
        notes: p.notes,
      };
      return {
        ...d,
        prospects: existing
          ? d.prospects.map((x) => (x.id === next.id ? next : x))
          : [...d.prospects, next],
      };
    });
  }

  deleteProspect(id: string) {
    return this.store.mutate((d) => ({ ...d, prospects: d.prospects.filter((x) => x.id !== id) }));
  }

  saveScript(s: Omit<Script, "id" | "updatedAt"> & { id?: string }) {
    return this.store.mutate((d) => {
      const existing = s.id ? d.scripts.find((x) => x.id === s.id) : undefined;
      const next: Script = {
        id: existing?.id ?? newId(),
        kind: s.kind,
        title: s.title.trim() || "Guion",
        body: s.body,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...d,
        scripts: existing
          ? d.scripts.map((x) => (x.id === next.id ? next : x))
          : [...d.scripts, next],
      };
    });
  }

  deleteScript(id: string) {
    return this.store.mutate((d) => ({ ...d, scripts: d.scripts.filter((x) => x.id !== id) }));
  }

  resetScript(id: string) {
    return this.store.mutate((d) => {
      const original = DEFAULT_SCRIPTS.find((s) => s.id === id);
      if (!original) return d;
      const restored = { ...original, updatedAt: new Date().toISOString() };
      return {
        ...d,
        scripts: d.scripts.some((x) => x.id === id)
          ? d.scripts.map((x) => (x.id === id ? restored : x))
          : [...d.scripts, restored],
      };
    });
  }
}
