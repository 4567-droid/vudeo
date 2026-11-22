"use client";

import { useState } from "react";
import { useRumbo } from "@/hooks/useRumbo";
import { formatLong, type DateKey } from "@/lib/date";
import { Button } from "./Button";
import { Card } from "./Card";

/** Si ayer quedó sin confirmar, se puede confirmar o registrar el desliz desde HOY. */
export function YesterdayPrompt({ date }: { date: DateKey }) {
  const { setHabit, registerSlip } = useRumbo();
  const [confirmingSlip, setConfirmingSlip] = useState(false);

  return (
    <Card>
      <p className="text-sm font-medium text-muted first-letter:uppercase">{formatLong(date)}</p>
      <h2 className="mt-0.5 text-lg font-semibold">¿Ayer fue un día sin consumir?</h2>
      {confirmingSlip ? (
        <>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Se registra el desliz de ayer y hoy arranca el día 1. Tu historial se conserva.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setConfirmingSlip(false)}>
              Cancelar
            </Button>
            <Button onClick={() => registerSlip(date)}>Registrar</Button>
          </div>
        </>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={() => setHabit(date, "clean", true)}>Sí, confirmar</Button>
          <Button variant="secondary" onClick={() => setConfirmingSlip(true)}>
            No, hubo desliz
          </Button>
        </div>
      )}
    </Card>
  );
}
