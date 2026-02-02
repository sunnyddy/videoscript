# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-01

### Added
- Initial release of @videoscript/renderer
- CLI tool for rendering VideoScript project exports
- Support for ZIP file extraction with security checks
- Project data validation using Zod schemas
- Multiple codec support (H.264, H.265, VP8, VP9, ProRes)
- Progress indicators with ora spinners
- FFmpeg availability checking
- Dry-run mode for validation without rendering
- Verbose logging mode for debugging
- Keep-temp option for preserving temporary files
- Comprehensive error handling and user-friendly messages
- Media file validation
- Zip bomb protection (500MB default limit)
- Path traversal attack prevention
- Complete TypeScript type definitions
- MIT License
- Comprehensive README documentation

### Security
- Zip bomb protection with configurable size limits
- Maximum file count limits (10,000 files)
- Path sanitization to prevent directory traversal
- Input validation with strict schemas

### Dependencies
- Remotion 4.0.410 for video rendering
- Commander.js 12.1.0 for CLI framework
- Ora 8.1.1 for progress indicators
- Chalk 5.3.0 for terminal styling
- Zod 3.23.8 for schema validation
- AdmZip 0.5.16 for ZIP file handling

## [Unreleased]

### Planned Features
- Preview mode to launch Remotion Studio locally
- Additional output format support (GIF, WebM)
- Quality presets (high/medium/low)
- Watch mode for auto-rendering
- Plugin system for custom renderers
- Export validation command
- Parallel rendering support
- Configuration file support (.videoscriptrc.json)

---

[1.0.0]: https://github.com/videoscript/renderer/releases/tag/v1.0.0
