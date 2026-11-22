import { PLAN_MONTHS } from "@/lib/plan";
import { Card } from "./Card";

export function MonthPlan({ currentMonth }: { currentMonth: 1 | 2 | 3 | null }) {
  return (
    <div className="space-y-3">
      {PLAN_MONTHS.map((m) => {
        const current = m.number === currentMonth;
        return (
          <Card key={m.number} className={current ? "ring-2 ring-forest" : ""}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted">
                Mes {m.number} · {m.range}
              </p>
              {current && (
                <span className="rounded-full bg-forest px-2.5 py-1 text-xs font-semibold text-white">
                  Ahora
                </span>
              )}
            </div>
            <h3 className="mt-1 text-xl font-semibold">{m.name}</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">{m.summary}</p>
            <ul className="mt-3 space-y-2">
              {m.goals.map((g) => (
                <li key={g} className="flex gap-3 text-[15px] leading-snug">
                  <span
                    className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${current ? "bg-forest" : "bg-muted/50"}`}
                    aria-hidden
                  />
                  {g}
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
