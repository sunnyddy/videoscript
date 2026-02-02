import type { SceneryPrototype, SceneryAction } from "../types";
import type { TraitModifiers } from "../components/TraitWrapper";

interface SceneryRendererProps {
  prototype: SceneryPrototype;
  action?: SceneryAction;
  frame: number;
  modifiers?: TraitModifiers;
}

export const SceneryRenderer: React.FC<SceneryRendererProps> = ({
  prototype,
  action,
  modifiers
}) => {
  let style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  };

  // Apply action filters
  if (action?.filters) {
    style = { ...style, filter: action.filters };
  }

  // Apply modifiers for transform (scale/rotation)
  const transforms: string[] = [];
  if (modifiers?.scale !== undefined && modifiers.scale !== 1) {
    transforms.push(`scale(${modifiers.scale})`);
  }
  if (modifiers?.rotation !== undefined && modifiers.rotation !== 0) {
    transforms.push(`rotate(${modifiers.rotation}deg)`);
  }
  if (transforms.length > 0) {
    style = { ...style, transform: transforms.join(' '), transformOrigin: 'center center' };
  }

  // Apply opacity directly
  if (modifiers?.opacity !== undefined) {
    style = { ...style, opacity: modifiers.opacity };
  }

  // Apply filter modifier (only if no action filter)
  if (modifiers?.filter && !action?.filters) {
    const { type, value } = modifiers.filter;
    let filterStr = '';
    switch (type) {
      case 'blur': filterStr = `blur(${value}px)`; break;
      case 'grayscale': filterStr = `grayscale(${value})`; break;
      case 'brightness': filterStr = `brightness(${value})`; break;
      case 'contrast': filterStr = `contrast(${value})`; break;
      case 'saturate': filterStr = `saturate(${value})`; break;
      case 'sepia': filterStr = `sepia(${value})`; break;
      case 'invert': filterStr = `invert(${value})`; break;
      case 'hue-rotate': filterStr = `hue-rotate(${value}deg)`; break;
    }
    if (filterStr) {
      style = { ...style, filter: filterStr };
    }
  }

  // Gradient overlay for scenery
  let gradientOverlay = null;
  if (modifiers?.gradient && modifiers.gradient.colors.length >= 2) {
    gradientOverlay = (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${modifiers.gradient.colors[0]}, ${modifiers.gradient.colors[1]})`,
          mixBlendMode: 'color',
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <div style={style}>
      <div dangerouslySetInnerHTML={{ __html: prototype.svg }} />
      {action?.overlays?.map((overlay, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: overlay }} />
      ))}
      {gradientOverlay}
    </div>
  );
};
