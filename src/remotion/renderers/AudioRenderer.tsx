import React from "react";
import { Audio, staticFile } from "remotion";
import type { AudioPrototype } from "../types";

interface AudioRendererProps {
  prototype: AudioPrototype;
  startFrame: number; // Frame at which the audio starts playing
  fps: number;
  modifiers?: {
    opacity?: number; // Can be used to control volume (0-1)
  };
}

export const AudioRenderer: React.FC<AudioRendererProps> = ({
  prototype,
  startFrame,
  fps,
  modifiers,
}) => {
  // Volume can be controlled via opacity modifier (0-1)
  const volume = modifiers?.opacity ?? 1;

  // Calculate the start time offset in seconds
  const startFrom = Math.round((startFrame / fps) * fps);

  // Use staticFile() for local filenames, keep blob/http URLs as-is
  const resolvedUrl = prototype.audioUrl.startsWith("blob:") || prototype.audioUrl.startsWith("http")
    ? prototype.audioUrl
    : staticFile(prototype.audioUrl);

  return (
    <Audio
      src={resolvedUrl}
      startFrom={startFrom}
      volume={volume}
    />
  );
};
