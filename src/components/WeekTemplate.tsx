import { weekday, type DateKey } from "@/lib/date";
import { WEEK_TEMPLATE } from "@/lib/plan";
import { Card } from "./Card";

export function WeekTemplate({ today }: { today: DateKey }) {
  const wd = weekday(today);
  return (
    <Card className="px-2 py-4">
      <h2 className="px-3 text-lg font-semibold">Semana tipo</h2>
      <ul className="mt-2">
        {WEEK_TEMPLATE.map((d) => {
          const isToday = d.weekday === wd;
          return (
            <li
              key={d.weekday}
              aria-current={isToday ? "date" : undefined}
              className={`flex min-h-[48px] items-center justify-between gap-3 rounded-2xl px-3 ${
                isToday ? "bg-forest-soft" : ""
              }`}
            >
              <span className={`text-[15px] ${isToday ? "font-semibold text-forest" : "font-medium"}`}>
                {d.name}
                {isToday && <span className="ml-2 text-xs font-semibold uppercase tracking-wider">Hoy</span>}
              </span>
              <span className={`text-right text-[15px] ${isToday ? "text-forest" : "text-muted"}`}>
                {d.activity}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
