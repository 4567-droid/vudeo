import { diffDays, weekday, type DateKey } from "./date";

export const PLAN_LENGTH = 90;

export interface PlanMonth {
  number: 1 | 2 | 3;
  name: string;
  range: string;
  summary: string;
  goals: string[];
}

/** Metas de cada mes. Editá este archivo para ajustarlas. */
export const PLAN_MONTHS: PlanMonth[] = [
  {
    number: 1,
    name: "Base",
    range: "Días 1 a 30",
    summary: "Armar la rutina. Sostenerla importa más que hacerla perfecta.",
    goals: [
      "Levantarte a las 6:30 al menos 5 días por semana.",
      "Cero consumo: pasar el día 13 y llegar al día 30.",
      "Gimnasio 4 veces por semana y correr los miércoles.",
      "Pantallas bajas desde las 20:00 y a dormir a las 22:30.",
    ],
  },
  {
    number: 2,
    name: "Foco",
    range: "Días 31 a 60",
    summary: "Con la base armada, subir la intensidad en lo que más importa.",
    goals: [
      "Subir la meta diaria de llamadas.",
      "Estudio de 30 minutos de lunes a viernes, con un tema definido.",
      "Superar tus marcas en el gimnasio cada semana y anotarlas.",
      "Identificar tus 3 situaciones de riesgo y tener una respuesta para cada una.",
    ],
  },
  {
    number: 3,
    name: "Expansión",
    range: "Días 61 a 90",
    summary: "Sumar lo nuevo sin perder lo que ya construiste.",
    goals: [
      "Avanzar tu proyecto personal todos los sábados.",
      "Una actividad social sin consumo por semana.",
      "Cumplir 6 de 7 hábitos la mayoría de los días.",
      "Llegar al día 90 y planear los próximos 90.",
    ],
  },
];

export interface WeekDayPlan {
  weekday: number;
  name: string;
  activity: string;
}

export const WEEK_TEMPLATE: WeekDayPlan[] = [
  { weekday: 1, name: "Lunes", activity: "Gimnasio" },
  { weekday: 2, name: "Martes", activity: "Gimnasio" },
  { weekday: 3, name: "Miércoles", activity: "Correr" },
  { weekday: 4, name: "Jueves", activity: "Gimnasio" },
  { weekday: 5, name: "Viernes", activity: "Gimnasio" },
  { weekday: 6, name: "Sábado", activity: "Gimnasio o proyecto" },
  { weekday: 0, name: "Domingo", activity: "Descanso y planear la semana" },
];

export interface PlanProgress {
  /** Día del plan (1 a 90). 0 si todavía no empezó, más de 90 si terminó. */
  day: number;
  month: 1 | 2 | 3 | null;
  progress: number;
}

export function planProgress(start: DateKey, today: DateKey): PlanProgress {
  const day = diffDays(start, today) + 1;
  const month =
    day < 1 || day > PLAN_LENGTH ? null : day <= 30 ? 1 : day <= 60 ? 2 : 3;
  return {
    day: Math.max(0, day),
    month,
    progress: Math.min(1, Math.max(0, day / PLAN_LENGTH)),
  };
}

export function isTodayInTemplate(date: DateKey, wd: number): boolean {
  return weekday(date) === wd;
}
