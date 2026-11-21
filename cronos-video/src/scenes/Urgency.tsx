import React from "react";
import { Box, Layer, Pulse, Slam } from "../components/anim";
import { C, DISPLAY, SANS, SHADOW } from "../theme";
import type { Timed } from "./Hook";

/** 32-36 s: "Entrega en enero. Consultá ya." (sin inventar cupos ni plazos). */
export const Urgency: React.FC<Timed & { readonly ctaAt?: number }> = ({ ctaAt = 30, ...t }) => (
  <Layer {...t}>
    <Slam at={0}>
      <Box bg={C.white} color={C.black} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 68 }}>
        ENTREGA EN
      </Box>
    </Slam>
    <Slam at={8} shake={24}>
      <div style={{ fontFamily: DISPLAY, fontSize: 300, lineHeight: 1.12, color: C.white, textShadow: SHADOW }}>
        ENERO
      </div>
    </Slam>
    <Slam at={ctaAt} style={{ marginTop: 18 }}>
      <Pulse start={ctaAt + 15}>
        <Box bg={C.red} color={C.white} style={{ fontFamily: DISPLAY, fontSize: 156, lineHeight: 1.22 }}>
          CONSULTÁ YA
        </Box>
      </Pulse>
    </Slam>
  </Layer>
);
