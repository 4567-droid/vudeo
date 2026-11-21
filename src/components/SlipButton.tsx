"use client";

import { useState } from "react";
import { useRumbo } from "@/hooks/useRumbo";
import { Button } from "./Button";
import { Card } from "./Card";

export function SlipButton() {
  const { data, today, streak, registerSlip, undoSlip } = useRumbo();
  const [confirming, setConfirming] = useState(false);

  const todaySlip = data?.slips.find((s) => s.date === today);

  if (streak?.slippedToday && todaySlip) {
    return (
      <Card>
        <h2 className="text-lg font-semibold">Desliz registrado</h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Lo que hiciste hasta acá sigue contando: tu historial está guardado. Mañana arranca el
          día 1.
        </p>
        <Button variant="ghost" className="mt-2" onClick={() => undoSlip(todaySlip.id)}>
          Lo registré por error, deshacer
        </Button>
      </Card>
    );
  }

  if (confirming) {
    return (
      <Card>
        <h2 className="text-lg font-semibold">¿Registrar un desliz hoy?</h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          El contador vuelve a 0 y mañana empieza el día 1. Tu historial se conserva.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              await registerSlip(today);
              setConfirming(false);
            }}
          >
            Registrar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="px-1 text-center">
      <Button variant="secondary" className="w-full" onClick={() => setConfirming(true)}>
        Registrar desliz
      </Button>
      <p className="mt-2 text-sm text-muted">El contador vuelve a 0. Tu historial se conserva.</p>
    </div>
  );
}
