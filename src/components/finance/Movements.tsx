"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Empty, Sheet } from "@/components/ui";
import { formatLong } from "@/lib/date";
import { useFinance, type Transaction } from "@/lib/finance";
import { formatMoney, monthSummary, type MonthKey } from "@/lib/finance/calc";

export function Movements({ month }: { month: MonthKey }) {
  const { data, repo, run } = useFinance();
  const [selected, setSelected] = useState<Transaction | null>(null);
  if (!data) return null;

  const { transactions } = monthSummary(data, month);
  const byDate = new Map<string, Transaction[]>();
  for (const t of transactions) byDate.set(t.date, [...(byDate.get(t.date) ?? []), t]);

  return (
    <Card className="px-2 py-4">
      <h2 className="px-3 text-lg font-semibold">Movimientos</h2>
      {transactions.length === 0 ? (
        <div className="mt-3 px-3">
          <Empty>Todavía no hay movimientos este mes. Registrá el primero arriba.</Empty>
        </div>
      ) : (
        <div className="mt-1">
          {[...byDate.entries()].map(([date, items]) => (
            <section key={date} className="mt-2">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted">
                {formatLong(date)}
              </h3>
              <ul>
                {items.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(t)}
                      className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-3 py-2 text-left active:bg-paper"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium">{t.category}</span>
                        {t.note && <span className="block truncate text-sm text-muted">{t.note}</span>}
                      </span>
                      <span
                        className={`tabular shrink-0 text-[15px] font-semibold ${
                          t.type === "ingreso" ? "text-forest" : ""
                        }`}
                      >
                        {t.type === "ingreso" ? "+" : "−"}
                        {formatMoney(t.amount, data.settings)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Sheet open={selected !== null} onClose={() => setSelected(null)} title="Movimiento">
        {selected && (
          <>
            <p className="text-[15px] text-muted first-letter:uppercase">{formatLong(selected.date)}</p>
            <p className="tabular mt-1 text-2xl font-semibold">
              {selected.type === "ingreso" ? "+" : "−"}
              {formatMoney(selected.amount, data.settings)}
            </p>
            <p className="mt-1 text-[15px]">
              {selected.type === "ingreso" ? "Ingreso" : "Gasto"} · {selected.category}
            </p>
            {selected.note && <p className="mt-2 text-[15px] text-muted">{selected.note}</p>}
            <Button
              variant="secondary"
              className="mt-5 w-full"
              onClick={async () => {
                await run(repo.deleteTransaction(selected.id));
                setSelected(null);
              }}
            >
              Borrar movimiento
            </Button>
          </>
        )}
      </Sheet>
    </Card>
  );
}
