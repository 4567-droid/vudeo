import React from "react";
import { Box, Layer, Rise, Slam } from "../components/anim";
import { C, DISPLAY, SANS, SHADOW } from "../theme";
import type { Timed } from "./Hook";

/** 3-12 s: subtítulo de cada toma del auto (arriba, para no tapar el auto). */
export const Caption: React.FC<Timed & { readonly kicker: string; readonly big: string }> = ({
  kicker,
  big,
  ...t
}) => (
  <Layer {...t} align="top">
    <Slam at={0} from={1.4}>
      <Box bg={C.red} color={C.white} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 54, letterSpacing: 2 }}>
        {kicker}
      </Box>
    </Slam>
    <Rise at={4} style={{ marginTop: 12 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.1, color: C.white, textShadow: SHADOW }}>
        {big}
      </div>
    </Rise>
  </Layer>
);
