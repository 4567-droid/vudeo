import React from "react";
import { Box, Layer, Slam } from "../components/anim";
import { C, DISPLAY, SANS, SHADOW } from "../theme";

export type Timed = { readonly name: string; readonly from: number; readonly durationInFrames: number };

/** 0-3 s: la pregunta que frena el scroll. Cada línea entra en un tiempo musical. */
export const Hook: React.FC<Timed> = (t) => (
  <Layer {...t}>
    <Slam at={0}>
      <Box bg={C.white} color={C.black} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 66, letterSpacing: 1 }}>
        ¿QUERÉS TU
      </Box>
    </Slam>
    <Slam at={7} style={{ marginTop: 20 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 180, lineHeight: 1.05, color: C.white, textShadow: SHADOW }}>
        FIAT CRONOS
      </div>
    </Slam>
    <Slam at={15} shake={28} style={{ marginTop: 6 }}>
      <Box bg={C.red} color={C.white} style={{ fontFamily: DISPLAY, fontSize: 270, lineHeight: 1.12 }}>
        0KM?
      </Box>
    </Slam>
  </Layer>
);
