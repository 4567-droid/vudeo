"use client";

import { useEffect, useRef } from "react";
import { useRumbo } from "@/hooks/useRumbo";
import type { StreakInfo } from "@/lib/streak";
import { Button, ButtonLink } from "./Button";
import { Card } from "./Card";
import { IconArrowRight } from "./icons";

function copy(streak: StreakInfo) {
  if (streak.criticalPhase === "critical-day") {
    return {
      title: "Hoy es el día 13",
      body: "Es tu punto crítico. No tenés que pensar nada nuevo: seguí el plan que escribiste, paso a paso.",
    };
  }
  const left = streak.daysUntilCritical;
  return {
    title: `Día ${streak.dayNumber}: faltan ${left} ${left === 1 ? "día" : "días"} para el día 13`,
    body: "El día 13 es tu punto crítico. Repasá tu plan hoy, mientras tenés la cabeza clara.",
  };
}

/** Aviso fuerte de los días 11, 12 y 13: una ventana al abrir la app y una tarjeta fija en HOY. */
export function CriticalDayAlert({ streak }: { streak: StreakInfo }) {
  const { data, today, updateSettings } = useRumbo();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const alertId = `critical-${streak.dayNumber}-${today}`;
  const plan = data?.settings.day13Plan.trim() ?? "";
  const dismissed = data?.settings.dismissedAlerts.includes(alertId) ?? true;
  const { title, body } = copy(streak);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dismissed && dialog && !dialog.open) dialog.showModal();
  }, [dismissed]);

  const dismiss = () => {
    dialogRef.current?.close();
    if (data && !dismissed) {
      void updateSettings({ dismissedAlerts: [...data.settings.dismissedAlerts, alertId] });
    }
  };

  return (
    <>
      <Card tone="amber" className="border-2 border-amber-ink/25">
        <p className="text-xs font-semibold uppercase tracking-wider">Aviso importante</p>
        <h2 className="mt-1 text-xl font-semibold leading-snug">{title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed">{body}</p>
        <ButtonLink href="/plan#dia-13" variant="amber" className="mt-4 w-full">
          {plan ? "Repasar mi plan" : "Escribir mi plan para el día 13"}
          <IconArrowRight width={18} height={18} />
        </ButtonLink>
      </Card>

      <dialog
        ref={dialogRef}
        onCancel={dismiss}
        aria-labelledby="critical-title"
        className="m-auto w-[calc(100%-32px)] max-w-[400px] rounded-card bg-amber p-0 text-amber-ink backdrop:bg-ink/50"
      >
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider">Aviso importante</p>
          <h2 id="critical-title" className="mt-1 text-2xl font-semibold leading-tight">
            {title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed">{body}</p>
          <div className="mt-4 rounded-2xl bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider">Tu plan</p>
            <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink">
              {plan || "Todavía no lo escribiste. Tomate 5 minutos para hacerlo hoy."}
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <ButtonLink href="/plan#dia-13" variant="amber" className="w-full" onClick={dismiss}>
              {plan ? "Repasar mi plan" : "Escribir mi plan"}
            </ButtonLink>
            <Button variant="secondary" className="w-full" onClick={dismiss} autoFocus>
              Entendido
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
