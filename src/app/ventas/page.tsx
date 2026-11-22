"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader, Skeleton } from "@/components/PageHeader";
import { FollowUps, Prospects } from "@/components/sales/Prospects";
import { Ritual } from "@/components/sales/Ritual";
import { SalesGoals } from "@/components/sales/SalesGoals";
import { SalesToday, SalesWeek } from "@/components/sales/SalesToday";
import { Tabs } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { useSales } from "@/lib/sales";
import { dueFollowUps } from "@/lib/sales/calc";
import { SCRIPT_KIND_LABELS } from "@/lib/sales/content";

type Tab = "seguimientos" | "prospectos" | "ritual" | "semana" | "metas" | "guiones";

export default function VentasPage() {
  const { ready, today } = useRumbo();
  const { data } = useSales();
  const [tab, setTab] = useState<Tab>("seguimientos");

  if (!ready || !data) {
    return (
      <>
        <PageHeader title="Ventas" />
        <div className="mt-4">
          <Skeleton heights={[320, 260]} />
        </div>
      </>
    );
  }

  const due = dueFollowUps(data, today).length;
  const tabs: { id: Tab; label: string }[] = [
    { id: "seguimientos", label: due > 0 ? `Seguimientos ${due}` : "Seguimientos" },
    { id: "prospectos", label: "Prospectos" },
    { id: "ritual", label: "Ritual" },
    { id: "semana", label: "Semana" },
    { id: "metas", label: "Metas" },
    { id: "guiones", label: "Guiones" },
  ];

  return (
    <>
      <PageHeader title="Ventas" eyebrow="Jornada de 8:00 a 14:00" />
      <div className="mt-4 space-y-4">
        <SalesToday />
        <Tabs label="Secciones de ventas" tabs={tabs} value={tab} onChange={setTab} />
        {tab === "seguimientos" && <FollowUps />}
        {tab === "prospectos" && <Prospects />}
        {tab === "ritual" && <Ritual />}
        {tab === "semana" && <SalesWeek />}
        {tab === "metas" && <SalesGoals />}
        {tab === "guiones" && (
          <Card>
            <h2 className="text-lg font-semibold">Guiones</h2>
            <ul className="mt-2 space-y-1 text-[15px]">
              {(Object.keys(SCRIPT_KIND_LABELS) as (keyof typeof SCRIPT_KIND_LABELS)[]).map((k) => (
                <li key={k} className="flex justify-between">
                  <span>{SCRIPT_KIND_LABELS[k]}</span>
                  <span className="tabular text-muted">{data.scripts.filter((s) => s.kind === k).length}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href="/biblioteca#guiones" className="mt-4 w-full">
              Abrir y editar guiones
            </ButtonLink>
            <ButtonLink href="/biblioteca#ventas" variant="secondary" className="mt-2 w-full">
              Lecciones de ventas
            </ButtonLink>
          </Card>
        )}
      </div>
    </>
  );
}
