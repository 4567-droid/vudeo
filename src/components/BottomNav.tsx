"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBook,
  IconChat,
  IconPlan,
  IconSales,
  IconStreak,
  IconToday,
  IconWallet,
} from "./icons";

const TABS = [
  { href: "/", label: "Hoy", Icon: IconToday },
  { href: "/racha", label: "Racha", Icon: IconStreak },
  { href: "/plan", label: "Plan", Icon: IconPlan },
  { href: "/finanzas", label: "Finanzas", Icon: IconWallet },
  { href: "/ventas", label: "Ventas", Icon: IconSales },
  { href: "/asistente", label: "Asistente", Icon: IconChat },
  { href: "/biblioteca", label: "Biblioteca", Icon: IconBook },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-[430px]">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-tight transition-colors ${
                  active ? "text-forest" : "text-muted"
                }`}
              >
                <Icon width={22} height={22} strokeWidth={active ? 2.2 : 1.8} />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
