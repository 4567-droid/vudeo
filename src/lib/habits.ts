import { weekday, type DateKey } from "./date";
import type { HabitId } from "./data/types";

export interface HabitDef {
  id: HabitId;
  title: string;
  detail: string;
  time?: string;
}

/** Lo que toca entrenar según la semana tipo. */
export function trainingFor(date: DateKey): { title: string; detail: string } {
  switch (weekday(date)) {
    case 3:
      return { title: "Correr", detail: "Salida de running" };
    case 6:
      return { title: "Gimnasio o proyecto", detail: "Elegí uno y hacelo" };
    case 0:
      return { title: "Descanso y planear la semana", detail: "Revisá lo que viene" };
    default:
      return { title: "Gimnasio", detail: "Superar la marca" };
  }
}

export function habitsFor(date: DateKey): HabitDef[] {
  const training = trainingFor(date);
  return [
    { id: "wake", title: "Levantarte a las 6:30", detail: "Y moverte 5 minutos", time: "6:30" },
    { id: "work", title: "Trabajo: meta de llamadas", detail: "De 8:00 a 14:00", time: "8:00" },
    { id: "study", title: "Estudio", detail: "30 minutos", time: "15:30" },
    {
      id: "training",
      title: training.title,
      detail: training.detail,
      time: weekday(date) === 0 ? undefined : "17:30",
    },
    { id: "evening", title: "Cena y pantallas bajas", detail: "Desde las 20:00", time: "20:00" },
    { id: "clean", title: "Día sin consumir", detail: "Se confirma al cierre del día" },
    { id: "sleep", title: "Dormir", detail: "A las 22:30", time: "22:30" },
  ];
}

export const HABIT_COUNT = 7;
