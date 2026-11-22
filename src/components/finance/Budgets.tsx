"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Empty, inputClass, ProgressBar, Sheet } from "@/components/ui";
import { useFinance } from "@/lib/finance";
import {
  budgetLines,
  formatMoney,
  monthSummary,
  parseAmount,
  percent,
  showsUsd,
  toArs,
  type MonthKey,
} from "@/lib/finance/calc";
import { EXPENSE_CATEGORIES } from "@/lib/finance/content";

export function Budgets({ month }: { month: MonthKey }) {
  const { data } = useFinance();
  const [editing, setEditing] = useState(false);
  if (!data) return null;

  const lines = budgetLines(data, month);
  const s = monthSummary(data, month);
  const withoutBudget = s.byCategory.filter((c) => !(c.category in data.budgets));
  const totalLimit = lines.reduce((a, l) => a + l.limit, 0);
  const totalSpent = lines.reduce((a, l) => a + l.spent, 0);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Presupuesto del mes</h2>
        {lines.length > 0 && (
          <p className="tabular text-sm text-muted">
            {formatMoney(totalSpent, data.settings)} de {formatMoney(totalLimit, data.settings)}
          </p>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="mt-3">
          <Empty>Poné un monto por categoría y vas a ver cuánto te queda de cada una.</Empty>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {lines.map((l) => (
            <li key={l.category}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-medium">{l.category}</span>
                <span className="tabular text-sm text-muted">
                  {formatMoney(l.spent, data.settings)} / {formatMoney(l.limit, data.settings)}
                </span>
              </div>
              <div className="mt-1.5">
                <ProgressBar value={l.ratio} label={`Presupuesto de ${l.category}`} />
              </div>
              <p className={`mt-1 text-xs ${l.ratio > 1 ? "font-semibold text-amber-ink" : "text-muted"}`}>
                {l.ratio > 1
                  ? `Te pasaste ${formatMoney(l.spent - l.limit, data.settings)}`
                  : `${percent(l.ratio)} usado · quedan ${formatMoney(l.limit - l.spent, data.settings)}`}
              </p>
            </li>
          ))}
        </ul>
      )}

      {withoutBudget.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          Sin presupuesto:{" "}
          {withoutBudget.map((c) => `${c.category} ${formatMoney(c.amount, data.settings)}`).join(" · ")}
        </p>
      )}

      <Button variant="secondary" className="mt-4 w-full" onClick={() => setEditing(true)}>
        {lines.length === 0 ? "Armar presupuesto" : "Editar presupuesto"}
      </Button>
      <BudgetSheet open={editing} onClose={() => setEditing(false)} />
    </Card>
  );
}

function BudgetSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const { data, repo, run } = useFinance();
  const [values, setValues] = useState<Record<string, string>>({});
  if (!data) return null;
  const s = data.settings;
  const shown = (ars: number) => {
    const v = showsUsd(s) ? ars / s.usdRate : ars;
    return String(Math.round(v * 100) / 100).replace(".", ",");
  };

  const save = async () => {
    for (const c of EXPENSE_CATEGORIES) {
      if (!(c in values)) continue;
      const raw = values[c].trim();
      const n = raw === "" ? null : parseAmount(raw);
      await run(repo.setBudget(c, n === null ? null : toArs(n, s)));
    }
    setValues({});
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Presupuesto mensual">
      <p className="text-[15px] text-muted">
        Monto por mes para cada categoría{showsUsd(s) ? ", en dólares" : ""}. Dejalo vacío para no
        controlarla.
      </p>
      <ul className="mt-3 space-y-2">
        {EXPENSE_CATEGORIES.map((c) => (
          <li key={c} className="grid grid-cols-[1fr_150px] items-center gap-3">
            <label htmlFor={`budget-${c}`} className="text-[15px] font-medium">
              {c}
            </label>
            <input
              id={`budget-${c}`}
              inputMode="decimal"
              value={values[c] ?? (data.budgets[c] ? shown(data.budgets[c]) : "")}
              onChange={(e) => setValues({ ...values, [c]: e.target.value })}
              placeholder="Sin límite"
              className={`${inputClass} tabular text-right`}
            />
          </li>
        ))}
      </ul>
      <Button className="mt-4 w-full" onClick={save}>
        Guardar presupuesto
      </Button>
    </Sheet>
  );
}
