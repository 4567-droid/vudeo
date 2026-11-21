import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "amber" | "ghost" | "light";

const variants: Record<Variant, string> = {
  primary: "px-5 bg-forest text-white active:bg-forest/90",
  secondary: "px-5 border border-line bg-white text-ink active:bg-paper",
  amber: "px-5 bg-amber-ink text-white active:bg-amber-ink/90",
  ghost: "text-muted underline underline-offset-4 active:text-ink",
  light: "px-5 bg-white text-forest active:bg-white/90",
};

const baseClass =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition-colors disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  onClick,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
