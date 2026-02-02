# Contributing to @videoscript/renderer

Thank you for your interest in contributing to the VideoScript Renderer! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (OS, Node.js version, FFmpeg version)
- Any relevant error messages or logs
- If possible, a sample export file that reproduces the issue

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:

- A clear description of the enhancement
- The use case or problem it solves
- Any implementation ideas you have
- Examples of how it would be used

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**:
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed
4. **Build the project**: `npm run build`
5. **Test your changes**: `npm run test:render` with a sample export
6. **Commit your changes**: Use clear, descriptive commit messages
7. **Push to your fork** and submit a pull request

### Pull Request Guidelines

- Keep changes focused - one feature or fix per PR
- Include tests for new functionality
- Update README.md if adding new features
- Update CHANGELOG.md under the [Unreleased] section
- Ensure all builds and tests pass
- Respond to code review feedback

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- FFmpeg installed and in PATH
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/renderer.git
cd renderer

# Install dependencies
npm install

# Build the project
npm run build

# Test with a sample export
npm run test:render path/to/sample.zip
```

### Project Structure

```
videoscript_cli/
├── src/
│   ├── bin/              # CLI entry point
│   ├── cli.ts            # Commander configuration
│   ├── commands/         # Command implementations
│   │   └── render.ts     # Main render logic
│   ├── remotion/         # Remotion components (rendering engine)
│   │   ├── DynamicVideo.tsx
│   │   ├── Root.tsx
│   │   ├── types.ts
│   │   ├── components/
│   │   └── renderers/    # Prototype renderers
│   ├── utils/            # Utility functions
│   │   ├── logger.ts     # Logging utilities
│   │   ├── ffmpeg-check.ts
│   │   └── zip-handler.ts
│   └── types/            # TypeScript type definitions
│       └── export-package.ts
├── dist/                 # Built output (gitignored)
├── package.json
├── tsconfig.json         # TypeScript config for CLI
├── tsconfig.remotion.json # TypeScript config for Remotion
└── tsup.config.ts        # Build config for CLI
```

### Build System

The project uses a dual build system:

- **CLI Code**: Built with `tsup` (fast, bundled)
- **Remotion Code**: Built with `tsc` (preserves structure for bundler)

```bash
# Build everything
npm run build

# Build only CLI
npm run build:cli

# Build only Remotion components
npm run build:remotion

# Clean build artifacts
npm run clean

# Watch mode for development
npm run dev
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier (2 spaces, single quotes)
- **React**: Functional components with hooks

Run linting:

```bash
npm run lint
```

Run type checking:

```bash
npm run typecheck
```

### Testing

Currently, testing is done manually with sample exports. Automated tests are planned for future releases.

To test your changes:

```bash
# Build the project
npm run build

# Test with a sample export
node dist/bin/videoscript.js render path/to/sample.zip --verbose
```

### Debugging

Enable verbose mode for detailed logging:

```bash
node dist/bin/videoscript.js render sample.zip --verbose --keep-temp
```

The `--keep-temp` flag preserves temporary files for inspection.

## Coding Guidelines

### General Principles

- Write clear, self-documenting code
- Add comments for complex logic
- Handle errors gracefully with user-friendly messages
- Validate all inputs
- Use TypeScript types strictly

### TypeScript

```typescript
// ✅ Good: Explicit types, clear naming
export interface RenderOptions {
  output?: string;
  verbose?: boolean;
}

export async function renderCommand(
  inputPath: string,
  options: RenderOptions
): Promise<void> {
  // Implementation
}

// ❌ Avoid: Implicit any, unclear types
export async function render(input, opts) {
  // Implementation
}
```

### Error Handling

```typescript
// ✅ Good: User-friendly error messages
try {
  await extractZip(zipPath, tempDir);
} catch (error) {
  logger.error('Failed to extract ZIP file');
  logger.error(`Reason: ${(error as Error).message}`);
  throw error;
}

// ❌ Avoid: Silent failures or cryptic errors
try {
  await extractZip(zipPath, tempDir);
} catch (error) {
  console.log('Error:', error);
}
```

### Logging

```typescript
// ✅ Good: Contextual, informative messages
logger.info('Starting render process');
logger.debug(`Bundle location: ${bundleLocation}`);
spinner.succeed('Video rendered successfully');

// ❌ Avoid: Vague or missing messages
console.log('Done');
```

### Security

- Always validate and sanitize user inputs
- Use Zod schemas for data validation
- Check file paths for traversal attacks
- Limit resource usage (file sizes, counts)
- Handle errors without exposing sensitive info

## Documentation

### Code Documentation

Use JSDoc comments for public APIs:

```typescript
/**
 * Extract a ZIP file with security checks
 *
 * @param zipPath - Path to the ZIP file
 * @param outputDir - Directory to extract to
 * @param options - Extraction options
 * @throws {ZipSecurityError} If security checks fail
 */
export async function extractZipSafely(
  zipPath: string,
  outputDir: string,
  options: ZipExtractionOptions = {}
): Promise<void> {
  // Implementation
}
```

### README Updates

When adding new features:

- Update the Features section
- Add usage examples
- Update CLI options table
- Add to troubleshooting if applicable

### CHANGELOG Updates

For every PR, add an entry to CHANGELOG.md under `[Unreleased]`:

```markdown
## [Unreleased]

### Added
- New `--quality` option for preset render quality levels

### Changed
- Improved error messages for missing media files

### Fixed
- Fixed bug where temp files weren't cleaned up on error
```

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md` (move Unreleased to new version)
3. Run `npm run build` and verify
4. Commit: `git commit -m "Release v1.x.x"`
5. Tag: `git tag v1.x.x`
6. Push: `git push && git push --tags`
7. Publish: `npm publish --access public`

## Questions?

If you have questions about contributing:

- Open a discussion on GitHub
- Ask in the pull request comments
- Check existing issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
