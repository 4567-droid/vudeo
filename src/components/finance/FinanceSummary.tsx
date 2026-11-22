"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field, inputClass, Sheet } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { useFinance } from "@/lib/finance";
import {
  addMonths,
  formatArs,
  formatMoney,
  formatMonth,
  monthOf,
  monthSummary,
  parseAmount,
  type MonthKey,
} from "@/lib/finance/calc";
import { financeMonthReport } from "@/lib/finance/report";
import { saveFile } from "@/lib/share-file";

export function FinanceSummary({
  month,
  onMonthChange,
}: {
  month: MonthKey;
  onMonthChange(m: MonthKey): void;
}) {
  const { data, repo, run } = useFinance();
  const { today } = useRumbo();
  const [rateOpen, setRateOpen] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "busy" | "error">("idle");
  if (!data) return null;

  const s = monthSummary(data, month);
  const settings = data.settings;
  const isCurrent = month === monthOf(today);

  const setDisplay = (display: "ARS" | "USD") => {
    if (display === "USD" && settings.usdRate <= 0) {
      setRateOpen(true);
      return;
    }
    void run(repo.updateSettings({ display }));
  };

  const exportPdf = async () => {
    setPdfState("busy");
    try {
      const blob = financeMonthReport(data, month, today);
      await saveFile(blob, `rumbo-finanzas-${month}.pdf`);
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  };

  return (
    <Card tone="forest" className="p-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Mes anterior"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white/80 active:bg-white/10"
        >
          ‹
        </button>
        <p className="text-[15px] font-semibold first-letter:uppercase">{formatMonth(month)}</p>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          disabled={isCurrent}
          aria-label="Mes siguiente"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white/80 active:bg-white/10 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <p className="mt-2 text-sm font-medium text-white/70">Saldo del mes</p>
      <p className="tabular text-[36px] font-semibold leading-tight tracking-tight">
        {formatMoney(s.balance, settings)}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 px-3 py-2.5">
          <p className="text-xs font-medium text-white/70">Ingresos</p>
          <p className="tabular text-[17px] font-semibold">{formatMoney(s.income, settings)}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2.5">
          <p className="text-xs font-medium text-white/70">Gastos</p>
          <p className="tabular text-[17px] font-semibold">{formatMoney(s.expense, settings)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 rounded-2xl bg-white/10 p-1" role="radiogroup" aria-label="Moneda">
          <div className="flex">
            {(["ARS", "USD"] as const).map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={settings.display === c}
                onClick={() => setDisplay(c)}
                className={`min-h-[40px] flex-1 rounded-xl text-[14px] font-semibold ${
                  settings.display === c ? "bg-white text-forest" : "text-white/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRateOpen(true)}
          className="min-h-[48px] rounded-2xl px-3 text-left text-xs leading-tight text-white/80 active:bg-white/10"
        >
          {settings.usdRate > 0 ? (
            <>
              Dólar a {formatArs(settings.usdRate)}
              <span className="block underline underline-offset-2">Cambiar</span>
            </>
          ) : (
            <span className="underline underline-offset-2">Cargar tipo de cambio</span>
          )}
        </button>
      </div>

      <Button variant="light" className="mt-3 w-full" onClick={exportPdf} disabled={pdfState === "busy"}>
        {pdfState === "busy" ? "Armando el PDF…" : "Exportar resumen en PDF"}
      </Button>
      {pdfState === "error" && (
        <p className="mt-2 text-sm text-white/90">No se pudo generar el PDF. Probá de nuevo.</p>
      )}

      <RateSheet open={rateOpen} onClose={() => setRateOpen(false)} />
    </Card>
  );
}

function RateSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const { data, repo, run } = useFinance();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const current = data?.settings.usdRate ?? 0;

  const save = async () => {
    const n = parseAmount(value);
    if (!n) {
      setError(true);
      return;
    }
    await run(repo.updateSettings({ usdRate: n, display: "USD" }));
    setValue("");
    setError(false);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Tipo de cambio">
      <p className="text-[15px] leading-relaxed text-muted">
        Cuántos pesos vale un dólar. Lo cargás vos, a mano, con la cotización que uses. Los montos se
        siguen guardando en pesos.
      </p>
      <div className="mt-4">
        <Field label="Pesos por dólar" hint={current > 0 ? `Actual: ${formatArs(current)}` : undefined}>
          <input
            id="usd-rate"
            inputMode="decimal"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="Por ejemplo, 1.450"
            className={inputClass}
          />
        </Field>
        {error && <p className="mt-2 text-sm text-amber-ink">Escribí un número mayor a cero.</p>}
      </div>
      <Button className="mt-4 w-full" onClick={save}>
        Guardar y ver en dólares
      </Button>
    </Sheet>
  );
}
