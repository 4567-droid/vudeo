"use client";

import { Card } from "@/components/Card";
import { CravingCard } from "@/components/CravingCard";
import { CriticalDayCard } from "@/components/CriticalDayCard";
import { PageHeader, Skeleton } from "@/components/PageHeader";
import { SlipButton } from "@/components/SlipButton";
import { StreakGrid } from "@/components/StreakGrid";
import { useRumbo } from "@/hooks/useRumbo";
import { formatShort } from "@/lib/date";
import { lastDays } from "@/lib/streak";

export default function RachaPage() {
  const { ready, data, today, streak, setHabit } = useRumbo();

  if (!ready || !data || !streak) {
    return (
      <>
        <PageHeader title="Racha" />
        <div className="mt-4">
          <Skeleton heights={[300, 200, 180]} />
        </div>
      </>
    );
  }

  const n = streak.cleanDays;

  return (
    <>
      <PageHeader title="Racha" />
      <div className="mt-4 space-y-4">
        <Card>
          <p className="text-sm font-medium text-muted">Días sin consumir</p>
          <p className="tabular mt-1 text-[56px] font-semibold leading-none tracking-tight text-forest">
            {n}
          </p>
          <p className="mt-2 text-[15px] text-muted">
            {streak.dayNumber === 0
              ? "Hoy volvés a empezar. Mañana es el día 1."
              : `Día ${streak.dayNumber} de tu racha, desde el ${formatShort(streak.streakStart)}.`}
          </p>

          <h2 className="mt-6 text-sm font-semibold">Últimos 14 días</h2>
          <div className="mt-3">
            <StreakGrid
              days={lastDays(data, today)}
              onToggle={(date, clean) => setHabit(date, "clean", clean)}
            />
          </div>
          <p className="mt-3 text-sm text-muted">Tocá un día para confirmarlo o desmarcarlo.</p>
        </Card>

        <CravingCard />

        <CriticalDayCard streak={streak} hasPlan={data.settings.day13Plan.trim() !== ""} />

        <SlipButton />
      </div>
    </>
  );
}
