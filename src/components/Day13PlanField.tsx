"use client";

import { useEffect, useRef, useState } from "react";
import { useRumbo } from "@/hooks/useRumbo";
import { Card } from "./Card";

const SAVE_DELAY_MS = 500;

export function Day13PlanField() {
  const { data, updateSettings } = useRumbo();
  const saved = data?.settings.day13Plan ?? "";
  const [value, setValue] = useState(saved);
  const [status, setStatus] = useState<"idle" | "pending" | "saved">("idle");
  const sectionRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value);

  // Si los datos cambian desde otra pestaña y acá no se está escribiendo, se actualiza.
  const [prevSaved, setPrevSaved] = useState(saved);
  if (saved !== prevSaved) {
    setPrevSaved(saved);
    if (status !== "pending") setValue(saved);
  }

  // Llegar con /plan#dia-13 lleva directo al campo.
  useEffect(() => {
    if (window.location.hash === "#dia-13") {
      sectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  // Guardar lo pendiente al salir de la pantalla.
  const save = useRef(updateSettings);
  useEffect(() => {
    save.current = updateSettings;
  }, [updateSettings]);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        void save.current({ day13Plan: latest.current });
      }
    },
    [],
  );

  const onChange = (next: string) => {
    setValue(next);
    latest.current = next;
    setStatus("pending");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      timer.current = null;
      await updateSettings({ day13Plan: next });
      setStatus("saved");
    }, SAVE_DELAY_MS);
  };

  return (
    <Card tone="amber" id="dia-13" ref={sectionRef} className="scroll-mt-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">
          <label htmlFor="day13-plan">Plan para el día 13</label>
        </h2>
        <span className="text-sm font-medium" aria-live="polite">
          {status === "pending" ? "Guardando…" : status === "saved" ? "Guardado" : ""}
        </span>
      </div>
      <p className="mt-1 text-[15px] leading-relaxed">
        Escribilo ahora, con la cabeza clara. Ese día solo vas a tener que seguirlo.
      </p>
      <textarea
        id="day13-plan"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder={
          "Mañana: ...\nTarde: ...\nNoche: ...\nSi aparecen las ganas, llamo a: ...\nLugares y personas que evito: ..."
        }
        className="mt-3 block w-full resize-y rounded-2xl border border-amber-ink/20 bg-white p-4 text-[16px] leading-relaxed text-ink placeholder:text-muted/70 focus:border-amber-ink/50 focus:outline-none"
      />
    </Card>
  );
}
