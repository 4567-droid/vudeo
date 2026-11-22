"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRepository, type AppData, type HabitId, type Settings } from "@/lib/data";
import { todayKey, type DateKey } from "@/lib/date";
import { computeStreak, type StreakInfo } from "@/lib/streak";

interface RumboContextValue {
  /** false mientras se leen los datos (y durante el render en el servidor). */
  ready: boolean;
  data: AppData | null;
  today: DateKey;
  streak: StreakInfo | null;
  setHabit(date: DateKey, habit: HabitId, done: boolean): Promise<void>;
  registerSlip(date?: DateKey): Promise<void>;
  undoSlip(slipId: string): Promise<void>;
  startCraving(): Promise<void>;
  toggleCravingAction(cravingId: string, action: string): Promise<void>;
  endCraving(cravingId: string): Promise<void>;
  updateSettings(patch: Partial<Settings>): Promise<void>;
}

const RumboContext = createContext<RumboContextValue | null>(null);

/** La fecha de hoy en Buenos Aires; cambia sola a la medianoche. */
function useToday(): DateKey {
  const [today, setToday] = useState<DateKey>("");
  useEffect(() => {
    const check = () => setToday(todayKey());
    check();
    const id = setInterval(check, 30_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);
  return today;
}

export function RumboProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const today = useToday();

  useEffect(() => {
    const repo = getRepository();
    let alive = true;
    repo.load().then((d) => alive && setData(d));
    const unsubscribe = repo.subscribe((d) => setData(d));
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const run = useCallback(async (op: Promise<AppData>) => {
    setData(await op);
  }, []);

  const value = useMemo<RumboContextValue>(() => {
    const repo = getRepository();
    const ready = data !== null && today !== "";
    return {
      ready,
      data,
      today,
      streak: ready ? computeStreak(data, today) : null,
      setHabit: (date, habit, done) => run(repo.setHabit(date, habit, done)),
      registerSlip: (date) => run(repo.registerSlip(date ?? today)),
      undoSlip: (id) => run(repo.undoSlip(id)),
      startCraving: () => run(repo.startCraving()),
      toggleCravingAction: (id, action) => run(repo.toggleCravingAction(id, action)),
      endCraving: (id) => run(repo.endCraving(id)),
      updateSettings: (patch) => run(repo.updateSettings(patch)),
    };
  }, [data, today, run]);

  return <RumboContext.Provider value={value}>{children}</RumboContext.Provider>;
}

export function useRumbo(): RumboContextValue {
  const ctx = useContext(RumboContext);
  if (!ctx) throw new Error("useRumbo debe usarse dentro de <RumboProvider>");
  return ctx;
}
