import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="pb-1 pt-6">
      {eyebrow && <p className="text-sm font-medium text-muted first-letter:uppercase">{eyebrow}</p>}
      <h1 className="mt-0.5 text-[28px] font-semibold leading-tight tracking-tight">{title}</h1>
      {children}
    </header>
  );
}

/** Bloques grises mientras se leen los datos. */
export function Skeleton({ heights }: { heights: number[] }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      {heights.map((h, i) => (
        <div key={i} className="animate-pulse rounded-card bg-line/60" style={{ height: h }} />
      ))}
    </div>
  );
}
