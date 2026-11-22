"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Empty, Field, inputClass, Sheet } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { useFinance, type Debt, type FinanceSettings } from "@/lib/finance";
import {
  formatMoney,
  formatMonth,
  monthOf,
  parseAmount,
  showsUsd,
  snowballPlan,
  toArs,
} from "@/lib/finance/calc";

const shown = (ars: number, s: FinanceSettings) => {
  const v = showsUsd(s) ? ars / s.usdRate : ars;
  return v > 0 ? String(Math.round(v * 100) / 100).replace(".", ",") : "";
};

export function Debts() {
  const { data, repo, run } = useFinance();
  const { today } = useRumbo();
  const [editing, setEditing] = useState<Debt | "new" | null>(null);
  const [paying, setPaying] = useState<Debt | null>(null);
  const [extra, setExtra] = useState<string | null>(null);
  if (!data) return null;

  const s = data.settings;
  const plan = snowballPlan(data.debts, s.extraPayment, monthOf(today));
  const total = plan.order.reduce((a, d) => a + d.debt.balance, 0);
  const paidOff = data.debts.filter((d) => d.balance <= 0);

  const saveExtra = () => {
    if (extra === null) return;
    const n = extra.trim() === "" ? 0 : parseAmount(extra) ?? 0;
    void run(repo.updateSettings({ extraPayment: toArs(n, s) }));
    setExtra(null);
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold">Deudas: bola de nieve</h2>
      <p className="mt-1 text-[15px] leading-relaxed text-muted">
        Pagás todas las cuotas y lo extra va a la deuda más chica. Al cancelarla, su cuota se suma a
        la siguiente.
      </p>

      {plan.order.length === 0 ? (
        <div className="mt-4">
          <Empty>Cargá tus deudas para ver en qué orden pagarlas y cuándo terminás.</Empty>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-2xl bg-forest-soft p-4">
            <p className="text-sm font-medium text-forest">Fin estimado</p>
            <p className="text-xl font-semibold text-forest first-letter:uppercase">
              {plan.endMonth ? formatMonth(plan.endMonth) : "No se termina con estas cuotas"}
            </p>
            <p className="tabular mt-1 text-sm text-forest/80">
              {plan.totalMonths !== null && `${plan.totalMonths} ${plan.totalMonths === 1 ? "mes" : "meses"} · `}
              Debés {formatMoney(total, s)} · Pagás {formatMoney(plan.monthlyBudget, s)} por mes
            </p>
          </div>
          {plan.stuck && (
            <p className="mt-2 rounded-2xl bg-amber p-3 text-sm text-amber-ink">
              Alguna deuda no baja: el interés es mayor que lo que pagás. Subí la cuota o el extra.
            </p>
          )}

          <ol className="mt-4 space-y-2">
            {plan.order.map((d, i) => (
              <li key={d.debt.id} className={`rounded-2xl border p-4 ${i === 0 ? "border-forest" : "border-line"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {i === 0 ? "Foco ahora" : `${i + 1}.º`}
                    </p>
                    <p className="text-[16px] font-semibold">{d.debt.name}</p>
                  </div>
                  <p className="tabular shrink-0 text-[16px] font-semibold">{formatMoney(d.debt.balance, s)}</p>
                </div>
                <p className="tabular mt-1 text-sm text-muted">
                  Cuota {formatMoney(d.debt.payment, s)}
                  {d.debt.annualRate > 0 && ` · ${d.debt.annualRate}% anual`}
                  {" · "}
                  {d.endMonth ? `termina en ${formatMonth(d.endMonth)}` : "no termina"}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="min-h-[44px]" onClick={() => setPaying(d.debt)}>
                    Registrar pago
                  </Button>
                  <Button variant="secondary" className="min-h-[44px]" onClick={() => setEditing(d.debt)}>
                    Editar
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      <div className="mt-4">
        <Field label="Extra por mes para la bola de nieve" hint="Lo que podés sumar además de las cuotas.">
          <input
            id="debt-extra"
            inputMode="decimal"
            value={extra ?? shown(s.extraPayment, s)}
            onChange={(e) => setExtra(e.target.value)}
            onBlur={saveExtra}
            placeholder="0"
            className={`${inputClass} tabular`}
          />
        </Field>
      </div>

      <Button className="mt-4 w-full" onClick={() => setEditing("new")}>
        Agregar deuda
      </Button>

      {paidOff.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          Canceladas: {paidOff.map((d) => d.name).join(", ")}.
        </p>
      )}

      <DebtSheet debt={editing} onClose={() => setEditing(null)} />
      <PaySheet debt={paying} onClose={() => setPaying(null)} />
    </Card>
  );
}

function DebtSheet({ debt, onClose }: { debt: Debt | "new" | null; onClose(): void }) {
  const { data, repo, run } = useFinance();
  const [form, setForm] = useState<{ key: string; name: string; balance: string; payment: string; rate: string } | null>(null);
  if (!data) return null;
  const s = data.settings;
  const key = debt === null ? "" : debt === "new" ? "new" : debt.id;
  const current =
    form && form.key === key
      ? form
      : {
          key,
          name: debt && debt !== "new" ? debt.name : "",
          balance: debt && debt !== "new" ? shown(debt.balance, s) : "",
          payment: debt && debt !== "new" ? shown(debt.payment, s) : "",
          rate: debt && debt !== "new" && debt.annualRate > 0 ? String(debt.annualRate).replace(".", ",") : "",
        };
  const set = (patch: Partial<typeof current>) => setForm({ ...current, ...patch });
  const balance = parseAmount(current.balance);
  const payment = parseAmount(current.payment);
  const valid = current.name.trim() !== "" && balance !== null && payment !== null;

  const save = async () => {
    if (!valid) return;
    await run(
      repo.saveDebt({
        id: debt && debt !== "new" ? debt.id : undefined,
        name: current.name,
        balance: toArs(balance!, s),
        payment: toArs(payment!, s),
        annualRate: Number(current.rate.replace(",", ".")) || 0,
      }),
    );
    setForm(null);
    onClose();
  };

  return (
    <Sheet open={debt !== null} onClose={() => { setForm(null); onClose(); }} title={debt === "new" ? "Nueva deuda" : "Editar deuda"}>
      <div className="space-y-3">
        <Field label="Nombre">
          <input id="debt-name" value={current.name} onChange={(e) => set({ name: e.target.value })} placeholder="Tarjeta, préstamo, un amigo…" className={inputClass} />
        </Field>
        <Field label={`Lo que falta pagar${showsUsd(s) ? " (US$)" : ""}`}>
          <input id="debt-balance" inputMode="decimal" value={current.balance} onChange={(e) => set({ balance: e.target.value })} className={`${inputClass} tabular`} />
        </Field>
        <Field label={`Cuota mensual${showsUsd(s) ? " (US$)" : ""}`}>
          <input id="debt-payment" inputMode="decimal" value={current.payment} onChange={(e) => set({ payment: e.target.value })} className={`${inputClass} tabular`} />
        </Field>
        <Field label="Tasa anual (opcional)" hint="La TNA en %, si la sabés. Sirve para estimar mejor el fin.">
          <input id="debt-rate" inputMode="decimal" value={current.rate} onChange={(e) => set({ rate: e.target.value })} placeholder="0" className={`${inputClass} tabular`} />
        </Field>
      </div>
      <Button className="mt-4 w-full" onClick={save} disabled={!valid}>
        Guardar
      </Button>
      {debt && debt !== "new" && (
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={async () => {
            await run(repo.deleteDebt(debt.id));
            setForm(null);
            onClose();
          }}
        >
          Borrar deuda
        </Button>
      )}
    </Sheet>
  );
}

function PaySheet({ debt, onClose }: { debt: Debt | null; onClose(): void }) {
  const { data, repo, run } = useFinance();
  const { today } = useRumbo();
  const [value, setValue] = useState<string | null>(null);
  if (!data || !debt) return <Sheet open={false} onClose={onClose} title="Registrar pago">{null}</Sheet>;
  const s = data.settings;
  const current = value ?? shown(debt.payment, s);
  const n = parseAmount(current);

  return (
    <Sheet open onClose={() => { setValue(null); onClose(); }} title={`Pago de ${debt.name}`}>
      <Field label={`Monto${showsUsd(s) ? " (US$)" : ""}`} hint={`Saldo: ${formatMoney(debt.balance, s)}. Se registra también como gasto en "Deudas".`}>
        <input id="pay-amount" inputMode="decimal" value={current} onChange={(e) => setValue(e.target.value)} className={`${inputClass} tabular`} />
      </Field>
      <Button
        className="mt-4 w-full"
        disabled={!n}
        onClick={async () => {
          if (!n) return;
          await run(repo.payDebt(debt.id, toArs(n, s), today));
          setValue(null);
          onClose();
        }}
      >
        Registrar pago
      </Button>
    </Sheet>
  );
}
