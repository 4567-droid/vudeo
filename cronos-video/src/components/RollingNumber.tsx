import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { DISPLAY } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LH = 1.14; // alto de cada fila del rodillo, en em

/**
 * Número que entra girando dígito por dígito y frena en su valor final
 * (el ancho no cambia mientras gira, así el número no "baila").
 * Devuelve el fotograma de aterrizaje con landFrame() para sincronizar golpes.
 */
export const RollingNumber: React.FC<{
  readonly value: string;
  readonly at: number;
  readonly fontSize: number;
  readonly color?: string;
}> = ({ value, at, fontSize, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const land = landFrame(value, at);
  // golpe al aterrizar: leve zoom y temblor
  const after = frame - land;
  const kick = interpolate(after, [0, 10], [1, 0], clamp);
  const shake = 16 * kick * (after >= 0 ? 1 : 0);
  let digit = 0;

  return (
    <div
      style={{
        display: "flex",
        fontFamily: DISPLAY,
        fontSize,
        lineHeight: LH,
        color,
        textShadow: "0 10px 40px rgba(0,0,0,0.6)",
        scale: 1 + 0.07 * kick * (after >= 0 ? 1 : 0),
        translate: `${(random(`rx${frame}`) - 0.5) * shake}px ${(random(`ry${frame}`) - 0.5) * shake}px`,
      }}
    >
      {value.split("").map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={i} style={{ opacity: interpolate(frame, [at, at + 4], [0, 1], clamp) }}>
              {ch}
            </span>
          );
        }
        const k = digit++;
        const start = at + k * 0.8;
        const end = start + 10 + k * 0.4;
        const p = interpolate(frame, [start, end], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.2, 0.85, 0.3, 1.1),
        });
        const target = Number(ch);
        const loops = 2 + (k % 2);
        const strip = Array.from({ length: loops * 10 + target + 2 }, (_, j) => j % 10);
        const last = loops * 10 + target;
        return (
          <span
            key={i}
            style={{
              position: "relative",
              display: "inline-block",
              height: `${LH}em`,
              overflow: "hidden",
              opacity: interpolate(frame, [start, start + 2], [0, 1], clamp),
            }}
          >
            <span style={{ visibility: "hidden" }}>{ch}</span>
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                textAlign: "center",
                translate: `0px ${-p * last * LH}em`,
                filter: `blur(${interpolate(p, [0, 0.8, 1], [5, 2, 0], clamp)}px)`,
              }}
            >
              {strip.map((d, j) => (
                <span key={j} style={{ display: "block", height: `${LH}em` }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Fotograma (relativo) en el que el último dígito queda quieto. */
export const landFrame = (value: string, at: number) => {
  const digits = value.replace(/\D/g, "").length;
  const k = digits - 1;
  return Math.ceil(at + k * 0.8 + 10 + k * 0.4);
};
