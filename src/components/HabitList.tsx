"use client";

import type { DayLog, HabitId } from "@/lib/data";
import type { DateKey } from "@/lib/date";
import { HABIT_COUNT, habitsFor, type HabitDef } from "@/lib/habits";
import { Card } from "./Card";
import { IconCheck } from "./icons";

interface HabitListProps {
  date: DateKey;
  log: DayLog | undefined;
  slippedToday: boolean;
  onToggle(habit: HabitId, done: boolean): void;
}

export function HabitList({ date, log, slippedToday, onToggle }: HabitListProps) {
  const habits = habitsFor(date);
  const done = habits.filter((h) => log?.habits[h.id] === true).length;

  return (
    <Card className="px-2 pb-2 pt-5">
      <div className="flex items-baseline justify-between px-3">
        <h2 className="text-lg font-semibold">Tus hábitos</h2>
        <p className="tabular text-sm font-medium text-muted" aria-live="polite">
          {done} de {HABIT_COUNT} hechos
        </p>
      </div>
      <div className="mx-3 mt-3 h-1.5 overflow-hidden rounded-full bg-forest-soft">
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-500"
          style={{ width: `${(done / HABIT_COUNT) * 100}%` }}
        />
      </div>
      <ul className="mt-2">
        {habits.map((h) => (
          <HabitItem
            key={h.id}
            habit={h}
            checked={log?.habits[h.id] === true}
            disabled={h.id === "clean" && slippedToday}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </Card>
  );
}

function HabitItem({
  habit,
  checked,
  disabled,
  onToggle,
}: {
  habit: HabitDef;
  checked: boolean;
  disabled: boolean;
  onToggle(habit: HabitId, done: boolean): void;
}) {
  const detail = disabled ? "Hoy registraste un desliz. Mañana arranca el día 1." : habit.detail;
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onToggle(habit.id, !checked)}
        className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors active:bg-paper disabled:opacity-60"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            checked ? "border-forest bg-forest text-white" : "border-line bg-white text-transparent"
          }`}
        >
          <IconCheck width={16} height={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-[16px] font-medium leading-snug ${
              checked ? "text-muted line-through decoration-1" : ""
            }`}
          >
            {habit.title}
          </span>
          <span className="block text-sm leading-snug text-muted">{detail}</span>
        </span>
        {habit.time && (
          <span className="tabular shrink-0 text-sm font-medium text-muted">{habit.time}</span>
        )}
      </button>
    </li>
  );
}
