# @videoscript/renderer

> CLI tool for rendering VideoScript projects locally using Remotion

[![npm version](https://img.shields.io/npm/v/@videoscript/renderer.svg)](https://www.npmjs.com/package/@videoscript/renderer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

`@videoscript/renderer` is a standalone command-line tool that renders VideoScript project exports into high-quality videos using [Remotion](https://www.remotion.dev/). It works with `.zip` export files from the VideoScript platform, making it easy to render videos locally without needing cloud infrastructure.

## Features

- 🎬 **Local Rendering**: Render VideoScript projects on your machine
- 📦 **Zero Configuration**: Works out of the box with exported projects
- 🔒 **Secure**: Built-in protection against zip bombs and path traversal attacks
- 🎨 **Multiple Codecs**: Support for H.264, H.265, VP8, VP9, and ProRes
- 📊 **Progress Tracking**: Real-time progress indicators during rendering
- ✅ **Validation**: Dry-run mode to validate exports before rendering
- 🐛 **Debug Mode**: Verbose logging for troubleshooting

## Installation

### Using npx (Recommended)

No installation required! Run directly:

```bash
npx @videoscript/renderer render your-project.zip
```

### Global Installation

```bash
npm install -g @videoscript/renderer
```

Then use the `videoscript` command:

```bash
videoscript render your-project.zip
```

## System Requirements

- **Node.js**: Version 18.0.0 or higher
- **FFmpeg**: Required for video rendering
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt-get install ffmpeg`
  - Windows: `choco install ffmpeg` or download from [ffmpeg.org](https://ffmpeg.org/)

## Usage

### Basic Usage

```bash
# Render with default settings
npx @videoscript/renderer render project.zip

# Render with npx (shorthand)
npx @videoscript/renderer render project.zip
```

### Specify Output Path

```bash
npx @videoscript/renderer render project.zip -o output/video.mp4
```

### Advanced Options

```bash
# Verbose mode (detailed logging)
npx @videoscript/renderer render project.zip --verbose

# Dry run (validate without rendering)
npx @videoscript/renderer render project.zip --dry-run

# Keep temporary files for debugging
npx @videoscript/renderer render project.zip --keep-temp

# Use different codec
npx @videoscript/renderer render project.zip --codec h265

# Custom max uncompressed size (in MB)
npx @videoscript/renderer render project.zip --max-size 1000
```

### Available Codecs

- `h264` (default) - H.264 in MP4 container
- `h264-mkv` - H.264 in MKV container
- `h265` - H.265/HEVC
- `vp8` - VP8 (WebM)
- `vp9` - VP9 (WebM)
- `prores` - Apple ProRes

## Export Format

The renderer expects a `.zip` file with the following structure:

```
project.zip
├── project.json          # Project metadata and frame compositions
└── assets/              # (Optional) Media files
    ├── image1.png
    ├── image2.jpg
    └── audio.mp3
```

### project.json Schema

```json
{
  "version": "1.0.0",
  "exportedAt": "2026-02-01T00:00:00.000Z",
  "project": {
    "id": "proj_123",
    "name": "My Video Project",
    "fps": 30,
    "width": 1920,
    "height": 1080,
    "durationInFrames": 300,
    "frames": [
      /* frame compositions */
    ],
    "prototypesUsed": ["char_1", "scenery_1"]
  },
  "prototypes": [
    /* prototype definitions */
  ],
  "mediaFiles": [
    /* optional media file references */
  ]
}
```

## CLI Commands

### `render <input>`

Render a VideoScript project export.

**Arguments:**

- `<input>` - Path to the export file (.zip or .json)

**Options:**

- `-o, --output <path>` - Output path for the rendered video
- `-v, --verbose` - Enable verbose logging
- `--dry-run` - Validate the export without rendering
- `--keep-temp` - Keep temporary files after rendering
- `-c, --codec <codec>` - Video codec (default: h264)
- `--max-size <mb>` - Maximum uncompressed ZIP size in MB (default: 500)

**Examples:**

```bash
# Basic render
videoscript render project.zip

# With custom output
videoscript render project.zip -o videos/final.mp4

# Validate only
videoscript render project.zip --dry-run

# Verbose debugging
videoscript render project.zip --verbose --keep-temp
```

### `--version`

Display the version number:

```bash
videoscript --version
```

### `--help`

Display help information:

```bash
videoscript --help
videoscript render --help
```

## How It Works

1. **Validation**: Validates the ZIP file and checks for security issues
2. **Extraction**: Extracts the ZIP to a temporary directory
3. **Schema Validation**: Validates the project.json against the schema
4. **Media Check**: Verifies all required media files are present
5. **Bundling**: Bundles the Remotion project with your data
6. **Rendering**: Renders the video frame-by-frame using FFmpeg
7. **Cleanup**: Removes temporary files (unless `--keep-temp` is used)

## Security Features

- **Zip Bomb Protection**: Limits uncompressed size (500MB default)
- **File Count Limits**: Maximum 10,000 files per export
- **Path Sanitization**: Prevents directory traversal attacks
- **Schema Validation**: Validates all input data against strict schemas

## Troubleshooting

### FFmpeg Not Found

**Error**: `FFmpeg is not installed or not in PATH`

**Solution**: Install FFmpeg for your platform:

- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt-get install ffmpeg`
- Windows: `choco install ffmpeg`

### Missing Media Files

**Error**: `Missing required media files`

**Solution**: Ensure you're using a complete ZIP export that includes all media files in the `assets/` directory.

### Invalid Project Data

**Error**: `Invalid project data`

**Solution**: Use `--verbose` to see detailed validation errors. Ensure your export is from a compatible version of VideoScript.

### Out of Memory

**Error**: Process runs out of memory during rendering

**Solution**:

- Use a smaller video resolution
- Reduce the duration
- Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=8192" npx @videoscript/renderer render project.zip`

## Version Compatibility

| Export Version | Renderer Version | Status          |
| -------------- | ---------------- | --------------- |
| 1.0.x          | 1.0.0+           | ✅ Full support |

The renderer will warn you if there's a version mismatch between the export and the renderer.

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/sunnyddy/videoscript.git

cd renderer

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm run test:render path/to/project.zip
```

### Project Structure

```
videoscript_cli/
├── src/
│   ├── bin/              # CLI entry point
│   ├── cli.ts            # Commander setup
│   ├── commands/         # Command implementations
│   │   └── render.ts
│   ├── remotion/         # Remotion components
│   │   ├── DynamicVideo.tsx
│   │   ├── renderers/
│   │   └── types.ts
│   ├── utils/            # Utility functions
│   │   ├── logger.ts
│   │   ├── ffmpeg-check.ts
│   │   └── zip-handler.ts
│   └── types/            # Type definitions
│       └── export-package.ts
├── dist/                 # Built output
├── package.json
└── tsconfig.json
```

### Build Scripts

- `npm run build` - Build the entire project
- `npm run build:cli` - Build CLI code only
- `npm run build:remotion` - Build Remotion components only
- `npm run clean` - Remove build artifacts
- `npm run typecheck` - Type check without building

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Licensing & Legal

This tool uses **Remotion** for video rendering.

- **@videoscript/renderer** (this CLI) is licensed under the **MIT License**.
- **Remotion** (the rendering engine) is a separate entity with its own licensing terms.
  - Free for individuals and small companies (non-commercial or low revenue).
  - Paid license required for larger commercial use.
  - Please read the [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) to ensure compliance with your use case.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [Remotion](https://www.remotion.dev/) - The video rendering engine
- [VideoScript](https://github.com/videoscript) - The DSL for programmatic video creation

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/videoscript/renderer/issues)
- 📖 **Documentation**: [GitHub Wiki](https://github.com/videoscript/renderer/wiki)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/videoscript/renderer/discussions)

## Acknowledgments

Built with:

- [Remotion](https://www.remotion.dev/) - React-based video rendering
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Ora](https://github.com/sindresorhus/ora) - Progress spinners
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Zod](https://github.com/colinhacks/zod) - Schema validation

---

Made with ❤️ by the VideoScript Team
