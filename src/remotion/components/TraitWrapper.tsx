import React from 'react';

export interface TraitModifiers {
  scale?: number;
  rotation?: number;
  opacity?: number;
  filter?: { type: string; value: number };
  gradient?: {
    loop: boolean;
    colors: string[];
  };
}

interface TraitWrapperProps {
  modifiers?: TraitModifiers;
  children: React.ReactNode;
}

/**
 * Generates a CSS filter string from the filter modifier.
 * Supports: blur, grayscale, brightness, contrast, saturate, sepia, invert, hue-rotate
 */
function buildCssFilter(filter: { type: string; value: number }): string {
  const { type, value } = filter;
  switch (type) {
    case 'blur':
      return `blur(${value}px)`;
    case 'grayscale':
      return `grayscale(${value})`;
    case 'brightness':
      return `brightness(${value})`;
    case 'contrast':
      return `contrast(${value})`;
    case 'saturate':
      return `saturate(${value})`;
    case 'sepia':
      return `sepia(${value})`;
    case 'invert':
      return `invert(${value})`;
    case 'hue-rotate':
      return `hue-rotate(${value}deg)`;
    default:
      return '';
  }
}

export const TraitWrapper: React.FC<TraitWrapperProps> = ({ modifiers, children }) => {
  if (!modifiers) {
    return <>{children}</>;
  }

  const { scale, rotation, opacity, filter, gradient } = modifiers;

  // Build transform string
  const transforms: string[] = [];
  if (scale !== undefined && scale !== 1) {
    transforms.push(`scale(${scale})`);
  }
  if (rotation !== undefined && rotation !== 0) {
    transforms.push(`rotate(${rotation}deg)`);
  }

  // Build filter string
  const filterStr = filter ? buildCssFilter(filter) : undefined;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    transformOrigin: 'center center',
    opacity: opacity,
    filter: filterStr,
  };

  // Gradient Overlay using mix-blend-mode
  let gradientOverlay = null;
  if (gradient && gradient.colors.length >= 2) {
    gradientOverlay = (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
          mixBlendMode: 'color',
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <div style={containerStyle}>
      {children}
      {gradientOverlay}
    </div>
  );
};
