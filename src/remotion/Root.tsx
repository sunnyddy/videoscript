import { Composition } from "remotion";
import { DynamicVideo } from "./DynamicVideo";
import type { DynamicVideoProps } from "./types";

// Default empty project for preview
const defaultProps: DynamicVideoProps = {
  project: {
    id: "preview",
    name: "Preview Project",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 300,
    frames: [],
    prototypesUsed: [],
  },
  prototypes: [],
};

/**
 * Calculate dynamic composition properties for Generic Player mode
 * When rendering with dynamic props, we need sensible defaults until data loads
 */
function getCompositionConfig(inputProps: DynamicVideoProps) {
  // If static project is provided, use its properties
  if (inputProps.project) {
    return {
      durationInFrames: inputProps.project.durationInFrames,
      fps: inputProps.project.fps,
      width: inputProps.project.width,
      height: inputProps.project.height,
    };
  }

  // For dynamic loading, use defaults (will be overridden by actual data)
  return {
    durationInFrames: 300,
    fps: 30,
    width: 1920,
    height: 1080,
  };
}

export const RemotionRoot: React.FC = () => {
  // Calculate composition props (supports both static and dynamic modes)
  const compositionConfig = getCompositionConfig(defaultProps);

  return (
    <>
      <Composition
        id="DynamicVideo"
        component={DynamicVideo as any}
        durationInFrames={compositionConfig.durationInFrames}
        fps={compositionConfig.fps}
        width={compositionConfig.width}
        height={compositionConfig.height}
        defaultProps={defaultProps}
        calculateMetadata={async ({ props }: { props: DynamicVideoProps }) => {
          // If dynamic loading mode, fetch project to get correct metadata
          if (props.projectJsonUrl) {
            try {
              const response = await fetch(props.projectJsonUrl);
              const data = (await response.json()) as { project: { durationInFrames: number; fps: number; width: number; height: number } };
              return {
                durationInFrames: data.project.durationInFrames,
                fps: data.project.fps,
                width: data.project.width,
                height: data.project.height,
              };
            } catch (error) {
              console.error("Failed to fetch project metadata:", error);
              // Return defaults on error
              return compositionConfig;
            }
          }
          // Static mode: use provided project data
          if (props.project) {
            return {
              durationInFrames: props.project.durationInFrames,
              fps: props.project.fps,
              width: props.project.width,
              height: props.project.height,
            };
          }
          return compositionConfig;
        }}
      />
    </>
  );
};
