import React from "react";
import { Composition, Folder } from "remotion";
import { CronosReel } from "./CronosReel";
import { CronosStory } from "./CronosStory";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Instagram">
      <Composition id="CronosReel" component={CronosReel} durationInFrames={1200} fps={30} width={1080} height={1920} />
      <Composition id="CronosStory" component={CronosStory} durationInFrames={450} fps={30} width={1080} height={1920} />
    </Folder>
  );
};
