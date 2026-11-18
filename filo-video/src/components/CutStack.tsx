import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { clamp, cutEase, hideClip, revealClip, sweepC } from "../anim";

export type Layer = { from: number; node: React.ReactNode };

/**
 * Pila de capas que se reemplazan con un corte diagonal (como una navaja).
 * - Capas opacas (escenas, capturas): la nueva entra por encima de la anterior.
 * - Capas transparentes (textos): además, la anterior se recorta al revés,
 *   para que no se vean las dos superpuestas.
 * `blade` dibuja la línea cobre sobre el borde del corte (grosor en px; 0 = sin línea).
 */
export const CutStack: React.FC<{
  layers: Layer[];
  w: number;
  h: number;
  dur: number;
  transparent?: boolean;
  blade?: number;
}> = ({ layers, w, h, dur, transparent = false, blade = 0 }) => {
  const f = useCurrentFrame();
  let bladeC: number | null = null;

  const els = layers.map((layer, i) => {
    const next = layers[i + 1];
    const until = next ? next.from + dur : Infinity;
    if (f < layer.from || f >= until) return null;
    let clip: string | undefined;
    if (i > 0 && f < layer.from + dur) {
      const p = interpolate(f, [layer.from, layer.from + dur], [0, 1], { ...clamp, easing: cutEase });
      clip = revealClip(p, w, h);
      bladeC = sweepC(p, w, h);
    }
    if (transparent && next && f >= next.from) {
      const p = interpolate(f, [next.from, next.from + dur], [0, 1], { ...clamp, easing: cutEase });
      clip = hideClip(p, w, h);
    }
    return (
      <AbsoluteFill key={i} style={{ clipPath: clip, WebkitClipPath: clip }}>
        {layer.node}
      </AbsoluteFill>
    );
  });

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h }}>
      {els}
      {blade > 0 && bladeC !== null && (
        <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "hidden" }}>
          <line
            x1={bladeC}
            y1={0}
            x2={0}
            y2={bladeC}
            stroke={C.cobre}
            strokeWidth={blade}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};
