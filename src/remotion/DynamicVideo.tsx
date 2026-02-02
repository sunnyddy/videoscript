import { AbsoluteFill, useCurrentFrame, delayRender, continueRender } from 'remotion';
import { useState, useEffect } from 'react';
import type {
  DynamicVideoProps,
  CharacterPrototype,
  SceneryPrototype,
  PropPrototype,
  PicturePrototype,
  AudioPrototype,
  FrameElement,
  VideoProject,
  AnyPrototype,
} from './types';
import { CharacterRenderer } from './renderers/CharacterRenderer';
import { SceneryRenderer } from './renderers/SceneryRenderer';
import { PropRenderer } from './renderers/PropRenderer';
import { PictureRenderer } from './renderers/PictureRenderer';
import { AudioRenderer } from './renderers/AudioRenderer';

export const DynamicVideo: React.FC<DynamicVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const [project, setProject] = useState<VideoProject | null>(props.project || null);
  const [prototypes, setPrototypes] = useState<AnyPrototype[]>(props.prototypes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to resolve asset URLs
  const resolveAssetUrls = (prototypes: AnyPrototype[], baseUrl?: string): AnyPrototype[] => {
    if (!baseUrl) return prototypes;

    return prototypes.map((prototype) => {
      if (prototype.type === 'picture') {
        const pictureProto = prototype as PicturePrototype;
        const resolvedFrames: Record<number, string> = {};

        for (const [frame, url] of Object.entries(pictureProto.pictureFrames)) {
          // Replace assets/ prefix with full base URL
          if (url.startsWith('assets/')) {
            resolvedFrames[Number(frame)] = url.replace('assets/', `${baseUrl}/`);
          } else {
            resolvedFrames[Number(frame)] = url;
          }
        }

        return { ...pictureProto, pictureFrames: resolvedFrames };
      } else if (prototype.type === 'audio') {
        const audioProto = prototype as AudioPrototype;
        if (audioProto.audioUrl && audioProto.audioUrl.startsWith('assets/')) {
          return {
            ...audioProto,
            audioUrl: audioProto.audioUrl.replace('assets/', `${baseUrl}/`),
          };
        }
      }
      return prototype;
    });
  };

  // Fetch project data dynamically if URLs are provided
  useEffect(() => {
    if (props.projectJsonUrl) {
      setLoading(true);
      const handle = delayRender();

      fetch(props.projectJsonUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch project: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data: { project: VideoProject; prototypes: AnyPrototype[] }) => {
          // Resolve asset URLs if assetsBaseUrl is provided
          const resolvedPrototypes = resolveAssetUrls(data.prototypes, props.assetsBaseUrl);

          setProject(data.project);
          setPrototypes(resolvedPrototypes);
          setLoading(false);
          continueRender(handle);
        })
        .catch((err) => {
          console.error('Error loading project:', err);
          setError(err.message);
          setLoading(false);
          continueRender(handle);
        });
    }
  }, [props.projectJsonUrl, props.assetsBaseUrl]);

  // Show loading state
  if (loading) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <div
          style={{
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: 24,
          }}
        >
          Loading project...
        </div>
      </AbsoluteFill>
    );
  }

  // Show error state
  if (error) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <div
          style={{
            color: '#f00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: 24,
            padding: 40,
            textAlign: 'center',
          }}
        >
          Error: {error}
        </div>
      </AbsoluteFill>
    );
  }

  // Ensure project is loaded
  if (!project) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <div
          style={{
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: 24,
          }}
        >
          No project data provided
        </div>
      </AbsoluteFill>
    );
  }

  // Find the frame composition for the current frame
  // If no exact match, use the most recent frame composition
  const frameComposition = project.frames
    .filter((f) => f.frameNumber <= frame)
    .sort((a, b) => b.frameNumber - a.frameNumber)[0];

  if (!frameComposition) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <div
          style={{
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: 24,
          }}
        >
          No frame composition defined
        </div>
      </AbsoluteFill>
    );
  }

  // Sort elements by zIndex
  const sortedElements = [...frameComposition.elements].sort((a, b) => a.zIndex - b.zIndex);

  // Create a lookup map for prototypes
  const prototypeMap = new Map(prototypes.map((p) => [p.id, p]));

  const renderElement = (element: FrameElement, index: number) => {
    const prototype = prototypeMap.get(element.prototypeId);

    if (!prototype) {
      console.warn(`Prototype not found: ${element.prototypeId}`);
      return null;
    }

    switch (prototype.type) {
      case 'character': {
        const charProto = prototype as CharacterPrototype;
        const action = charProto.actions.find((a) => a.id === element.actionId);
        return (
          <CharacterRenderer
            key={`${element.prototypeId}-${index}`}
            prototype={charProto}
            action={action}
            position={element.position}
            frame={frame}
            customProps={element.customProps}
            modifiers={element.modifiers}
          />
        );
      }

      case 'scenery': {
        const sceneryProto = prototype as SceneryPrototype;
        const action = sceneryProto.actions.find((a) => a.id === element.actionId);
        return (
          <SceneryRenderer
            key={`${element.prototypeId}-${index}`}
            prototype={sceneryProto}
            action={action}
            frame={frame}
            modifiers={element.modifiers}
          />
        );
      }

      case 'prop': {
        const propProto = prototype as PropPrototype;
        const action = propProto.actions.find((a) => a.id === element.actionId);
        return (
          <PropRenderer
            key={`${element.prototypeId}-${index}`}
            prototype={propProto}
            action={action}
            position={element.position}
            frame={frame}
            modifiers={element.modifiers}
          />
        );
      }

      case 'picture': {
        const pictureProto = prototype as PicturePrototype;
        return (
          <PictureRenderer
            key={`${element.prototypeId}-${index}`}
            prototype={pictureProto}
            position={element.position}
            frame={frame}
            modifiers={element.modifiers}
          />
        );
      }

      case 'audio': {
        const audioProto = prototype as AudioPrototype;
        // Audio elements are rendered but not visible
        // The frameComposition.frameNumber indicates when audio starts
        return (
          <AudioRenderer
            key={`${element.prototypeId}-${index}`}
            prototype={audioProto}
            startFrame={frameComposition.frameNumber}
            fps={project.fps}
            modifiers={element.modifiers}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {sortedElements.map((element, index) => renderElement(element, index))}
    </AbsoluteFill>
  );
};
