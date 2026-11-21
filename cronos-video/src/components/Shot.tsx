import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";

type ShotProps = {
  readonly name: string;
  readonly from: number;
  readonly durationInFrames: number;
  /** Ruta dentro de public/, por ejemplo "fotos/1000227059.jpg" */
  readonly src: string;
  /** Modo "cover": paneo horizontal (object-position X en %) de inicio a fin */
  readonly x?: readonly [number, number];
  /** Modo "cover": encuadre vertical en % */
  readonly y?: number;
  /** Zoom de inicio a fin (movimiento de cámara simulado) */
  readonly zoom?: readonly [number, number];
  /**
   * Modo "fit": muestra la foto entera con este ancho en px sobre una copia
   * desenfocada. Sirve para frentes/colas donde el recorte vertical cortaría el auto.
   */
  readonly fit?: number;
  /** Modo "fit": desplazamiento horizontal en px de inicio a fin */
  readonly drift?: readonly [number, number];
  /** Relación ancho/alto de la foto (las fotos de prensa son 3:2) */
  readonly aspect?: number;
  /** Oscurecido para que el texto se lea (0 a 1) */
  readonly dim?: number;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ShotInner: React.FC<Omit<ShotProps, "name" | "from">> = ({
  durationInFrames: dur,
  src,
  x = [50, 50],
  y = 50,
  zoom = [1.04, 1.14],
  fit,
  drift = [0, 0],
  aspect = 1.5,
  dim = 0.2,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], clamp);
  // Entrada "punch": arranca más cerca y desenfocada, como un corte con golpe de zoom.
  const punch = interpolate(frame, [0, 9], [1.18, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const blur = interpolate(frame, [0, 7], [14, 0], clamp);
  const scale = interpolate(p, [0, 1], [zoom[0], zoom[1]]) * punch;
  const file = staticFile(src);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      {fit ? (
        <>
          <Img
            src={file}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              scale: 1.3,
              filter: "blur(38px) brightness(0.62)",
            }}
          />
          <Img
            src={file}
            style={{
              position: "absolute",
              width: fit,
              height: fit / aspect,
              left: (1080 - fit) / 2,
              top: (1920 - fit / aspect) / 2,
              translate: `${interpolate(p, [0, 1], [drift[0], drift[1]])}px 0px`,
              scale,
              filter: `blur(${blur}px) contrast(1.06) saturate(1.06)`,
              maskImage:
                "linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
            }}
          />
        </>
      ) : (
        <Img
          src={file}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${interpolate(p, [0, 1], [x[0], x[1]])}% ${y}%`,
            scale,
            filter: `blur(${blur}px) contrast(1.06) saturate(1.06)`,
          }}
        />
      )}
      {/* Oscurecido + degradés arriba/abajo + viñeta para que el texto siempre se lea */}
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${dim})` }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.78) 100%)",
        }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }}
      />
    </AbsoluteFill>
  );
};

/** Una foto en pantalla durante un tramo, con movimiento de cámara y entrada con golpe de zoom. */
export const Shot: React.FC<ShotProps> = ({ name, from, durationInFrames, ...rest }) => (
  <Sequence name={name} from={from} durationInFrames={durationInFrames}>
    <ShotInner durationInFrames={durationInFrames} {...rest} />
  </Sequence>
);
