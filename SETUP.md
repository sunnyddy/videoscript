# VideoScript Renderer - Setup & Publishing Guide

This document provides step-by-step instructions for setting up, building, testing, and publishing the @videoscript/renderer package.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** (comes with Node.js)
- **FFmpeg** installed and in PATH
- **Git** (for version control)

## Initial Setup

### 1. Install Dependencies

```bash
cd videoscript_cli
npm install
```

This will install all required dependencies including:
- Remotion packages (@remotion/bundler, @remotion/renderer)
- CLI tools (commander, ora, chalk)
- Build tools (tsup, typescript)
- Validation (zod)
- And more...

### 2. Verify Installation

Check that all dependencies are installed correctly:

```bash
npm run typecheck
```

## Building the Project

### Build Everything

```bash
npm run build
```

This runs three steps:
1. `npm run clean` - Removes old build artifacts
2. `npm run build:remotion` - Compiles Remotion components with tsc
3. `npm run build:cli` - Bundles CLI code with tsup

### Build Output

After building, you'll have:

```
dist/
├── bin/
│   ├── videoscript.js          # CLI entry point
│   └── videoscript.d.ts
├── cli/
│   ├── index.js                # CLI main module
│   └── index.d.ts
├── commands/
│   ├── render.js               # Render command
│   └── render.d.ts
├── utils/
│   ├── index.js                # Utilities
│   └── index.d.ts
└── remotion/                    # Remotion components
    ├── index.js
    ├── DynamicVideo.js
    ├── Root.js
    ├── types.js
    ├── components/
    └── renderers/
```

## Testing Locally

### Method 1: Direct Execution

```bash
# Test the built CLI directly
node dist/bin/videoscript.js --version
node dist/bin/videoscript.js --help

# Test rendering (requires a sample .zip export)
node dist/bin/videoscript.js render path/to/sample.zip
```

### Method 2: npm link

Link the package globally for testing:

```bash
# In the videoscript_cli directory
npm link

# Now you can use it anywhere
videoscript --version
videoscript render sample.zip
```

To unlink later:

```bash
npm unlink -g @videoscript/renderer
```

### Method 3: Pack and Install

Test the package as users would install it:

```bash
# Create a tarball
npm pack

# This creates: videoscript-renderer-1.0.0.tgz

# Install it globally
npm install -g ./videoscript-renderer-1.0.0.tgz

# Test
videoscript --version
videoscript render sample.zip

# Uninstall when done
npm uninstall -g @videoscript/renderer
```

## Testing Checklist

Before publishing, test these scenarios:

- [ ] `videoscript --version` displays the correct version
- [ ] `videoscript --help` shows help text
- [ ] `videoscript render --help` shows render command help
- [ ] Render a sample ZIP file successfully
- [ ] `--dry-run` validates without rendering
- [ ] `--verbose` shows detailed logs
- [ ] `--keep-temp` preserves temporary files
- [ ] Error handling works (try invalid files)
- [ ] FFmpeg check works (temporarily remove FFmpeg from PATH)
- [ ] Works with both .zip and .json files
- [ ] Media file validation works correctly

## Publishing to npm

### Pre-Publishing Checklist

- [ ] All tests pass
- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated
- [ ] README.md is accurate and complete
- [ ] LICENSE file is present
- [ ] Build succeeds: `npm run build`
- [ ] Package builds correctly: `npm pack`
- [ ] Tarball contents verified: `tar -tzf videoscript-renderer-*.tgz`

### Publishing Steps

1. **Ensure you're logged in to npm:**

```bash
npm login
```

2. **Verify package.json settings:**

```json
{
  "name": "@videoscript/renderer",
  "version": "1.0.0",
  "private": false,  // Ensure this is false or removed
  "publishConfig": {
    "access": "public"  // Required for scoped packages
  }
}
```

3. **Build the package:**

```bash
npm run build
```

4. **Verify the package contents:**

```bash
npm pack
tar -tzf videoscript-renderer-1.0.0.tgz | head -20
```

Verify that it includes:
- dist/ directory
- README.md
- LICENSE
- CHANGELOG.md
- package.json

5. **Publish to npm:**

```bash
# Dry run first (safe test)
npm publish --dry-run

# If all looks good, publish for real
npm publish --access public
```

6. **Verify publication:**

```bash
# Check on npmjs.com
open https://www.npmjs.com/package/@videoscript/renderer

# Test installation
npx @videoscript/renderer@latest --version
```

### Post-Publishing

1. **Create a git tag:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

2. **Create a GitHub release:**

Go to GitHub and create a release from the tag with:
- Release title: "v1.0.0"
- Description: Copy from CHANGELOG.md
- Attach the tarball (optional)

3. **Announce:**

Consider announcing on:
- GitHub Discussions
- Social media
- Developer communities
- VideoScript platform

## Version Updates

For subsequent releases:

1. **Update version:**

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

2. **Update CHANGELOG.md:**

Move items from [Unreleased] to new version section.

3. **Build and test:**

```bash
npm run build
npm pack
# Test the tarball
```

4. **Publish:**

```bash
npm publish
git push
git push --tags
```

## Troubleshooting

### Build Fails

**Issue**: TypeScript compilation errors

**Solution**:
- Run `npm run typecheck` to see all type errors
- Check that all dependencies are installed
- Ensure you're using Node.js 18+

### Publish Fails with Authentication Error

**Issue**: `npm ERR! code E401` or similar

**Solution**:
- Run `npm login` and authenticate
- Verify you have publishing rights for the @videoscript scope
- Check your npm token is valid

### Package Not Found After Publishing

**Issue**: `npx @videoscript/renderer` fails

**Solution**:
- Wait a few minutes (npm CDN propagation)
- Clear npm cache: `npm cache clean --force`
- Check the package exists on npmjs.com

### CLI Not Executable

**Issue**: "Permission denied" when running CLI

**Solution**:
- Check the shebang line in bin/videoscript.js
- Verify the bin field in package.json is correct
- On Unix, the file should have executable permissions (npm handles this)

## Development Workflow

### Typical Development Cycle

```bash
# 1. Make changes to source code
vim src/commands/render.ts

# 2. Build (or use watch mode)
npm run build
# OR
npm run dev  # watch mode

# 3. Test locally
node dist/bin/videoscript.js render sample.zip --verbose

# 4. Lint and type check
npm run lint
npm run typecheck

# 5. Commit changes
git add .
git commit -m "Add feature: description"

# 6. When ready to release
npm version patch
npm run build
npm publish
git push --tags
```

### Watch Mode for Development

```bash
# Terminal 1: Watch and rebuild on changes
npm run dev

# Terminal 2: Test your changes
node dist/bin/videoscript.js render test.zip
```

## File Structure Reference

```
videoscript_cli/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI
├── examples/
│   ├── README.md                # Examples documentation
│   └── sample-project.json      # Sample export
├── src/
│   ├── bin/
│   │   └── videoscript.ts       # CLI entry point
│   ├── commands/
│   │   └── render.ts            # Render command
│   ├── remotion/                # Remotion components
│   │   ├── index.ts
│   │   ├── Root.tsx
│   │   ├── DynamicVideo.tsx
│   │   ├── types.ts
│   │   ├── components/
│   │   │   └── TraitWrapper.tsx
│   │   └── renderers/
│   │       ├── CharacterRenderer.tsx
│   │       ├── PropRenderer.tsx
│   │       ├── SceneryRenderer.tsx
│   │       ├── PictureRenderer.tsx
│   │       └── AudioRenderer.tsx
│   ├── types/
│   │   └── export-package.ts    # TypeScript types & Zod schemas
│   ├── utils/
│   │   ├── index.ts
│   │   ├── logger.ts            # Logging utilities
│   │   ├── ffmpeg-check.ts      # FFmpeg validation
│   │   └── zip-handler.ts       # ZIP extraction with security
│   └── cli.ts                   # Commander.js setup
├── dist/                        # Build output (gitignored)
├── .eslintrc.json               # ESLint config
├── .gitignore                   # Git ignore rules
├── .npmignore                   # npm publish ignore rules
├── .prettierrc.json             # Prettier config
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE                      # MIT License
├── package.json                 # Package configuration
├── README.md                    # Main documentation
├── SETUP.md                     # This file
├── tsconfig.json                # TypeScript config (CLI)
├── tsconfig.remotion.json       # TypeScript config (Remotion)
└── tsup.config.ts               # Build config
```

## Support

For issues or questions:

- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions and share ideas
- Documentation: Check README.md and examples/

## Next Steps

After setup:

1. ✅ Install dependencies
2. ✅ Build the project
3. ✅ Test locally
4. ✅ Review code and documentation
5. ✅ Make any necessary adjustments
6. ✅ Publish to npm (when ready)
7. ✅ Share with the community!
