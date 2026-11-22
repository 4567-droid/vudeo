"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { IconCheck } from "@/components/icons";
import { Segmented, textareaClass } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { formatLong, zonedParts } from "@/lib/date";
import { useSales } from "@/lib/sales";
import { lastImprovement } from "@/lib/sales/calc";
import { PREP_STEPS } from "@/lib/sales/content";

/** Ritual de ventas: preparación antes de las 8:00 y repaso al terminar la jornada. */
export function Ritual() {
  const { data, repo, run } = useSales();
  const { today } = useRumbo();
  const [mode, setMode] = useState<"antes" | "despues">(() => (zonedParts().hour < 14 ? "antes" : "despues"));
  const [draft, setDraft] = useState<{ wins?: string; improve?: string }>({});
  if (!data) return null;

  const day = data.days[today];
  const prep = day?.prep ?? [];
  const prev = lastImprovement(data, today);
  const wins = draft.wins ?? day?.wins ?? "";
  const improve = draft.improve ?? day?.improve ?? "";

  const saveReview = (field: "wins" | "improve") => {
    const value = draft[field];
    if (value === undefined) return;
    void run(repo.setReview(today, { [field]: value }));
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold">Ritual de ventas</h2>
      <div className="mt-3">
        <Segmented
          label="Momento del día"
          value={mode}
          onChange={setMode}
          options={[
            { id: "antes", label: "Antes de empezar" },
            { id: "despues", label: "Al terminar" },
          ]}
        />
      </div>

      {mode === "antes" ? (
        <>
          <p className="tabular mt-3 text-sm text-muted">
            {prep.length} de {PREP_STEPS.length} pasos
          </p>
          <ul className="mt-1">
            {PREP_STEPS.map((s) => {
              const checked = prep.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => run(repo.togglePrep(today, s.id))}
                    className="flex min-h-[52px] w-full items-start gap-3 rounded-2xl py-2 text-left"
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        checked ? "border-forest bg-forest text-white" : "border-line text-transparent"
                      }`}
                    >
                      <IconCheck width={14} height={14} />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[15px] leading-snug ${checked ? "text-muted line-through" : ""}`}>
                        {s.text}
                      </span>
                      {s.id === "mejora" && (
                        <span className="mt-1 block rounded-xl bg-amber px-3 py-2 text-sm text-amber-ink">
                          {prev ? (
                            <>
                              <span className="font-semibold first-letter:uppercase">{formatLong(prev.date)}: </span>
                              {prev.text}
                            </>
                          ) : (
                            "Todavía no anotaste qué mejorar. Lo hacés en el repaso al terminar."
                          )}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-[15px] font-medium">¿Qué salió bien hoy?</span>
            <textarea
              id="ritual-wins"
              rows={3}
              value={wins}
              onChange={(e) => setDraft({ ...draft, wins: e.target.value })}
              onBlur={() => saveReview("wins")}
              placeholder="Una llamada, una objeción bien manejada, la constancia…"
              className={`${textareaClass} mt-1.5`}
            />
          </label>
          <label className="block">
            <span className="text-[15px] font-medium">¿Qué mejorás mañana?</span>
            <textarea
              id="ritual-improve"
              rows={3}
              value={improve}
              onChange={(e) => setDraft({ ...draft, improve: e.target.value })}
              onBlur={() => saveReview("improve")}
              placeholder="Una sola cosa concreta. Mañana la vas a ver al empezar."
              className={`${textareaClass} mt-1.5`}
            />
          </label>
          <p className="text-sm text-muted">Se guarda solo al salir de cada campo.</p>
        </div>
      )}
    </Card>
  );
}
