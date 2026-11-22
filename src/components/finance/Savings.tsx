"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field, inputClass, ProgressBar, Segmented, Sheet } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { useFinance, type SavingsGoal } from "@/lib/finance";
import {
  averageMonthlyExpense,
  formatMoney,
  monthOf,
  parseAmount,
  percent,
  ratio,
  showsUsd,
  toArs,
} from "@/lib/finance/calc";

export function Savings() {
  const { data, repo, run } = useFinance();
  const { today } = useRumbo();
  const [contributing, setContributing] = useState<SavingsGoal | null>(null);
  const [editing, setEditing] = useState<SavingsGoal | "new" | null>(null);
  if (!data) return null;
  const s = data.settings;

  const emergency = data.goals.find((g) => g.kind === "emergencia");
  const goals = data.goals.filter((g) => g.kind === "meta");
  const avg = averageMonthlyExpense(data, monthOf(today));
  const suggestion = Math.round(avg * 3);

  return (
    <div className="space-y-3">
      {emergency && (
        <Card>
          <h2 className="text-lg font-semibold">Fondo de emergencia</h2>
          <GoalProgress goal={emergency} />
          {emergency.target === 0 && (
            <p className="mt-2 text-[15px] text-muted">
              {suggestion > 0
                ? `Con tus gastos, tres meses son ${formatMoney(suggestion, s)}.`
                : "Definí un objetivo. Lo habitual es de 3 a 6 meses de gastos; empezá por uno."}
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button className="min-h-[44px]" onClick={() => setContributing(emergency)}>
              Sumar o retirar
            </Button>
            {emergency.target === 0 && suggestion > 0 ? (
              <Button
                variant="secondary"
                className="min-h-[44px]"
                onClick={() => run(repo.saveGoal({ ...emergency, target: suggestion }))}
              >
                Usar 3 meses
              </Button>
            ) : (
              <Button variant="secondary" className="min-h-[44px]" onClick={() => setEditing(emergency)}>
                Cambiar objetivo
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold">Metas de ahorro</h2>
        {goals.length === 0 && (
          <p className="mt-1 text-[15px] text-muted">Un viaje, un curso, cambiar el celular: ponele número.</p>
        )}
        <ul className="mt-2 space-y-4">
          {goals.map((g) => (
            <li key={g.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[16px] font-semibold">{g.name}</span>
                <button
                  type="button"
                  onClick={() => setEditing(g)}
                  className="min-h-[44px] text-sm font-semibold text-muted underline underline-offset-4"
                >
                  Editar
                </button>
              </div>
              <GoalProgress goal={g} />
              <Button variant="secondary" className="mt-2 min-h-[44px] w-full" onClick={() => setContributing(g)}>
                Sumar o retirar
              </Button>
            </li>
          ))}
        </ul>
        <Button className="mt-4 w-full" onClick={() => setEditing("new")}>
          Nueva meta
        </Button>
      </Card>

      <ContributeSheet goal={contributing} onClose={() => setContributing(null)} />
      <GoalSheet goal={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function GoalProgress({ goal }: { goal: SavingsGoal }) {
  const { data } = useFinance();
  if (!data) return null;
  const s = data.settings;
  const r = ratio(goal.saved, goal.target);
  return (
    <div className="mt-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="tabular text-2xl font-semibold text-forest">
          {goal.target > 0 ? percent(Math.min(r, 1)) : formatMoney(goal.saved, s)}
        </span>
        <span className="tabular text-sm text-muted">
          {formatMoney(goal.saved, s)}
          {goal.target > 0 && ` de ${formatMoney(goal.target, s)}`}
        </span>
      </div>
      {goal.target > 0 && (
        <div className="mt-2">
          <ProgressBar kind="goal" value={Math.min(r, 1)} label={`Avance de ${goal.name}`} />
        </div>
      )}
    </div>
  );
}

function ContributeSheet({ goal, onClose }: { goal: SavingsGoal | null; onClose(): void }) {
  const { data, repo, run } = useFinance();
  const [mode, setMode] = useState<"sumar" | "retirar">("sumar");
  const [value, setValue] = useState("");
  if (!data) return null;
  const s = data.settings;
  const n = parseAmount(value);
  const close = () => {
    setValue("");
    setMode("sumar");
    onClose();
  };

  return (
    <Sheet open={goal !== null} onClose={close} title={goal?.name ?? ""}>
      <Segmented
        label="Operación"
        value={mode}
        onChange={setMode}
        options={[
          { id: "sumar", label: "Sumar" },
          { id: "retirar", label: "Retirar" },
        ]}
      />
      <div className="mt-3">
        <Field label={`Monto${showsUsd(s) ? " (US$)" : ""}`}>
          <input id="goal-amount" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className={`${inputClass} tabular`} />
        </Field>
      </div>
      <Button
        className="mt-4 w-full"
        disabled={!n || !goal}
        onClick={async () => {
          if (!n || !goal) return;
          const ars = toArs(n, s);
          await run(repo.contributeGoal(goal.id, mode === "sumar" ? ars : -ars));
          close();
        }}
      >
        {mode === "sumar" ? "Sumar" : "Retirar"}
      </Button>
    </Sheet>
  );
}

function GoalSheet({ goal, onClose }: { goal: SavingsGoal | "new" | null; onClose(): void }) {
  const { data, repo, run } = useFinance();
  const [form, setForm] = useState<{ key: string; name: string; target: string } | null>(null);
  if (!data) return null;
  const s = data.settings;
  const key = goal === null ? "" : goal === "new" ? "new" : goal.id;
  const toShown = (ars: number) =>
    ars > 0 ? String(Math.round((showsUsd(s) ? ars / s.usdRate : ars) * 100) / 100).replace(".", ",") : "";
  const current =
    form && form.key === key
      ? form
      : {
          key,
          name: goal && goal !== "new" ? goal.name : "",
          target: goal && goal !== "new" ? toShown(goal.target) : "",
        };
  const target = parseAmount(current.target);
  const isEmergency = goal !== null && goal !== "new" && goal.kind === "emergencia";
  const close = () => {
    setForm(null);
    onClose();
  };

  return (
    <Sheet open={goal !== null} onClose={close} title={goal === "new" ? "Nueva meta" : "Editar meta"}>
      <div className="space-y-3">
        {!isEmergency && (
          <Field label="Nombre">
            <input id="goal-name" value={current.name} onChange={(e) => setForm({ ...current, name: e.target.value })} className={inputClass} />
          </Field>
        )}
        <Field label={`Objetivo${showsUsd(s) ? " (US$)" : ""}`}>
          <input id="goal-target" inputMode="decimal" value={current.target} onChange={(e) => setForm({ ...current, target: e.target.value })} className={`${inputClass} tabular`} />
        </Field>
      </div>
      <Button
        className="mt-4 w-full"
        disabled={!target || (!isEmergency && current.name.trim() === "")}
        onClick={async () => {
          if (!target) return;
          await run(
            repo.saveGoal({
              id: goal && goal !== "new" ? goal.id : undefined,
              name: isEmergency ? "Fondo de emergencia" : current.name,
              target: toArs(target, s),
              saved: goal && goal !== "new" ? goal.saved : 0,
              kind: isEmergency ? "emergencia" : "meta",
            }),
          );
          close();
        }}
      >
        Guardar
      </Button>
      {goal && goal !== "new" && !isEmergency && (
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={async () => {
            await run(repo.deleteGoal(goal.id));
            close();
          }}
        >
          Borrar meta
        </Button>
      )}
    </Sheet>
  );
}
