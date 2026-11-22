"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconPlan, IconStreak, IconToday } from "./icons";

const TABS = [
  { href: "/", label: "Hoy", Icon: IconToday },
  { href: "/racha", label: "Racha", Icon: IconStreak },
  { href: "/plan", label: "Plan", Icon: IconPlan },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-[430px] px-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  active ? "text-forest" : "text-muted"
                }`}
              >
                <Icon width={24} height={24} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
