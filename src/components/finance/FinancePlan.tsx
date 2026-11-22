"use client";

import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { IconCheck } from "@/components/icons";
import { useRumbo } from "@/hooks/useRumbo";
import { useFinance } from "@/lib/finance";
import { FINANCE_PHASES } from "@/lib/finance/content";
import { planProgress } from "@/lib/plan";

export function FinancePlan() {
  const { data, repo, run } = useFinance();
  const rumbo = useRumbo();
  if (!data || !rumbo.data) return null;
  const { day, month } = planProgress(rumbo.data.settings.planStartDate, rumbo.today);

  return (
    <div className="space-y-3">
      <p className="px-1 text-[15px] text-muted">
        Tres fases dentro de tus 90 días. {month ? `Estás en el día ${day}: fase ${month}.` : ""}
      </p>
      {FINANCE_PHASES.map((p) => {
        const current = p.number === month;
        const done = p.tasks.filter((t) => data.phaseTasks.includes(t.id)).length;
        return (
          <Card key={p.number} className={current ? "ring-2 ring-forest" : ""}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted">
                Fase {p.number} · {p.range}
              </p>
              {current && (
                <span className="rounded-full bg-forest px-2.5 py-1 text-xs font-semibold text-white">Ahora</span>
              )}
            </div>
            <h3 className="mt-1 text-xl font-semibold">{p.name}</h3>
            <p className="mt-1 text-[15px] text-muted">{p.summary}</p>
            <p className="tabular mt-2 text-sm font-medium text-muted">
              {done} de {p.tasks.length} hechas
            </p>
            <ul className="mt-1">
              {p.tasks.map((t) => {
                const checked = data.phaseTasks.includes(t.id);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => run(repo.togglePhaseTask(t.id))}
                      className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl py-2 text-left"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          checked ? "border-forest bg-forest text-white" : "border-line text-transparent"
                        }`}
                      >
                        <IconCheck width={14} height={14} />
                      </span>
                      <span className={`text-[15px] leading-snug ${checked ? "text-muted line-through" : ""}`}>
                        {t.text}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
      <ButtonLink href="/biblioteca#finanzas" variant="secondary" className="w-full">
        Lecciones de finanzas
      </ButtonLink>
    </div>
  );
}
