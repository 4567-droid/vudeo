import React from "react";
import { Composition } from "remotion";
import { FiloReel } from "./FiloReel";
import { FPS, H, W } from "./brand";
import { TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition id="FiloReel" component={FiloReel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
