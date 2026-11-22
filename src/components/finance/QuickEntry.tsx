"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { inputClass, Segmented, Toast } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { useFinance, type TxType } from "@/lib/finance";
import { formatMoney, parseAmount, showsUsd, toArs } from "@/lib/finance/calc";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/finance/content";
import { isValidKey } from "@/lib/date";

/** Registro en dos toques: escribir el monto y tocar la categoría. */
export function QuickEntry() {
  const { data, repo, run } = useFinance();
  const { today } = useRumbo();
  const [type, setType] = useState<TxType>("gasto");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [more, setMore] = useState(false);
  const [needAmount, setNeedAmount] = useState(false);
  const [saved, setSaved] = useState<{ id: string; text: string } | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(null), 6000);
    return () => clearTimeout(t);
  }, [saved]);

  if (!data) return null;
  const settings = data.settings;
  const categories = type === "gasto" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const save = async (category: string) => {
    const n = parseAmount(amount);
    if (!n) {
      setNeedAmount(true);
      amountRef.current?.focus();
      return;
    }
    const ars = toArs(n, settings);
    const op = repo.addTransaction({
      type,
      amount: ars,
      category,
      note: note.trim(),
      date: isValidKey(date) ? date : today,
    });
    await run(op);
    const created = (await op).transactions.at(-1);
    setSaved(
      created
        ? {
            id: created.id,
            text: `${type === "gasto" ? "Gasto" : "Ingreso"} guardado: ${category} ${formatMoney(ars, settings)}`,
          }
        : null,
    );
    setAmount("");
    setNote("");
    setDate("");
    setMore(false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Registrar</h2>
        <div className="w-[190px]">
          <Segmented
            label="Tipo de movimiento"
            value={type}
            onChange={setType}
            options={[
              { id: "gasto", label: "Gasto" },
              { id: "ingreso", label: "Ingreso" },
            ]}
          />
        </div>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Monto</span>
        <span className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[17px] font-semibold text-muted">
            {showsUsd(settings) ? "US$" : "$"}
          </span>
          <input
            id="quick-amount"
            ref={amountRef}
            inputMode="decimal"
            enterKeyHint="done"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setNeedAmount(false);
            }}
            placeholder="0"
            className={`${inputClass} tabular min-h-[56px] text-[22px] font-semibold ${
              showsUsd(settings) ? "pl-14" : "pl-9"
            }`}
          />
        </span>
      </label>
      <p className={`mt-1.5 text-sm ${needAmount ? "text-amber-ink" : "text-muted"}`}>
        {needAmount ? "Escribí el monto primero." : "Escribí el monto y tocá la categoría."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Categoría">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => save(c)}
            className="min-h-[44px] rounded-full border border-line bg-white px-4 text-[14px] font-semibold active:bg-forest active:text-white"
          >
            {c}
          </button>
        ))}
      </div>

      {more ? (
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <input
            id="quick-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota (opcional)"
            className={inputClass}
          />
          <input
            id="quick-date"
            type="date"
            value={date || today}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Fecha"
            className={`${inputClass} w-[150px] px-3`}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMore(true)}
          className="mt-2 min-h-[44px] text-[14px] font-semibold text-muted underline underline-offset-4"
        >
          Agregar nota o cambiar la fecha
        </button>
      )}

      {saved && (
        <div className="mt-3">
          <Toast
            message={saved.text}
            action="Deshacer"
            onAction={() => {
              void run(repo.deleteTransaction(saved.id));
              setSaved(null);
            }}
          />
        </div>
      )}
    </Card>
  );
}
