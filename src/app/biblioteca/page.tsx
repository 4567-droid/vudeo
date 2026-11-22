"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { IconCheck } from "@/components/icons";
import { PageHeader, Skeleton } from "@/components/PageHeader";
import { Field, inputClass, ScrollToHash, Segmented, Sheet, textareaClass } from "@/components/ui";
import { useRumbo } from "@/hooks/useRumbo";
import { useLibrary } from "@/lib/library";
import { FINANCE_LESSONS, SALES_LESSONS, type Lesson } from "@/lib/library/content";
import { useSales, type Script, type ScriptKind } from "@/lib/sales";
import { DEFAULT_SCRIPTS, SCRIPT_KIND_LABELS } from "@/lib/sales/content";

export default function BibliotecaPage() {
  const { ready } = useRumbo();
  const library = useLibrary().data;
  const sales = useSales().data;
  const loaded = ready && library !== null && sales !== null;

  return (
    <>
      <PageHeader title="Biblioteca" />
      <nav aria-label="Secciones" className="mt-3 flex gap-2">
        {[
          ["#guiones", "Guiones"],
          ["#ventas", "Ventas"],
          ["#finanzas", "Finanzas"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="flex min-h-[44px] items-center rounded-full border border-line bg-white px-4 text-[14px] font-semibold"
          >
            {label}
          </a>
        ))}
      </nav>
      {!loaded ? (
        <div className="mt-4">
          <Skeleton heights={[240, 300]} />
        </div>
      ) : (
        <div className="mt-4 space-y-8">
          <Scripts />
          <Lessons
            id="ventas"
            title="Lecciones de ventas"
            note="Ideas de Brian Tracy, contadas con nuestras palabras."
            lessons={SALES_LESSONS}
          />
          <Lessons
            id="finanzas"
            title="Lecciones de finanzas"
            note="Educación financiera general. No es asesoramiento financiero."
            lessons={FINANCE_LESSONS}
          />
        </div>
      )}
      <ScrollToHash ready={loaded} />
    </>
  );
}

function Scripts() {
  const { data } = useSales();
  const [editing, setEditing] = useState<Script | "new" | null>(null);
  if (!data) return null;
  const kinds = Object.keys(SCRIPT_KIND_LABELS) as ScriptKind[];

  return (
    <section id="guiones" aria-labelledby="guiones-title" className="scroll-mt-4 space-y-3">
      <div className="px-1">
        <h2 id="guiones-title" className="text-xl font-semibold">
          Guiones
        </h2>
        <p className="mt-1 text-[15px] text-muted">
          Completá los corchetes con tu caso. Tocá uno para leerlo y editalo cuando quieras.
        </p>
      </div>
      {kinds.map((k) => {
        const list = data.scripts.filter((s) => s.kind === k);
        if (list.length === 0) return null;
        return (
          <Card key={k} className="px-2 py-3">
            <h3 className="px-3 text-sm font-semibold uppercase tracking-wider text-muted">{SCRIPT_KIND_LABELS[k]}</h3>
            <ul className="mt-1">
              {list.map((s) => (
                <li key={s.id}>
                  <details className="group rounded-2xl px-3 open:bg-paper">
                    <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-medium">
                      {s.title}
                      <span aria-hidden className="text-muted transition-transform group-open:rotate-90">
                        ›
                      </span>
                    </summary>
                    <p className="whitespace-pre-line pb-3 text-[16px] leading-relaxed">{s.body}</p>
                    <div className="flex gap-2 pb-3">
                      <Button variant="secondary" className="min-h-[44px] flex-1" onClick={() => setEditing(s)}>
                        Editar
                      </Button>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
      <Button className="w-full" onClick={() => setEditing("new")}>
        Nuevo guion
      </Button>
      <ScriptSheet script={editing} onClose={() => setEditing(null)} />
    </section>
  );
}

function ScriptSheet({ script, onClose }: { script: Script | "new" | null; onClose(): void }) {
  const { repo, run } = useSales();
  const [form, setForm] = useState<{ key: string; kind: ScriptKind; title: string; body: string } | null>(null);
  const existing = script && script !== "new" ? script : null;
  const key = script === null ? "" : existing ? existing.id : "new";
  const f =
    form && form.key === key
      ? form
      : { key, kind: existing?.kind ?? ("apertura" as ScriptKind), title: existing?.title ?? "", body: existing?.body ?? "" };
  const isDefault = existing ? DEFAULT_SCRIPTS.some((d) => d.id === existing.id) : false;
  const close = () => {
    setForm(null);
    onClose();
  };

  return (
    <Sheet open={script !== null} onClose={close} title={existing ? "Editar guion" : "Nuevo guion"}>
      <div className="space-y-3">
        <Segmented
          label="Tipo de guion"
          value={f.kind}
          onChange={(kind) => setForm({ ...f, kind })}
          options={(Object.keys(SCRIPT_KIND_LABELS) as ScriptKind[]).map((k) => ({ id: k, label: SCRIPT_KIND_LABELS[k] }))}
        />
        <Field label="Título">
          <input id="script-title" value={f.title} onChange={(e) => setForm({ ...f, title: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Texto">
          <textarea id="script-body" rows={8} value={f.body} onChange={(e) => setForm({ ...f, body: e.target.value })} className={textareaClass} />
        </Field>
      </div>
      <Button
        className="mt-4 w-full"
        disabled={f.title.trim() === "" || f.body.trim() === ""}
        onClick={async () => {
          await run(repo.saveScript({ id: existing?.id, kind: f.kind, title: f.title, body: f.body }));
          close();
        }}
      >
        Guardar
      </Button>
      {existing && isDefault && (
        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={async () => {
            await run(repo.resetScript(existing.id));
            close();
          }}
        >
          Volver al texto original
        </Button>
      )}
      {existing && (
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={async () => {
            await run(repo.deleteScript(existing.id));
            close();
          }}
        >
          Borrar guion
        </Button>
      )}
    </Sheet>
  );
}

function Lessons({ id, title, note, lessons }: { id: string; title: string; note: string; lessons: Lesson[] }) {
  const { data, repo, run } = useLibrary();
  if (!data) return null;
  const read = lessons.filter((l) => data.read.includes(l.id)).length;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-4 space-y-3">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <h2 id={`${id}-title`} className="text-xl font-semibold">
          {title}
        </h2>
        <span className="tabular text-sm text-muted">
          {read} de {lessons.length} leídas
        </span>
      </div>
      <p className="px-1 text-[15px] text-muted">{note}</p>
      <Card className="px-2 py-2">
        <ul>
          {lessons.map((l) => {
            const done = data.read.includes(l.id);
            return (
              <li key={l.id}>
                <details className="group rounded-2xl px-3 open:bg-paper">
                  <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 text-[16px] font-medium">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        done ? "border-forest bg-forest text-white" : "border-line text-transparent"
                      }`}
                      aria-label={done ? "Leída" : "Sin leer"}
                    >
                      <IconCheck width={14} height={14} />
                    </span>
                    <span className="min-w-0 flex-1">{l.title}</span>
                    <span aria-hidden className="text-muted transition-transform group-open:rotate-90">
                      ›
                    </span>
                  </summary>
                  <div className="space-y-2 pb-4 pl-9 text-[16px] leading-relaxed">
                    {l.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    <p className="rounded-2xl bg-forest-soft px-4 py-3 text-[15px] text-forest">
                      <span className="font-semibold">Para hacer hoy: </span>
                      {l.action}
                    </p>
                    <Button
                      variant={done ? "secondary" : "primary"}
                      className="min-h-[44px] w-full"
                      onClick={() => run(repo.toggleRead(l.id))}
                    >
                      {done ? "Marcar como no leída" : "Marcar como leída"}
                    </Button>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
