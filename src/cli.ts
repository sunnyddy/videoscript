import { Command } from 'commander';
import { renderCommand } from './commands/render';
import { displayVersion, checkForUpdates } from './utils/version-check';
import packageJson from '../package.json';

/**
 * Create and configure the CLI program
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('videoscript')
    .description('CLI tool for rendering VideoScript projects locally')
    .version(packageJson.version);

  // Render command
  program
    .command('render')
    .description('Render a VideoScript project export to video')
    .argument('<input>', 'Path to the export file (.zip or .json)')
    .option('-o, --output <path>', 'Output path for the rendered video')
    .option('-v, --verbose', 'Enable verbose logging', false)
    .option('--dry-run', 'Validate the export without rendering', false)
    .option('--keep-temp', 'Keep temporary files after rendering', false)
    .option(
      '-c, --codec <codec>',
      'Video codec (h264, h264-mkv, h265, vp8, vp9, prores)',
      'h264'
    )
    .option(
      '--max-size <mb>',
      'Maximum uncompressed ZIP size in MB',
      (val) => parseInt(val, 10) * 1024 * 1024,
      500 * 1024 * 1024
    )
    .action(async (input: string, options) => {
      try {
        await renderCommand(input, options);
        process.exit(0);
      } catch (error) {
        process.exit(1);
      }
    });

  return program;
}

/**
 * Run the CLI program
 */
export async function run(argv: string[] = process.argv): Promise<void> {
  // Display version and check for updates
  displayVersion();

  // Check for updates in the background (don't wait for it)
  checkForUpdates().catch(() => {
    // Silently fail
  });

  const program = createProgram();
  await program.parseAsync(argv);
}
