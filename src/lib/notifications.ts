import { msUntilNext, todayKey, zonedParts, type DateKey } from "./date";
import { trainingFor } from "./habits";

export type NotificationPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

export function permissionState(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermissionState> {
  if (permissionState() === "unsupported") return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return permissionState();
  }
}

/** Muestra una notificación local. Usa el service worker si está (en Android es obligatorio). */
export async function notify(
  title: string,
  body: string,
  tag: string,
): Promise<boolean> {
  if (permissionState() !== "granted") return false;
  const options: NotificationOptions = {
    body,
    tag,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    lang: "es-AR",
    data: { url: "/" },
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

export type ReminderId = "wake" | "study" | "training" | "sleep";

export interface Reminder {
  id: ReminderId;
  time: string;
}

export const REMINDERS: Reminder[] = [
  { id: "wake", time: "06:30" },
  { id: "study", time: "15:30" },
  { id: "training", time: "17:30" },
  { id: "sleep", time: "22:30" },
];

export function reminderContent(
  id: ReminderId,
  date: DateKey,
  dayNumber: number,
): { title: string; body: string } {
  switch (id) {
    case "wake":
      if (dayNumber === 11 || dayNumber === 12) {
        const left = 13 - dayNumber;
        return {
          title: `Día ${dayNumber}: se acerca el día 13`,
          body: `Faltan ${left} ${left === 1 ? "día" : "días"}. Levantate, movete 5 minutos y repasá tu plan para el día 13.`,
        };
      }
      if (dayNumber === 13) {
        return {
          title: "Hoy es el día 13",
          body: "Es tu punto crítico. Seguí tu plan paso a paso. Levantate y movete 5 minutos.",
        };
      }
      return { title: "Son las 6:30", body: "Levantate y movete 5 minutos." };
    case "study":
      return { title: "Estudio", body: "30 minutos de estudio. Arrancá ahora." };
    case "training": {
      const t = trainingFor(date);
      if (t.title.startsWith("Descanso")) {
        return { title: "Planeá la semana", body: "Hoy es descanso. Tomate un rato para planear la semana." };
      }
      return { title: t.title, body: `${t.detail}. Es la hora.` };
    }
    case "sleep":
      return {
        title: "A dormir",
        body: "Confirmá tu día sin consumir y apagá las pantallas.",
      };
  }
}

/* ---------- Programación mientras la app está abierta ---------- */

const NOTIFIED_KEY = "rumbo:notified";
/** Si el aviso llega más tarde que esto (teléfono dormido), no se muestra. */
const MAX_LATE_MINUTES = 15;

function alreadyNotified(key: string): boolean {
  try {
    const map = JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? "{}");
    return Boolean(map[key]);
  } catch {
    return false;
  }
}

function markNotified(key: string, today: DateKey) {
  try {
    const map: Record<string, boolean> = JSON.parse(
      localStorage.getItem(NOTIFIED_KEY) ?? "{}",
    );
    map[key] = true;
    // Conservar solo los de hoy.
    for (const k of Object.keys(map)) if (!k.endsWith(today)) delete map[k];
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(map));
  } catch {
    /* sin almacenamiento */
  }
}

function minutesLate(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const p = zonedParts();
  return p.hour * 60 + p.minute - (h * 60 + m);
}

/**
 * Programa los recordatorios del día. Devuelve una función para cancelarlos.
 * `getDayNumber` se consulta al momento de disparar, para que el texto use la racha actual.
 */
export function scheduleReminders(getDayNumber: () => number): () => void {
  let timers: ReturnType<typeof setTimeout>[] = [];

  const fire = (r: Reminder) => {
    const today = todayKey();
    const key = `${r.id}:${today}`;
    const late = minutesLate(r.time);
    if (late >= 0 && late <= MAX_LATE_MINUTES && !alreadyNotified(key)) {
      markNotified(key, today);
      const { title, body } = reminderContent(r.id, today, getDayNumber());
      void notify(title, body, `rumbo-${r.id}`);
    }
  };

  const arm = () => {
    timers.forEach(clearTimeout);
    timers = REMINDERS.map((r) =>
      setTimeout(() => {
        fire(r);
        arm();
      }, msUntilNext(r.time)),
    );
  };

  // Los temporizadores se atrasan con la pantalla apagada: se rearman al volver.
  const onVisible = () => {
    if (document.visibilityState === "visible") arm();
  };

  arm();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    timers.forEach(clearTimeout);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
