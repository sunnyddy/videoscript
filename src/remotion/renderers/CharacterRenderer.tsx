import { interpolate } from "remotion";
import type { CharacterPrototype, ActionDefinition } from "../types";
import { TraitWrapper, type TraitModifiers } from "../components/TraitWrapper";

interface CharacterRendererProps {
  prototype: CharacterPrototype;
  action?: ActionDefinition;
  position: { x: number; y: number };
  frame: number;
  customProps?: Record<string, unknown>;
  modifiers?: TraitModifiers;
  cssClassName?: string;
  cssId?: string;
  cssStyle?: React.CSSProperties;
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  prototype,
  action,
  position,
  frame,
  customProps,
  modifiers,
  cssClassName,
  cssId,
  cssStyle,
}) => {
  let transform = { x: 0, y: 0, rotation: 0, scale: 1 };
  let currentSvg = prototype.appearance.svg;

  if (action && action.keyframes.length > 0) {
    const actionFrame = action.loop ? frame % action.duration : Math.min(frame, action.duration);

    const keyframes = action.keyframes.sort((a, b) => a.frame - b.frame);
    let prevKf = keyframes[0];
    let nextKf = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (keyframes[i].frame <= actionFrame && keyframes[i + 1].frame > actionFrame) {
        prevKf = keyframes[i];
        nextKf = keyframes[i + 1];
        break;
      }
    }

    const progress = interpolate(actionFrame, [prevKf.frame, nextKf.frame], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    transform = {
      x: interpolate(progress, [0, 1], [prevKf.transform.x || 0, nextKf.transform.x || 0]),
      y: interpolate(progress, [0, 1], [prevKf.transform.y || 0, nextKf.transform.y || 0]),
      rotation: interpolate(
        progress,
        [0, 1],
        [prevKf.transform.rotation || 0, nextKf.transform.rotation || 0]
      ),
      scale: interpolate(progress, [0, 1], [prevKf.transform.scale || 1, nextKf.transform.scale || 1]),
    };

    if (prevKf.svgOverride) {
      currentSvg = prevKf.svgOverride;
    }
  }

  // Apply custom color overrides
  let processedSvg = currentSvg;
  if (customProps?.colors && typeof customProps.colors === "object") {
    Object.entries(customProps.colors as Record<string, string>).forEach(([slot, color]) => {
      const originalColor = prototype.appearance.colors[slot];
      if (originalColor) {
        processedSvg = processedSvg.replace(new RegExp(`fill="${originalColor}"`, "g"), `fill="${color}"`);
      }
    });
  }

  // Combine action transform with modifiers for the final transform
  const finalRotation = transform.rotation + (modifiers?.rotation || 0);
  const finalScale = transform.scale * prototype.appearance.scale * (modifiers?.scale || 1);

  // Extract non-transform modifiers for TraitWrapper
  const wrapperModifiers: TraitModifiers | undefined = modifiers ? {
    opacity: modifiers.opacity,
    filter: modifiers.filter,
    gradient: modifiers.gradient,
  } : undefined;

  return (
    <div
      id={cssId}
      className={cssClassName}
      style={{
        position: "absolute",
        left: position.x + transform.x,
        top: position.y + transform.y,
        transform: `rotate(${finalRotation}deg) scale(${finalScale})`,
        transformOrigin: "center center",
        ...cssStyle,
      }}
    >
      <TraitWrapper modifiers={wrapperModifiers}>
        <div dangerouslySetInnerHTML={{ __html: processedSvg }} />
      </TraitWrapper>
    </div>
  );
};
