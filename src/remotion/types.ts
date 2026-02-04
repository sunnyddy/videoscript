// Prototype types
export interface Prototype {
  id: string;
  name: string;
  type: "character" | "scenery" | "prop" | "picture" | "audio";
}

export interface CharacterPrototype extends Prototype {
  type: "character";
  appearance: {
    svg: string;
    colors: Record<string, string>;
    scale: number;
  };
  actions: ActionDefinition[];
}

export interface ActionDefinition {
  id: string;
  name: string;
  keyframes: Keyframe[];
  duration: number;
  loop: boolean;
}

export interface Keyframe {
  frame: number;
  transform: {
    x?: number;
    y?: number;
    rotation?: number;
    scale?: number;
  };
  svgOverride?: string;
}

export interface SceneryPrototype extends Prototype {
  type: "scenery";
  svg: string;
  actions: SceneryAction[];
}

export interface SceneryAction {
  id: string;
  name: string;
  filters?: string;
  overlays?: string[];
}

export interface PropPrototype extends Prototype {
  type: "prop";
  svg: string;
  actions: ActionDefinition[];
}

// Local media prototype types
export interface PicturePrototype extends Prototype {
  type: "picture";
  width: number;
  height: number;
  // Frame -> URL mapping for sprite sequences
  // URLs can be blob: URLs (local preview) or https: URLs (cloud render)
  pictureFrames: Record<number, string>;
}

export interface AudioPrototype extends Prototype {
  type: "audio";
  // URL for the audio file
  // Can be blob: URL (local preview) or https: URL (cloud render)
  audioUrl: string;
  audioDuration: number; // Duration in seconds
}

export type AnyPrototype = CharacterPrototype | SceneryPrototype | PropPrototype | PicturePrototype | AudioPrototype;

// Composition types
export interface FrameComposition {
  frameNumber: number;
  elements: FrameElement[];
}

export interface FrameElement {
  prototypeId: string;
  actionId: string;
  position: { x: number; y: number };
  zIndex: number;
  customProps?: Record<string, unknown>;
  modifiers?: {
    scale: number;
    rotation: number;
    opacity?: number;
    filter?: { type: string; value: number };
    gradient?: {
      loop: boolean;
      colors: string[];
    };
  };
  // CSS support
  cssClasses?: string[];
  cssId?: string;
  cssVars?: Record<string, string>;
  inlineStyles?: Record<string, string>;
}

// CSS Stylesheet for embedding in VideoProject
export interface CSSStylesheet {
  id: string;
  name: string;
  content: string;
}

export interface VideoProject {
  id: string;
  name: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  background?: string;
  frames: FrameComposition[];
  prototypesUsed: string[];
  cssStyles?: CSSStylesheet[];
}

// Props for DynamicVideo - supports both static and dynamic loading
export interface DynamicVideoProps {
  // Static mode: direct data (for local preview)
  project?: VideoProject;
  prototypes?: AnyPrototype[];
  // Dynamic mode: URLs (for cloud rendering with Generic Player)
  projectJsonUrl?: string;
  assetsBaseUrl?: string;
}
