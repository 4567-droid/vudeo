"use client";

import { CriticalDayAlert } from "@/components/CriticalDayAlert";
import { HabitList } from "@/components/HabitList";
import { PageHeader, Skeleton } from "@/components/PageHeader";
import { StreakHero } from "@/components/StreakHero";
import { YesterdayPrompt } from "@/components/YesterdayPrompt";
import { useRumbo } from "@/hooks/useRumbo";
import { formatLong, greeting } from "@/lib/date";
import { yesterdayNeedsConfirmation } from "@/lib/streak";

export default function HoyPage() {
  const { ready, data, today, streak, setHabit } = useRumbo();

  if (!ready || !data || !streak) {
    return (
      <>
        <PageHeader eyebrow=" " title="Hoy" />
        <div className="mt-4">
          <Skeleton heights={[148, 520]} />
        </div>
      </>
    );
  }

  const pendingYesterday = yesterdayNeedsConfirmation(data, today);

  return (
    <>
      <PageHeader eyebrow={formatLong(today)} title={greeting()} />
      <div className="mt-4 space-y-4">
        {streak.criticalPhase && <CriticalDayAlert streak={streak} />}
        <StreakHero streak={streak} />
        {pendingYesterday && <YesterdayPrompt date={pendingYesterday} />}
        <HabitList
          date={today}
          log={data.days[today]}
          slippedToday={streak.slippedToday}
          onToggle={(habit, done) => setHabit(today, habit, done)}
        />
      </div>
    </>
  );
}
