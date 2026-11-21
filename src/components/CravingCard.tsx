"use client";

import { useEffect, useState } from "react";
import { useRumbo } from "@/hooks/useRumbo";
import { notify } from "@/lib/notifications";
import { Button } from "./Button";
import { Card } from "./Card";
import { IconCheck } from "./icons";
import { ProgressRing } from "./ProgressRing";

const DURATION_MS = 20 * 60 * 1000;
/** Un contador abandonado por más de esto ya no se muestra. */
const STALE_MS = 2 * 60 * 60 * 1000;

const ACTIONS = [
  { id: "correr", title: "Salir a correr", detail: "Aunque sean 10 minutos. Cambiá de lugar." },
  { id: "llamar", title: "Llamar a alguien", detail: "Contale que tenés ganas. No hace falta explicar más." },
  { id: "ducha", title: "Darte una ducha", detail: "Cambia cómo se siente el cuerpo en pocos minutos." },
];

function msLeft(startedAt: string): number {
  return DURATION_MS - (Date.now() - Date.parse(startedAt));
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CravingCard() {
  const { data, startCraving, toggleCravingAction, endCraving } = useRumbo();
  const [now, setNow] = useState(() => Date.now());

  const last = data?.cravings.at(-1);
  const active =
    last && !last.endedAt && now - Date.parse(last.startedAt) < STALE_MS ? last : null;
  const elapsed = active ? now - Date.parse(active.startedAt) : 0;
  const remaining = DURATION_MS - elapsed;
  const finished = active !== null && remaining <= 0;
  const overcome = data?.cravings.filter((c) => c.endedAt).length ?? 0;

  // Reloj del contador.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  // Aviso al terminar, si la app quedó en segundo plano.
  const activeId = active?.id;
  const activeStart = active?.startedAt;
  useEffect(() => {
    if (!activeId || !activeStart) return;
    const ms = msLeft(activeStart);
    if (ms <= 0) return;
    const id = setTimeout(() => {
      if (document.visibilityState === "hidden") {
        void notify("Pasaron 20 minutos", "Lo atravesaste. Volvé a Rumbo para cerrar el contador.", "rumbo-craving");
      }
    }, ms);
    return () => clearTimeout(id);
  }, [activeId, activeStart]);

  if (!active) {
    return (
      <Card>
        <h2 className="text-lg font-semibold">Tengo ganas de consumir</h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Las ganas suben y bajan. Casi siempre pasan en unos 20 minutos. Empezá el contador y hacé
          algo de la lista mientras tanto.
        </p>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            setNow(Date.now());
            void startCraving();
          }}
        >
          Empezar 20 minutos
        </Button>
        {overcome > 0 && (
          <p className="tabular mt-3 text-center text-sm text-muted">
            Ya atravesaste {overcome} {overcome === 1 ? "momento" : "momentos"} de ganas.
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="ring-2 ring-forest">
      <h2 className="text-lg font-semibold">
        {finished ? "Pasaron 20 minutos" : "Tengo ganas de consumir"}
      </h2>
      <div className="mt-4 flex items-center gap-4">
        <ProgressRing
          progress={Math.min(1, elapsed / DURATION_MS)}
          size={112}
          stroke={10}
          trackColor="#e3ece7"
          barColor="#1f4d3a"
          label="Tiempo del contador"
        >
          <span className="tabular text-2xl font-semibold leading-none text-forest" aria-live="off">
            {finished ? "0:00" : formatRemaining(remaining)}
          </span>
          <span className="mt-1 text-[11px] font-medium text-muted">
            {finished ? "listo" : "restante"}
          </span>
        </ProgressRing>
        <p className="text-[15px] leading-relaxed text-muted">
          {finished
            ? "Lo atravesaste. Cerrá el contador cuando quieras."
            : "No tenés que decidir nada ahora. Solo dejá pasar el tiempo haciendo otra cosa."}
        </p>
      </div>

      <h3 className="mt-5 text-sm font-semibold">Mientras tanto</h3>
      <ul className="mt-2 space-y-2">
        {ACTIONS.map((a) => {
          const done = active.actions.includes(a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                onClick={() => toggleCravingAction(active.id, a.id)}
                className={`flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition-colors ${
                  done ? "border-forest bg-forest-soft" : "border-line bg-white active:bg-paper"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{a.title}</span>
                  <span className="block text-sm leading-snug text-muted">{a.detail}</span>
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    done ? "bg-forest text-white" : "border-2 border-line text-transparent"
                  }`}
                >
                  <IconCheck width={14} height={14} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Button
        variant={finished ? "primary" : "secondary"}
        className="mt-4 w-full"
        onClick={() => endCraving(active.id)}
      >
        {finished ? "Listo" : "Ya se me pasaron"}
      </Button>
    </Card>
  );
}
