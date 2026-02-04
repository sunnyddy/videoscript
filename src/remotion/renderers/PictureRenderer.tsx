import React from "react";
import { Img, staticFile } from "remotion";
import type { PicturePrototype } from "../types";

interface PictureRendererProps {
  prototype: PicturePrototype;
  position: { x: number; y: number };
  frame: number;
  modifiers?: {
    scale: number;
    rotation: number;
    opacity?: number;
    filter?: { type: string; value: number };
  };
  cssClassName?: string;
  cssId?: string;
  cssStyle?: React.CSSProperties;
}

/**
 * Get the correct frame URL for a sprite sequence
 * Finds the largest keyframe index <= current frame
 */
function getPictureFrameUrl(
  pictureFrames: Record<number, string>,
  frame: number
): string | null {
  const frameKeys = Object.keys(pictureFrames)
    .map(Number)
    .sort((a, b) => a - b);

  if (frameKeys.length === 0) return null;

  let targetFrame = frameKeys[0];
  for (const f of frameKeys) {
    if (f <= frame) {
      targetFrame = f;
    } else {
      break;
    }
  }

  return pictureFrames[targetFrame] || null;
}

/**
 * Build CSS filter string from filter modifier
 */
function buildCssFilter(filter: { type: string; value: number }): string {
  const { type, value } = filter;
  switch (type) {
    case "blur":
      return `blur(${value}px)`;
    case "grayscale":
      return `grayscale(${value})`;
    case "brightness":
      return `brightness(${value})`;
    case "contrast":
      return `contrast(${value})`;
    case "saturate":
      return `saturate(${value})`;
    case "sepia":
      return `sepia(${value})`;
    case "invert":
      return `invert(${value})`;
    case "hue-rotate":
      return `hue-rotate(${value}deg)`;
    default:
      return "";
  }
}

export const PictureRenderer: React.FC<PictureRendererProps> = ({
  prototype,
  position,
  frame,
  modifiers,
  cssClassName,
  cssId,
  cssStyle,
}) => {
  const pictureUrl = getPictureFrameUrl(prototype.pictureFrames, frame);

  if (!pictureUrl) {
    return null;
  }

  // Use staticFile() for local filenames, keep blob/http URLs as-is
  const resolvedUrl = pictureUrl.startsWith("blob:") || pictureUrl.startsWith("http")
    ? pictureUrl
    : staticFile(pictureUrl);

  const rotation = modifiers?.rotation ?? 0;
  const scale = modifiers?.scale ?? 1;
  const opacity = modifiers?.opacity ?? 1;
  const filter = modifiers?.filter ? buildCssFilter(modifiers.filter) : undefined;

  return (
    <div
      id={cssId}
      className={cssClassName}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "center center",
        opacity,
        filter,
        ...cssStyle,
      }}
    >
      <Img
        src={resolvedUrl}
        style={{
          width: prototype.width,
          height: prototype.height,
          display: "block",
        }}
      />
    </div>
  );
};
