import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT_TEXT } from "../brand";
import { clamp, progress } from "../anim";

// Capturas originales: 780 x 1688 px.
export const SHOT_W = 780;
export const SHOT_H = 1688;
export const SCREEN_W = 528;
export const SCREEN_H = Math.round((SCREEN_W * SHOT_H) / SHOT_W); // 1143
export const BEZEL = 14;
export const PHONE_W = SCREEN_W + BEZEL * 2; // 556
export const PHONE_H = SCREEN_H + BEZEL * 2; // 1171
const K = SCREEN_W / SHOT_W; // escala captura -> pantalla

export type Box = { x: number; y: number; w: number; h: number }; // en px de la captura original

/** Marco de celular centrado con sombra. */
export const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 70,
      background: C.panel,
      border: `2px solid ${C.borde}`,
      boxSizing: "border-box",
      boxShadow: "0 70px 140px rgba(0,0,0,0.7), 0 20px 44px rgba(0,0,0,0.5)",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: BEZEL - 2,
        top: BEZEL - 2,
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: 56,
        overflow: "hidden",
        background: "#0d120b",
      }}
    >
      {children}
    </div>
  </div>
);

/**
 * Captura dentro de la pantalla, con zoom suave y, opcionalmente,
 * un recuadro cobre que se dibuja sobre un elemento real de la captura.
 */
export const Shot: React.FC<{
  src: string;
  from: number;
  dur: number;
  zoom?: number;
  focus?: Box;
  mark?: Box;
  markAt?: number;
}> = ({ src, from, dur, zoom = 0.05, focus, mark, markAt }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [from, from + dur], [1, 1 + zoom], clamp);
  const fx = focus ? (focus.x + focus.w / 2) * K : SCREEN_W / 2;
  const fy = focus ? (focus.y + focus.h / 2) * K : SCREEN_H / 2;
  const m = markAt === undefined ? 1 : progress(f, markAt, 16);
  const pad = 10;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${fx}px ${fy}px`,
        transform: `scale(${s})`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: SCREEN_W, height: SCREEN_H, display: "block" }} />
      {mark && m > 0 && (
        <svg width={SCREEN_W} height={SCREEN_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <rect
            x={mark.x * K - pad}
            y={mark.y * K - pad}
            width={mark.w * K + pad * 2}
            height={mark.h * K + pad * 2}
            rx={22}
            fill={`rgba(210,121,58,${0.1 * m})`}
            stroke={C.cobre}
            strokeWidth={5}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - m}
          />
        </svg>
      )}
    </div>
  );
};

/** Etiqueta "Ejemplo": las capturas son de la web de ejemplo (Bosco), no de un cliente real. */
export const ExampleTag: React.FC<{ style?: React.CSSProperties; opacity?: number }> = ({
  style,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      fontFamily: FONT_TEXT,
      fontWeight: 600,
      fontSize: 60,
      lineHeight: 1,
      color: C.hueso,
      background: "rgba(15,15,14,0.94)",
      border: `3px solid ${C.piedra}`,
      borderRadius: 999,
      padding: "20px 38px 22px",
      whiteSpace: "nowrap",
      opacity,
      ...style,
    }}
  >
    Ejemplo
  </div>
);
