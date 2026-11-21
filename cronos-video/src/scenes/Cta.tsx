import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Layer, Pulse, Rise, Slam } from "../components/anim";
import { C, DISPLAY, SANS, SHADOW } from "../theme";
import type { Timed } from "./Hook";

const CtaBackgroundInner: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ background: "radial-gradient(circle at 50% 38%, #6a0013 0%, #22040a 48%, #060606 100%)" }}
    >
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(-58deg, rgba(227,0,27,0.13) 0px, rgba(227,0,27,0.13) 46px, rgba(0,0,0,0) 46px, rgba(0,0,0,0) 150px)",
          translate: `${interpolate(frame, [0, 120], [0, -160])}px 0px`,
          scale: 1.3,
        }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)" }}
      />
    </AbsoluteFill>
  );
};

/** Fondo del cierre: degradé rojo/negro con franjas en movimiento. */
export const CtaBackground: React.FC<Timed> = ({ name, from, durationInFrames }) => (
  <Sequence name={name} from={from} durationInFrames={durationInFrames}>
    <CtaBackgroundInner />
  </Sequence>
);

/** Ícono genérico de llamada (Material Icons, Apache 2.0) dentro de un círculo verde. */
const CallIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: C.green,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 50px rgba(37,211,102,0.55)",
    }}
  >
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24">
      <path
        fill="#fff"
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </svg>
  </div>
);

/**
 * Cierre: WhatsApp grande y centrado. El número queda completo en pantalla
 * desde el fotograma ~13 de la escena hasta el final (más de 3 s en 4 s de escena).
 */
export const Cta: React.FC<Timed> = (t) => (
  <Layer {...t} exit={false}>
    <Slam at={0}>
      <CallIcon size={132} />
    </Slam>
    <Slam at={3} style={{ marginTop: 22 }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 60, letterSpacing: 2, color: C.white }}>
        ESCRIBINOS POR
      </div>
    </Slam>
    <Slam at={6}>
      <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.1, color: C.green, textShadow: SHADOW }}>
        WHATSAPP
      </div>
    </Slam>
    <Slam at={10} shake={18} style={{ marginTop: 22 }}>
      <Pulse start={30} amount={0.03}>
        <div
          style={{
            backgroundColor: C.white,
            color: C.black,
            borderRadius: 30,
            padding: "4px 40px",
            fontFamily: DISPLAY,
            fontSize: 155,
            lineHeight: 1.16,
            whiteSpace: "nowrap",
            boxShadow: "0 18px 60px rgba(0,0,0,0.6)",
          }}
        >
          3624 27-1152
        </div>
      </Pulse>
    </Slam>
    <Rise at={22} style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 140, lineHeight: 1.05, color: C.white, letterSpacing: 2 }}>
        SCUDERIA FIAT
      </div>
      <div style={{ height: 12, width: 520, marginTop: 14, backgroundColor: C.red }} />
    </Rise>
  </Layer>
);
