import { Easing, interpolate } from "remotion";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const cutEase = Easing.bezier(0.7, 0, 0.3, 1); // rápido, como una navaja
export const outEase = Easing.bezier(0.16, 1, 0.3, 1);
export const inOutEase = Easing.bezier(0.65, 0, 0.35, 1);

export const progress = (f: number, from: number, dur: number, easing = outEase) =>
  interpolate(f, [from, from + dur], [0, 1], { ...clamp, easing });

// Corte diagonal: el borde sigue la dirección de la línea del logo (de abajo-izquierda
// a arriba-derecha) y barre el recuadro desde la esquina superior izquierda.
const MARGIN = 40;
export const sweepC = (p: number, w: number, h: number) => -MARGIN + p * (w + h + MARGIN * 2);

/** Muestra la región x + y < c (lo que entra). */
export const revealClip = (p: number, w: number, h: number): string | undefined => {
  if (p >= 1) return undefined;
  const c = sweepC(p, w, h);
  if (c <= 0) return "polygon(0px 0px, 0px 0px, 0px 0px)";
  return `polygon(0px 0px, ${c}px 0px, 0px ${c}px)`;
};

/** Muestra la región x + y > c (lo que sale). */
export const hideClip = (p: number, w: number, h: number): string | undefined => {
  if (p <= 0) return undefined;
  if (p >= 1) return "polygon(0px 0px, 0px 0px, 0px 0px)";
  const c = sweepC(p, w, h);
  const B = (w + h) * 2;
  return `polygon(${c}px 0px, ${B}px 0px, ${B}px ${B}px, 0px ${B}px, 0px ${c}px)`;
};
