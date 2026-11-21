import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";

const FlashInner: React.FC<{ readonly dur: number; readonly intensity: number }> = ({ dur, intensity }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fff",
        opacity: interpolate(frame, [0, dur], [intensity, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        }),
      }}
    />
  );
};

/** Destello blanco sobre un corte. intensity 1 = blanco total en el primer fotograma. */
export const Flash: React.FC<{
  readonly name: string;
  readonly from: number;
  readonly durationInFrames?: number;
  readonly intensity?: number;
}> = ({ name, from, durationInFrames = 6, intensity = 0.4 }) => (
  <Sequence name={name} from={from} durationInFrames={durationInFrames}>
    <FlashInner dur={durationInFrames} intensity={intensity} />
  </Sequence>
);
