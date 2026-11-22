"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Empty, Field, inputClass, Sheet, textareaClass } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { addDays, diffDays, formatShort, isValidKey, type DateKey } from "@/lib/date";
import { useSales, type Prospect, type ProspectStatus } from "@/lib/sales";
import { dueFollowUps } from "@/lib/sales/calc";
import { STATUS_LABELS, STATUSES } from "@/lib/sales/content";

const statusStyle: Record<ProspectStatus, string> = {
  nuevo: "bg-paper text-ink",
  contactado: "bg-forest-soft text-forest",
  negociando: "bg-amber text-amber-ink",
  cerrado: "bg-forest text-white",
  perdido: "bg-line text-muted",
};

export function StatusPill({ status }: { status: ProspectStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function whenLabel(next: DateKey | "", today: DateKey): string {
  if (!next) return "Sin próximo contacto";
  const d = diffDays(today, next);
  if (d < 0) return `Atrasado ${-d} ${d === -1 ? "día" : "días"}`;
  if (d === 0) return "Hoy";
  if (d === 1) return "Mañana";
  return formatShort(next);
}

function ProspectRow({ p, onOpen }: { p: Prospect; onOpen(): void }) {
  const { today } = useRumbo();
  const late = p.nextContact !== "" && p.nextContact < today && p.status !== "cerrado" && p.status !== "perdido";
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-3 py-2 text-left active:bg-paper"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-medium">{p.name}</span>
          <span className={`block text-sm ${late ? "font-semibold text-amber-ink" : "text-muted"}`}>
            {whenLabel(p.nextContact, today)}
          </span>
        </span>
        <StatusPill status={p.status} />
      </button>
    </li>
  );
}

export function FollowUps() {
  const { data } = useSales();
  const { today } = useRumbo();
  const [open, setOpen] = useState<Prospect | null>(null);
  if (!data) return null;
  const due = dueFollowUps(data, today);

  return (
    <Card className="px-2 py-4">
      <h2 className="px-3 text-lg font-semibold">Seguimientos de hoy</h2>
      {due.length === 0 ? (
        <div className="mt-3 px-3">
          <Empty>No tenés seguimientos pendientes. Cuando cargues un prospecto, poné la fecha del próximo contacto.</Empty>
        </div>
      ) : (
        <ul className="mt-1">
          {due.map((p) => (
            <ProspectRow key={p.id} p={p} onOpen={() => setOpen(p)} />
          ))}
        </ul>
      )}
      <ProspectSheet prospect={open} onClose={() => setOpen(null)} />
    </Card>
  );
}

export function Prospects() {
  const { data } = useSales();
  const [filter, setFilter] = useState<ProspectStatus | "activos">("activos");
  const [open, setOpen] = useState<Prospect | "new" | null>(null);
  if (!data) return null;

  const list = data.prospects
    .filter((p) => (filter === "activos" ? p.status !== "cerrado" && p.status !== "perdido" : p.status === filter))
    .sort((a, b) => (a.nextContact || "9999").localeCompare(b.nextContact || "9999"));

  const filters: { id: ProspectStatus | "activos"; label: string }[] = [
    { id: "activos", label: "Activos" },
    ...STATUSES.map((s) => ({ id: s, label: STATUS_LABELS[s] })),
  ];

  return (
    <Card className="px-2 py-4">
      <div className="flex items-center justify-between gap-2 px-3">
        <h2 className="text-lg font-semibold">Prospectos</h2>
        <span className="tabular text-sm text-muted">{data.prospects.length} en total</span>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto px-3 pb-1" role="group" aria-label="Filtrar por estado">
        {filters.map((f) => {
          const count = f.id === "activos"
            ? data.prospects.filter((p) => p.status !== "cerrado" && p.status !== "perdido").length
            : data.prospects.filter((p) => p.status === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-[40px] shrink-0 rounded-full px-3.5 text-[13px] font-semibold ${
                filter === f.id ? "bg-ink text-white" : "border border-line bg-white"
              }`}
            >
              {f.label} {count}
            </button>
          );
        })}
      </div>
      {list.length === 0 ? (
        <div className="mt-3 px-3">
          <Empty>No hay prospectos en esta lista.</Empty>
        </div>
      ) : (
        <ul className="mt-2">
          {list.map((p) => (
            <ProspectRow key={p.id} p={p} onOpen={() => setOpen(p)} />
          ))}
        </ul>
      )}
      <div className="px-3">
        <Button className="mt-3 w-full" onClick={() => setOpen("new")}>
          Nuevo prospecto
        </Button>
      </div>
      <ProspectSheet prospect={open} onClose={() => setOpen(null)} />
    </Card>
  );
}

interface FormState {
  key: string;
  name: string;
  phone: string;
  status: ProspectStatus;
  nextContact: DateKey | "";
  notes: string;
}

export function ProspectSheet({ prospect, onClose }: { prospect: Prospect | "new" | null; onClose(): void }) {
  const { repo, run } = useSales();
  const { today } = useRumbo();
  const [form, setForm] = useState<FormState | null>(null);
  const key = prospect === null ? "" : prospect === "new" ? "new" : prospect.id;
  const existing = prospect && prospect !== "new" ? prospect : null;
  const f: FormState =
    form && form.key === key
      ? form
      : {
          key,
          name: existing?.name ?? "",
          phone: existing?.phone ?? "",
          status: existing?.status ?? "nuevo",
          nextContact: existing ? existing.nextContact : addDays(today, 1),
          notes: existing?.notes ?? "",
        };
  const set = (patch: Partial<FormState>) => setForm({ ...f, ...patch });
  const close = () => {
    setForm(null);
    onClose();
  };

  const quickDates: { label: string; value: DateKey | "" }[] = [
    { label: "Hoy", value: today },
    { label: "Mañana", value: addDays(today, 1) },
    { label: "En 3 días", value: addDays(today, 3) },
    { label: "En una semana", value: addDays(today, 7) },
    { label: "Sin fecha", value: "" },
  ];

  return (
    <Sheet open={prospect !== null} onClose={close} title={existing ? existing.name : "Nuevo prospecto"}>
      <div className="space-y-4">
        <Field label="Nombre">
          <input id="prospect-name" value={f.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Teléfono (opcional)">
          <input id="prospect-phone" type="tel" inputMode="tel" value={f.phone} onChange={(e) => set({ phone: e.target.value })} className={inputClass} />
        </Field>
        {existing?.phone && (
          <a href={`tel:${existing.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-forest underline underline-offset-4">
            Llamar a {existing.phone}
          </a>
        )}
        <div>
          <p className="text-[15px] font-medium">Estado</p>
          <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Estado">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={f.status === s}
                onClick={() => set({ status: s })}
                className={`min-h-[44px] rounded-full px-4 text-[14px] font-semibold ${
                  f.status === s ? "bg-forest text-white" : "border border-line bg-white"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[15px] font-medium">Próximo contacto</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {quickDates.map((q) => (
              <button
                key={q.label}
                type="button"
                aria-pressed={f.nextContact === q.value}
                onClick={() => set({ nextContact: q.value })}
                className={`min-h-[40px] rounded-full px-3.5 text-[13px] font-semibold ${
                  f.nextContact === q.value ? "bg-ink text-white" : "border border-line bg-white"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
          <input
            id="prospect-next"
            type="date"
            aria-label="Fecha del próximo contacto"
            value={f.nextContact}
            onChange={(e) => set({ nextContact: isValidKey(e.target.value) ? e.target.value : "" })}
            className={`${inputClass} mt-2`}
          />
        </div>
        <Field label="Notas">
          <textarea id="prospect-notes" rows={4} value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Qué necesita, qué objeción puso, qué le prometiste…" className={textareaClass} />
        </Field>
      </div>
      <Button
        className="mt-5 w-full"
        disabled={f.name.trim() === ""}
        onClick={async () => {
          await run(
            repo.saveProspect({
              id: existing?.id,
              name: f.name,
              phone: f.phone,
              status: f.status,
              nextContact: f.nextContact,
              notes: f.notes,
            }),
          );
          close();
        }}
      >
        Guardar
      </Button>
      {existing && (
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={async () => {
            await run(repo.deleteProspect(existing.id));
            close();
          }}
        >
          Borrar prospecto
        </Button>
      )}
    </Sheet>
  );
}
