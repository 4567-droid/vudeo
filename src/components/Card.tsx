import type { ComponentProps } from "react";

type Tone = "white" | "forest" | "amber";

const tones: Record<Tone, string> = {
  white: "bg-card text-ink",
  forest: "bg-forest text-white",
  amber: "bg-amber text-amber-ink",
};

interface CardProps extends ComponentProps<"section"> {
  tone?: Tone;
}

export function Card({ tone = "white", className = "", ...props }: CardProps) {
  return <section className={`rounded-card p-5 ${tones[tone]} ${className}`} {...props} />;
}
