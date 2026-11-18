import React from "react";
import { C, FONT_TITLE } from "../brand";

/** Ícono de Filo (SVG de la ficha, viewBox 64x64) con partes animables. */
export const LogoIcon: React.FC<{
  size: number;
  square?: number; // escala del cuadrado 0..1
  draw?: number; // trazo de la línea 0..1
  dot?: number; // tamaño del punto 0..1
}> = ({ size, square = 1, draw = 1, dot = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block", overflow: "visible" }}>
    <g style={{ transformOrigin: "32px 32px", transform: `scale(${square})` }}>
      <rect width="64" height="64" rx="14" fill={C.cobre} />
      {draw > 0 && (
        <path
          d="M14 50 L50 14"
          stroke={C.carbon}
          strokeWidth="6"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - draw}
          fill="none"
        />
      )}
      {dot > 0 && <circle cx="46" cy="46" r={5 * dot} fill={C.carbon} />}
    </g>
  </svg>
);

/** Ícono + palabra FILO en Archivo 900 (como en la ficha y las stories). */
export const LogoLockup: React.FC<{
  icon: number;
  word: number;
  gap: number;
  letterSpacing?: number;
  square?: number;
  draw?: number;
  dot?: number;
  wordReveal?: number; // 0..1, revela la palabra de izquierda a derecha
}> = ({ icon, word, gap, letterSpacing = -1, square, draw, dot, wordReveal = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap }}>
    <LogoIcon size={icon} square={square} draw={draw} dot={dot} />
    <div
      style={{
        fontFamily: FONT_TITLE,
        fontWeight: 900,
        fontSize: word,
        letterSpacing,
        lineHeight: 1,
        color: C.hueso,
        clipPath: `inset(-20% ${(1 - wordReveal) * 100}% -20% 0)`,
        transform: `translateX(${(1 - wordReveal) * -24}px)`,
      }}
    >
      FILO
    </div>
  </div>
);
