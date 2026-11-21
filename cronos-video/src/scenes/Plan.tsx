import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Box, Layer, Slam } from "../components/anim";
import { RollingNumber, landFrame } from "../components/RollingNumber";
import { C, DISPLAY, SANS, SHADOW } from "../theme";
import type { Timed } from "./Hook";

const ROLL_AT = 4;

const Underline: React.FC<{ readonly at: number; readonly width: number }> = ({ at, width }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        height: 14,
        marginTop: 10,
        backgroundColor: C.red,
        boxShadow: "0 0 30px rgba(227,0,27,0.8)",
        width: interpolate(frame, [at, at + 7], [0, width], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }),
      }}
    />
  );
};

/**
 * 22-30 s: un número del plan, enorme. La etiqueta entra en el drop de la música
 * y el número gira hasta frenar con un golpe (sincronizado en scripts/make_music.py).
 */
export const Price: React.FC<
  Timed & { readonly label: string; readonly value: string; readonly size: number; readonly lineWidth: number }
> = ({ label, value, size, lineWidth, ...t }) => (
  <Layer {...t}>
    <Slam at={0}>
      <Box bg={C.red} color={C.white} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 68, letterSpacing: 3 }}>
        {label}
      </Box>
    </Slam>
    <div style={{ marginTop: 22 }}>
      <RollingNumber value={value} at={ROLL_AT} fontSize={size} />
    </div>
    <Underline at={landFrame(value, ROLL_AT)} width={lineWidth} />
  </Layer>
);

const RecapRow: React.FC<{ readonly at: number; readonly label: string; readonly value: string }> = ({
  at,
  label,
  value,
}) => (
  <Slam at={at} from={1.35} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 46, letterSpacing: 3, color: C.white, textShadow: SHADOW }}>
      {label}
    </div>
    <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.08, color: C.white, textShadow: SHADOW }}>
      {value}
    </div>
  </Slam>
);

/** 30-32 s: resumen del plan, con la entrega en enero de cierre. */
export const Recap: React.FC<Timed> = (t) => (
  <Layer {...t}>
    <RecapRow at={0} label="ANTICIPO" value="$4.000.000" />
    <div style={{ height: 14 }} />
    <RecapRow at={15} label="CUOTAS DESDE" value="$450.000" />
    <Slam at={30} shake={22} style={{ marginTop: 30 }}>
      <Box bg={C.red} color={C.white} style={{ fontFamily: DISPLAY, fontSize: 116, lineHeight: 1.2 }}>
        ENTREGA EN ENERO
      </Box>
    </Slam>
  </Layer>
);
