"use client";

import { Card } from "@/components/Card";
import { Day13PlanField } from "@/components/Day13PlanField";
import { MonthPlan } from "@/components/MonthPlan";
import { PageHeader, Skeleton } from "@/components/PageHeader";
import { SettingsSection } from "@/components/SettingsSection";
import { WeekTemplate } from "@/components/WeekTemplate";
import { useRumbo } from "@/hooks/useRumbo";
import { formatShort } from "@/lib/date";
import { PLAN_LENGTH, planProgress } from "@/lib/plan";

export default function PlanPage() {
  const { ready, data, today } = useRumbo();

  if (!ready || !data) {
    return (
      <>
        <PageHeader title="Plan de 90 días" />
        <div className="mt-4">
          <Skeleton heights={[120, 260, 260]} />
        </div>
      </>
    );
  }

  const progress = planProgress(data.settings.planStartDate, today);
  let status: string;
  if (progress.day === 0) status = `Empieza el ${formatShort(data.settings.planStartDate)}`;
  else if (progress.day > PLAN_LENGTH) status = "Completaste los 90 días";
  else status = `Día ${progress.day} de ${PLAN_LENGTH}`;

  return (
    <>
      <PageHeader title="Plan de 90 días" />
      <div className="mt-4 space-y-4">
        <Card>
          <div className="flex items-baseline justify-between">
            <p className="tabular text-lg font-semibold">{status}</p>
            <p className="text-sm text-muted">Desde el {formatShort(data.settings.planStartDate)}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-forest-soft">
            <div
              className="h-full rounded-full bg-forest"
              style={{ width: `${progress.progress * 100}%` }}
            />
          </div>
          <div className="mt-2 grid grid-cols-3 text-xs font-medium text-muted">
            <span>Base</span>
            <span className="text-center">Foco</span>
            <span className="text-right">Expansión</span>
          </div>
        </Card>

        <MonthPlan currentMonth={progress.month} />

        <WeekTemplate today={today} />

        <Day13PlanField />

        <SettingsSection />
      </div>
    </>
  );
}
