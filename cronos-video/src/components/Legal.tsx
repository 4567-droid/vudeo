import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SAFE, SANS } from "../theme";

/** Texto legal fijo y chico, justo arriba de la zona que tapa la interfaz de Instagram. */
export const Legal: React.FC<{
  readonly name: string;
  readonly from: number;
  readonly durationInFrames: number;
  readonly children: React.ReactNode;
}> = ({ name, from, durationInFrames, children }) => (
  <Sequence name={name} from={from} durationInFrames={durationInFrames}>
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: SAFE.bottom }}>
      <div
        style={{
          maxWidth: 840,
          padding: "10px 22px",
          borderRadius: 14,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "rgba(255,255,255,0.92)",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1.3,
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  </Sequence>
);
