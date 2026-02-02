/**
 * VideoScript Renderer CLI Entry Point
 */

import { run } from '../cli';

// Run the CLI
run().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
