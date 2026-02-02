import { z } from 'zod';

/**
 * Zod schema for media file information
 */
export const MediaFileInfoSchema = z.object({
  filename: z.string(),
  type: z.enum(['image', 'audio']),
  usedBy: z.array(z.string()),
});

export type MediaFileInfo = z.infer<typeof MediaFileInfoSchema>;

/**
 * Zod schema for frame element
 */
export const FrameElementSchema = z.object({
  prototypeId: z.string(),
  actionId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  zIndex: z.number(),
  customProps: z.record(z.unknown()).optional(),
  modifiers: z.object({
    scale: z.number(),
    rotation: z.number(),
    opacity: z.number().optional(),
    filter: z.object({
      type: z.string(),
      value: z.number(),
    }).optional(),
    gradient: z.object({
      loop: z.boolean(),
      colors: z.array(z.string()),
    }).optional(),
  }).optional(),
});

export type FrameElement = z.infer<typeof FrameElementSchema>;

/**
 * Zod schema for frame
 */
export const FrameSchema = z.object({
  frameNumber: z.number(),
  elements: z.array(FrameElementSchema),
});

export type Frame = z.infer<typeof FrameSchema>;

/**
 * Zod schema for project
 */
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  fps: z.number().min(1).max(120),
  width: z.number().min(1).max(7680),
  height: z.number().min(1).max(4320),
  durationInFrames: z.number().min(1),
  frames: z.array(FrameSchema),
  prototypesUsed: z.array(z.string()),
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Zod schema for prototype
 */
export const PrototypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['character', 'scenery', 'prop', 'picture', 'audio']),
  // Additional fields are type-specific and validated loosely
}).passthrough();

export type Prototype = z.infer<typeof PrototypeSchema>;

/**
 * Zod schema for export package
 */
export const ExportPackageSchema = z.object({
  project: ProjectSchema,
  prototypes: z.array(PrototypeSchema),
  mediaFiles: z.array(MediaFileInfoSchema).optional(),
  exportedAt: z.string(),
  version: z.string(),
});

export type ExportPackage = z.infer<typeof ExportPackageSchema>;

/**
 * Validate an export package against the schema
 */
export function validateExportPackage(data: unknown): ExportPackage {
  return ExportPackageSchema.parse(data);
}
