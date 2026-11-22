"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { formatArs } from "@/lib/finance/calc";
import { useSales, type Counter } from "@/lib/sales";
import { dayTotals, formatRate, rates, weekTotals } from "@/lib/sales/calc";
import { salesWeekReport } from "@/lib/sales/report";
import { saveFile } from "@/lib/share-file";

const COUNTERS: { id: Counter; label: string; short: string }[] = [
  { id: "calls", label: "Llamadas", short: "1 llamada" },
  { id: "contacts", label: "Contactos efectivos", short: "1 contacto efectivo" },
  { id: "closings", label: "Cierres", short: "1 cierre" },
];

export function SalesToday() {
  const { data, repo, run } = useSales();
  const { today } = useRumbo();
  if (!data) return null;

  const t = dayTotals(data, today);
  const r = rates(t);
  const g = data.goals;
  const goal: Record<Counter, number> = {
    calls: g.dailyCalls,
    contacts: g.dailyContacts,
    closings: g.dailyClosings,
  };

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Hoy</h2>
        <p className="text-sm text-muted">Tocá + en cada llamada</p>
      </div>

      <ul className="mt-3 space-y-3">
        {COUNTERS.map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-medium">{c.label}</span>
                <span className="tabular text-[15px] font-semibold">
                  {t[c.id]}
                  <span className="font-normal text-muted"> / {goal[c.id]}</span>
                </span>
              </div>
              <div className="mt-1.5">
                <ProgressBar
                  kind="goal"
                  value={goal[c.id] > 0 ? Math.min(1, t[c.id] / goal[c.id]) : 0}
                  label={`${c.label}: ${t[c.id]} de ${goal[c.id]}`}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => run(repo.bump(today, c.id, -1))}
              disabled={t[c.id] === 0}
              aria-label={`Restar ${c.short}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-xl font-semibold text-muted disabled:opacity-40"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => run(repo.bump(today, c.id, 1))}
              aria-label={`Sumar ${c.short}`}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest text-2xl font-semibold text-white active:bg-forest/85"
            >
              +
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-paper p-3 text-center">
        <Rate label="Conversión" value={formatRate(r.conversion)} strong />
        <Rate label="Contacto" value={formatRate(r.contactRate)} />
        <Rate label="Cierre" value={formatRate(r.closeRate)} />
      </div>
      <p className="mt-2 text-xs text-muted">
        Conversión = cierres / llamadas. Contacto = contactos / llamadas. Cierre = cierres / contactos.
      </p>
      {g.commissionPerClosing > 0 && (
        <p className="tabular mt-2 text-[15px]">
          Comisión estimada hoy: <strong>{formatArs(t.closings * g.commissionPerClosing)}</strong>
        </p>
      )}
    </Card>
  );
}

function Rate({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className={`tabular text-xl font-semibold ${strong ? "text-forest" : ""}`}>{value}</p>
      <p className="text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

export function SalesWeek() {
  const { data } = useSales();
  const { today } = useRumbo();
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  if (!data) return null;
  const t = weekTotals(data, today);
  const g = data.goals;

  const exportPdf = async () => {
    setState("busy");
    try {
      await saveFile(salesWeekReport(data, today, today), `rumbo-ventas-semana-${today}.pdf`);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold">Esta semana</h2>
      <ul className="mt-3 space-y-3">
        {[
          { label: "Llamadas", v: t.calls, goal: g.weeklyCalls },
          { label: "Contactos efectivos", v: t.contacts, goal: g.weeklyContacts },
          { label: "Cierres", v: t.closings, goal: g.weeklyClosings },
        ].map((x) => (
          <li key={x.label}>
            <div className="flex items-baseline justify-between gap-2 text-[15px]">
              <span>{x.label}</span>
              <span className="tabular font-semibold">
                {x.v} <span className="font-normal text-muted">/ {x.goal}</span>
              </span>
            </div>
            <div className="mt-1.5">
              <ProgressBar kind="goal" value={x.goal > 0 ? Math.min(1, x.v / x.goal) : 0} label={`${x.label} de la semana`} size="sm" />
            </div>
          </li>
        ))}
      </ul>
      <p className="tabular mt-3 text-sm text-muted">
        Conversión de la semana: {formatRate(rates(t).conversion)}
        {g.commissionPerClosing > 0 && ` · Comisión estimada: ${formatArs(t.closings * g.commissionPerClosing)}`}
      </p>
      <Button variant="secondary" className="mt-4 w-full" onClick={exportPdf} disabled={state === "busy"}>
        {state === "busy" ? "Armando el PDF…" : "Reporte semanal en PDF"}
      </Button>
      {state === "error" && <p className="mt-2 text-sm text-amber-ink">No se pudo generar el PDF. Probá de nuevo.</p>}
    </Card>
  );
}
