import { CRITICAL_DAY, type StreakInfo } from "@/lib/streak";
import { ButtonLink } from "./Button";
import { Card } from "./Card";
import { IconArrowRight } from "./icons";

export function CriticalDayCard({ streak, hasPlan }: { streak: StreakInfo; hasPlan: boolean }) {
  const left = streak.daysUntilCritical;
  let headline: string;
  let body: string;

  if (streak.dayNumber === 0) {
    headline = "13 días";
    body = "Mañana arranca el día 1. El día 13 suele ser el más difícil: tener un plan escrito ayuda.";
  } else if (left > 0) {
    headline = `Faltan ${left} ${left === 1 ? "día" : "días"}`;
    body = "Es el día en que más cuesta. Dejá escrito qué vas a hacer, así ese día no tenés que decidir.";
  } else if (streak.dayNumber === CRITICAL_DAY) {
    headline = "Es hoy";
    body = "Seguí tu plan paso a paso. Si aparecen las ganas, usá el contador de 20 minutos.";
  } else {
    headline = "Ya lo pasaste";
    body = "Tu plan queda guardado por si lo necesitás de nuevo.";
  }

  return (
    <Card tone="amber">
      <h2 className="text-[15px] font-semibold">Día 13: tu punto crítico</h2>
      <p className="tabular mt-1 text-[32px] font-semibold leading-tight tracking-tight">{headline}</p>
      <p className="mt-2 text-[15px] leading-relaxed">{body}</p>
      <ButtonLink href="/plan#dia-13" variant="amber" className="mt-4 w-full">
        {hasPlan ? "Ver mi plan para el día 13" : "Planificar el día 13"}
        <IconArrowRight width={18} height={18} />
      </ButtonLink>
    </Card>
  );
}
