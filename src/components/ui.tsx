"use client";

import { useEffect, useRef, type ReactNode } from "react";

export const inputClass =
  "block min-h-[48px] w-full rounded-2xl border border-line bg-white px-4 text-[16px] text-ink placeholder:text-muted/60 focus:border-forest/60 focus:outline-none";

export const textareaClass =
  "block w-full resize-y rounded-2xl border border-line bg-white p-4 text-[16px] leading-relaxed text-ink placeholder:text-muted/60 focus:border-forest/60 focus:outline-none";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[15px] font-medium">{label}</span>
      {hint && <span className="block text-sm text-muted">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

/**
 * Barra de progreso. `limit` (presupuestos): se pone ámbar cerca del tope y al pasarlo.
 * `goal` (metas): siempre verde, llegar es lo bueno.
 */
export function ProgressBar({
  value,
  label,
  size = "md",
  kind = "limit",
}: {
  value: number;
  label: string;
  size?: "sm" | "md";
  kind?: "limit" | "goal";
}) {
  const over = kind === "limit" && value > 1;
  const near = kind === "limit" && value >= 0.85 && !over;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(Math.min(value, 1) * 100)}
      className={`overflow-hidden rounded-full ${over ? "bg-amber" : "bg-forest-soft"} ${
        size === "sm" ? "h-1.5" : "h-2"
      }`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${
          over ? "bg-amber-ink" : near ? "bg-amber-ink/70" : "bg-forest"
        }`}
        style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%` }}
      />
    </div>
  );
}

/** Pestañas en fila que se desplaza de costado si no entran. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange(id: NoInfer<T>): void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`min-h-[44px] shrink-0 rounded-full px-4 text-[14px] font-semibold transition-colors ${
            value === t.id ? "bg-forest text-white" : "border border-line bg-white text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Opciones de las que se elige una (por ejemplo Gasto / Ingreso). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange(id: NoInfer<T>): void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-2xl bg-paper p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`min-h-[40px] flex-1 rounded-xl px-3 text-[14px] font-semibold transition-colors ${
            value === o.id ? "bg-white text-ink shadow-sm" : "text-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Hoja que sube desde abajo, para formularios. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose(): void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      aria-label={title}
      className="mx-auto mb-0 mt-auto max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[20px] bg-card p-0 text-ink backdrop:bg-ink/50"
    >
      {open && (
        <div className="p-5" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl px-3 text-[15px] font-semibold text-muted"
            >
              Cerrar
            </button>
          </div>
          <div className="mt-3">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-[15px] text-muted">
      {children}
    </p>
  );
}

/** Al llegar con un #ancla, baja hasta ese bloque cuando ya está dibujado. */
export function ScrollToHash({ ready }: { ready: boolean }) {
  useEffect(() => {
    if (!ready) return;
    const id = window.location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [ready]);
  return null;
}

/** Aviso corto que se va solo, con acción opcional (por ejemplo "Deshacer"). */
export function Toast({
  message,
  action,
  onAction,
}: {
  message: string;
  action?: string;
  onAction?(): void;
}) {
  return (
    <div
      role="status"
      className="flex min-h-[48px] items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-2 text-[15px] text-white"
    >
      <span className="min-w-0">{message}</span>
      {action && (
        <button type="button" onClick={onAction} className="min-h-[40px] shrink-0 font-semibold text-amber">
          {action}
        </button>
      )}
    </div>
  );
}
