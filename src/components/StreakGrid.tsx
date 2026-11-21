"use client";

import { formatLong, formatWeekdayNarrow, type DateKey } from "@/lib/date";
import type { GridDay, GridStatus } from "@/lib/streak";
import { IconCheck } from "./icons";

const styles: Record<GridStatus, string> = {
  clean: "bg-forest text-white",
  slip: "bg-amber text-amber-ink",
  unconfirmed: "bg-line/70 text-muted",
  today: "border-2 border-dashed border-forest/50 bg-white text-forest",
  outside: "bg-paper text-muted/60",
};

const labels: Record<GridStatus, string> = {
  clean: "cumplido",
  slip: "desliz",
  unconfirmed: "sin confirmar",
  today: "hoy, sin confirmar",
  outside: "antes de empezar",
};

interface StreakGridProps {
  days: GridDay[];
  onToggle(date: DateKey, clean: boolean): void;
}

export function StreakGrid({ days, onToggle }: StreakGridProps) {
  return (
    <div>
      <ol className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const dayNum = Number(d.date.slice(8));
          return (
            <li key={d.date} className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-muted" aria-hidden>
                {formatWeekdayNarrow(d.date)}
              </span>
              <button
                type="button"
                disabled={!d.editable}
                onClick={() => onToggle(d.date, d.status !== "clean")}
                aria-label={`${formatLong(d.date)}: ${labels[d.status]}`}
                className={`tabular flex aspect-square w-full min-h-[44px] items-center justify-center rounded-xl text-sm font-semibold transition-colors ${styles[d.status]}`}
              >
                {d.status === "clean" ? <IconCheck width={18} height={18} /> : dayNum}
              </button>
            </li>
          );
        })}
      </ol>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        <Legend className="bg-forest" label="Cumplido" />
        <Legend className="bg-line" label="Sin confirmar" />
        <Legend className="bg-amber ring-1 ring-amber-ink/30" label="Desliz" />
      </ul>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} aria-hidden />
      {label}
    </li>
  );
}
