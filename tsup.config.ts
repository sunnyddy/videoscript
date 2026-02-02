import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'bin/videoscript': 'src/bin/videoscript.ts',
    'cli/index': 'src/cli.ts',
    'commands/render': 'src/commands/render.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: false,
  external: [
    'react',
    'react-dom',
    '@remotion/bundler',
    '@remotion/renderer',
    'remotion'
  ],
  noExternal: ['ora', 'chalk', 'commander', 'adm-zip', 'zod'],
  platform: 'node',
  target: 'node18',
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
