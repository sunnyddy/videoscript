# Examples

This directory contains example export files and documentation for the VideoScript Renderer.

## Sample Project

### sample-project.json

A minimal example showing the structure of a VideoScript export. This example includes:

- A simple 5-second video (150 frames at 30 fps)
- A sky background scenery
- A character with idle and walk animations
- Basic frame compositions

**To render this example:**

```bash
# From the project root
npx @videoscript/renderer render examples/sample-project.json -o output/sample.mp4
```

## Export File Structure

### Complete ZIP Export

A complete export typically follows this structure:

```
project-export.zip
├── project.json          # Project metadata and frame data
└── assets/              # Media files (images, audio)
    ├── background.png
    ├── character.svg
    └── music.mp3
```

### project.json Schema

```json
{
  "version": "1.0.0",
  "exportedAt": "ISO 8601 timestamp",
  "project": {
    "id": "unique project ID",
    "name": "Project Name",
    "fps": 30,
    "width": 1920,
    "height": 1080,
    "durationInFrames": 300,
    "frames": [
      {
        "frameNumber": 0,
        "elements": [
          {
            "prototypeId": "ID of prototype to render",
            "actionId": "ID of action/animation",
            "position": { "x": 960, "y": 540 },
            "zIndex": 0,
            "customProps": {}  // Optional custom properties
          }
        ]
      }
    ],
    "prototypesUsed": ["array", "of", "prototype", "IDs"]
  },
  "prototypes": [
    {
      "id": "unique ID",
      "name": "Prototype Name",
      "type": "character | scenery | prop | picture | audio",
      // Type-specific fields...
    }
  ],
  "mediaFiles": [
    {
      "filename": "assets/image.png",
      "type": "image | audio",
      "usedBy": ["prototype IDs that use this file"]
    }
  ]
}
```

### Prototype Types

#### Character

```json
{
  "id": "char_1",
  "name": "Hero",
  "type": "character",
  "svg": "<svg>...</svg>",
  "appearance": {
    "primaryColor": "#FF0000",
    "scale": 1.0
  },
  "actions": {
    "idle": {
      "id": "idle",
      "name": "Idle Animation",
      "keyframes": [
        {
          "frame": 0,
          "transform": { "x": 0, "y": 0, "rotation": 0, "scale": 1.0 }
        }
      ]
    }
  }
}
```

#### Scenery

```json
{
  "id": "scenery_1",
  "name": "Background",
  "type": "scenery",
  "svg": "<svg>...</svg>",
  "actions": {
    "default": {
      "id": "default",
      "name": "Default",
      "keyframes": []
    }
  }
}
```

#### Prop

```json
{
  "id": "prop_1",
  "name": "Item",
  "type": "prop",
  "svg": "<svg>...</svg>",
  "actions": {
    "spin": {
      "id": "spin",
      "name": "Spinning",
      "keyframes": [
        {
          "frame": 0,
          "transform": { "rotation": 0 }
        },
        {
          "frame": 30,
          "transform": { "rotation": 360 }
        }
      ]
    }
  }
}
```

#### Picture

```json
{
  "id": "pic_1",
  "name": "Photo",
  "type": "picture",
  "imagePath": "assets/photo.jpg",
  "width": 800,
  "height": 600
}
```

#### Audio

```json
{
  "id": "audio_1",
  "name": "Background Music",
  "type": "audio",
  "audioPath": "assets/music.mp3",
  "volume": 0.8,
  "startTime": 0
}
```

## Creating Your Own Exports

To create an export that works with the renderer:

1. **Export from VideoScript**: Use the export function in the VideoScript platform
2. **Manual Creation**: Follow the schema above and create a JSON file with your project data
3. **Bundle Assets**: If using images or audio, place them in an `assets/` folder and create a ZIP file

### Creating a ZIP Export

```bash
# Directory structure
my-project/
├── project.json
└── assets/
    ├── image1.png
    └── audio1.mp3

# Create ZIP
cd my-project
zip -r ../my-project.zip .
```

### Testing Your Export

```bash
# Validate without rendering
npx @videoscript/renderer render my-project.zip --dry-run

# Render with verbose output
npx @videoscript/renderer render my-project.zip --verbose
```

## Tips

- Start with simple exports to understand the structure
- Use `--dry-run` to validate exports before rendering
- Enable `--verbose` for detailed debugging information
- Keep `--keep-temp` enabled during development to inspect extracted files
- Ensure all media file paths in the JSON match the actual files in the assets folder

## Common Issues

### Missing Media Files

**Problem**: "Missing required media files" error

**Solution**: Ensure all files referenced in `mediaFiles` array exist in the `assets/` folder

### Invalid JSON

**Problem**: "Invalid project data" error

**Solution**: Validate your JSON with `--verbose` to see detailed schema errors

### Large Exports

**Problem**: "ZIP uncompressed size exceeds limit" error

**Solution**: Use `--max-size` to increase the limit, or reduce the number/size of media files
