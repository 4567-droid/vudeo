"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { inputClass } from "@/components/ui";
import { parseAmount } from "@/lib/finance/calc";
import { useSales, type SalesGoals as Goals } from "@/lib/sales";

const FIELDS: { key: keyof Goals; label: string }[] = [
  { key: "dailyCalls", label: "Llamadas por día" },
  { key: "dailyContacts", label: "Contactos efectivos por día" },
  { key: "dailyClosings", label: "Cierres por día" },
  { key: "weeklyCalls", label: "Llamadas por semana" },
  { key: "weeklyContacts", label: "Contactos efectivos por semana" },
  { key: "weeklyClosings", label: "Cierres por semana" },
];

export function SalesGoals() {
  const { data, repo, run } = useSales();
  const [values, setValues] = useState<Partial<Record<keyof Goals, string>>>({});
  const [saved, setSaved] = useState(false);
  if (!data) return null;
  const g = data.goals;
  const value = (k: keyof Goals) => values[k] ?? (g[k] > 0 ? String(g[k]) : "");

  const save = async () => {
    const patch: Partial<Goals> = {};
    for (const [k, v] of Object.entries(values) as [keyof Goals, string][]) {
      const n = k === "commissionPerClosing" ? parseAmount(v) ?? 0 : Math.max(0, Math.round(Number(v) || 0));
      patch[k] = n;
    }
    await run(repo.updateGoals(patch));
    setValues({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold">Metas</h2>
      <ul className="mt-3 space-y-2">
        {FIELDS.map((f) => (
          <li key={f.key} className="grid grid-cols-[1fr_96px] items-center gap-3">
            <label htmlFor={`goal-${f.key}`} className="text-[15px]">
              {f.label}
            </label>
            <input
              id={`goal-${f.key}`}
              inputMode="numeric"
              value={value(f.key)}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className={`${inputClass} tabular text-right`}
            />
          </li>
        ))}
        <li className="grid grid-cols-[1fr_140px] items-center gap-3 pt-2">
          <label htmlFor="goal-commission" className="text-[15px]">
            Comisión por cierre ($)
            <span className="block text-sm text-muted">Para estimar lo que ganás.</span>
          </label>
          <input
            id="goal-commission"
            inputMode="decimal"
            value={value("commissionPerClosing")}
            onChange={(e) => setValues({ ...values, commissionPerClosing: e.target.value })}
            placeholder="0"
            className={`${inputClass} tabular text-right`}
          />
        </li>
      </ul>
      <Button className="mt-4 w-full" onClick={save} disabled={Object.keys(values).length === 0}>
        {saved ? "Guardado" : "Guardar metas"}
      </Button>
    </Card>
  );
}
