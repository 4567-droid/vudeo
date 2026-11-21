import type { StreakInfo } from "@/lib/streak";
import { CRITICAL_DAY } from "@/lib/streak";
import { Card } from "./Card";
import { ProgressRing } from "./ProgressRing";

function caption(s: StreakInfo): string {
  if (s.dayNumber === 0) return "Hoy volvés a empezar. Mañana es el día 1.";
  if (s.dayNumber < CRITICAL_DAY) {
    const left = s.daysUntilCritical;
    return `Faltan ${left} ${left === 1 ? "día" : "días"} para el día 13.`;
  }
  if (s.dayNumber === CRITICAL_DAY) return "Hoy es el día 13. Seguí tu plan.";
  if (s.dayNumber >= 90) return "Completaste 90 días.";
  return `Próximo hito: día ${s.milestone}.`;
}

export function StreakHero({ streak }: { streak: StreakInfo }) {
  return (
    <Card tone="forest" className="flex items-center gap-4 p-6">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/70">Racha sin consumir</p>
        <p className="tabular mt-1 text-[44px] font-semibold leading-none tracking-tight">
          Día {streak.dayNumber}
        </p>
        <p className="mt-3 text-[15px] leading-snug text-balance text-white/85">{caption(streak)}</p>
      </div>
      <ProgressRing
        progress={streak.milestoneProgress}
        label={`Progreso hacia el día ${streak.milestone}`}
      >
        <span className="tabular text-lg font-semibold leading-none">
          {Math.min(streak.dayNumber, streak.milestone)}
          <span className="text-white/60">/{streak.milestone}</span>
        </span>
        <span className="mt-1 text-[11px] font-medium text-white/70">días</span>
      </ProgressRing>
    </Card>
  );
}
