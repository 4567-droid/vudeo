import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAFE } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Capa de texto con tiempo propio. Centra su contenido dentro de la zona segura
 * y lo saca con un golpe de zoom en los últimos fotogramas.
 */
export const Layer: React.FC<{
  readonly name: string;
  readonly from: number;
  readonly durationInFrames: number;
  readonly align?: "center" | "top";
  readonly exit?: boolean;
  readonly children: React.ReactNode;
}> = ({ name, from, durationInFrames, align = "center", exit = true, children }) => (
  <Sequence name={name} from={from} durationInFrames={durationInFrames}>
    <LayerInner dur={durationInFrames} align={align} exit={exit}>
      {children}
    </LayerInner>
  </Sequence>
);

const LayerInner: React.FC<{
  readonly dur: number;
  readonly align: "center" | "top";
  readonly exit: boolean;
  readonly children: React.ReactNode;
}> = ({ dur, align, exit, children }) => {
  const frame = useCurrentFrame();
  const out = exit ? interpolate(frame, [dur - 5, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) }) : 0;
  return (
    <AbsoluteFill
      style={{
        paddingTop: SAFE.top + (align === "top" ? 40 : 0),
        // deja lugar para el texto legal fijo de abajo
        paddingBottom: SAFE.bottom + 110,
        paddingLeft: SAFE.side,
        paddingRight: SAFE.side,
        justifyContent: align === "top" ? "flex-start" : "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          opacity: 1 - out,
          scale: 1 + out * 0.14,
          filter: `blur(${out * 10}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Entrada de golpe: aparece grande y "cae" a su tamaño. shake = temblor al aterrizar. */
export const Slam: React.FC<{
  readonly at: number;
  readonly from?: number;
  readonly shake?: number;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({ at, from = 1.7, shake = 0, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 260, mass: 0.6 } });
  const k = shake * interpolate(f, [4, 16], [1, 0], clamp);
  return (
    <div
      style={{
        opacity: interpolate(f, [0, 3], [0, 1], clamp),
        scale: interpolate(s, [0, 1], [from, 1]),
        filter: `blur(${interpolate(f, [0, 5], [10, 0], clamp)}px)`,
        translate: `${(random(`x${frame}`) - 0.5) * k}px ${(random(`y${frame}`) - 0.5) * k}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Entrada deslizando desde abajo. */
export const Rise: React.FC<{
  readonly at: number;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({ at, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 200 } });
  return (
    <div
      style={{
        opacity: interpolate(frame - at, [0, 4], [0, 1], clamp),
        translate: `0px ${interpolate(s, [0, 1], [80, 0])}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Late con el tempo (120 BPM = cada 15 fotogramas a 30 fps). */
export const Pulse: React.FC<{
  readonly start: number;
  readonly amount?: number;
  readonly children: React.ReactNode;
}> = ({ start, amount = 0.045, children }) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const phase = f < 0 ? 1 : (f % 15) / 15;
  return <div style={{ scale: 1 + amount * Math.exp(-phase * 6) * (f < 0 ? 0 : 1) }}>{children}</div>;
};

/** Caja inclinada de color detrás del texto (estilo placa comercial). */
export const Box: React.FC<{
  readonly bg: string;
  readonly color: string;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({ bg, color, style, children }) => (
  <div
    style={{
      display: "inline-block",
      backgroundColor: bg,
      color,
      padding: "0.06em 0.32em",
      transform: "skewX(-8deg)",
      boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    <div style={{ transform: "skewX(8deg)", whiteSpace: "nowrap" }}>{children}</div>
  </div>
);
