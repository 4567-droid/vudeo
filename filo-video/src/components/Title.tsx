import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_TITLE, MIN_TEXT_PX, TEXT_MAX_W } from "../brand";
import { outEase, progress } from "../anim";

export type Seg = string | { t: string; accent: true };
export type Line = string | Seg[];

const reported = new Set<string>();
const warnOnce = (key: string, msg: string) => {
  if (reported.has(key)) return;
  reported.add(key);
  console.warn(msg);
};

/**
 * Título en Archivo con la palabra clave en cobre.
 * Las líneas se cortan a mano (una línea = un renglón) y aparecen de abajo hacia arriba.
 * Controles automáticos (salen en el log del render):
 *  [OVERFLOW] un renglón más ancho que el área de texto (880 px)
 *  [MINPX] un texto por debajo de 60 px
 *  [OVERLAP] el bloque baja más allá de `maxBottom`
 */
export const Title: React.FC<{
  id: string;
  lines: Line[];
  size: number;
  weight?: 900 | 800;
  color?: string;
  accent?: string;
  revealFrom?: number | null;
  lineHeight?: number;
  letterSpacing?: number;
  maxWidth?: number;
  maxBottom?: number;
  style?: React.CSSProperties;
}> = ({
  id,
  lines,
  size,
  weight = 900,
  color = C.hueso,
  accent = C.cobre,
  revealFrom = null,
  lineHeight = 1.04,
  letterSpacing = -2,
  maxWidth = TEXT_MAX_W,
  maxBottom,
  style,
}) => {
  const f = useCurrentFrame();
  const box = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    if (size < MIN_TEXT_PX) warnOnce(`${id}-min`, `[MINPX] ${id}: ${size}px < ${MIN_TEXT_PX}px`);
    rows.current.forEach((el, i) => {
      if (el && el.offsetWidth > maxWidth + 1)
        warnOnce(`${id}-${i}`, `[OVERFLOW] ${id} renglón ${i + 1}: ${el.offsetWidth}px > ${maxWidth}px`);
    });
    const b = box.current;
    if (b && maxBottom !== undefined) {
      const bottom = b.offsetTop + b.offsetHeight;
      if (bottom > maxBottom) warnOnce(`${id}-bottom`, `[OVERLAP] ${id}: termina en ${bottom}px > ${maxBottom}px`);
    }
  });

  return (
    <div
      ref={box}
      style={{
        fontFamily: FONT_TITLE,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing,
        color,
        ...style,
      }}
    >
      {lines.map((line, i) => {
        const p = revealFrom === null ? 1 : progress(f, revealFrom + i * 4, 12, outEase);
        const segs: Seg[] = typeof line === "string" ? [line] : line;
        return (
          <div key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 0.38}em)` }}>
            <span
              ref={(el) => {
                rows.current[i] = el;
              }}
              style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
              {segs.map((s, j) =>
                typeof s === "string" ? (
                  <React.Fragment key={j}>{s}</React.Fragment>
                ) : (
                  <span key={j} style={{ color: accent }}>
                    {s.t}
                  </span>
                ),
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const acc = (t: string): Seg => ({ t, accent: true });
