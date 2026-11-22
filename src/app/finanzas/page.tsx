"use client";

import { useState } from "react";
import { Budgets } from "@/components/finance/Budgets";
import { Debts } from "@/components/finance/Debts";
import { FinancePlan } from "@/components/finance/FinancePlan";
import { FinanceSummary } from "@/components/finance/FinanceSummary";
import { Movements } from "@/components/finance/Movements";
import { QuickEntry } from "@/components/finance/QuickEntry";
import { Savings } from "@/components/finance/Savings";
import { PageHeader, Skeleton } from "@/components/PageHeader";
import { Tabs } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { useFinance } from "@/lib/finance";
import { monthOf, type MonthKey } from "@/lib/finance/calc";

type Tab = "movimientos" | "presupuesto" | "deudas" | "ahorro" | "plan";

const TABS: { id: Tab; label: string }[] = [
  { id: "movimientos", label: "Movimientos" },
  { id: "presupuesto", label: "Presupuesto" },
  { id: "deudas", label: "Deudas" },
  { id: "ahorro", label: "Ahorro" },
  { id: "plan", label: "Plan" },
];

export default function FinanzasPage() {
  const { ready, today } = useRumbo();
  const { data } = useFinance();
  const [tab, setTab] = useState<Tab>("movimientos");
  const [month, setMonth] = useState<MonthKey | null>(null);

  if (!ready || !data) {
    return (
      <>
        <PageHeader title="Finanzas" />
        <div className="mt-4">
          <Skeleton heights={[260, 300]} />
        </div>
      </>
    );
  }

  const shownMonth = month ?? monthOf(today);

  return (
    <>
      <PageHeader title="Finanzas" />
      <div className="mt-4 space-y-4">
        <FinanceSummary month={shownMonth} onMonthChange={setMonth} />
        <QuickEntry />
        <Tabs label="Secciones de finanzas" tabs={TABS} value={tab} onChange={setTab} />
        {tab === "movimientos" && <Movements month={shownMonth} />}
        {tab === "presupuesto" && <Budgets month={shownMonth} />}
        {tab === "deudas" && <Debts />}
        {tab === "ahorro" && <Savings />}
        {tab === "plan" && <FinancePlan />}
      </div>
    </>
  );
}
