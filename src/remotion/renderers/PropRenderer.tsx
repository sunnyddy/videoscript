import { interpolate } from "remotion";
import type { PropPrototype, ActionDefinition } from "../types";
import { TraitWrapper, type TraitModifiers } from "../components/TraitWrapper";

interface PropRendererProps {
  prototype: PropPrototype;
  action?: ActionDefinition;
  position: { x: number; y: number };
  frame: number;
  modifiers?: TraitModifiers;
}

export const PropRenderer: React.FC<PropRendererProps> = ({
  prototype,
  action,
  position,
  frame,
  modifiers,
}) => {
  let transform = { x: 0, y: 0, rotation: 0, scale: 1 };

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
  }

  // Combine action transform with modifiers
  const finalRotation = transform.rotation + (modifiers?.rotation || 0);
  const finalScale = transform.scale * (modifiers?.scale || 1);

  // Extract non-transform modifiers for TraitWrapper
  const wrapperModifiers: TraitModifiers | undefined = modifiers ? {
    opacity: modifiers.opacity,
    filter: modifiers.filter,
    gradient: modifiers.gradient,
  } : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x + transform.x,
        top: position.y + transform.y,
        transform: `rotate(${finalRotation}deg) scale(${finalScale})`,
        transformOrigin: "center center",
      }}
    >
      <TraitWrapper modifiers={wrapperModifiers}>
        <div dangerouslySetInnerHTML={{ __html: prototype.svg }} />
      </TraitWrapper>
    </div>
  );
};
