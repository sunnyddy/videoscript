import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ora from 'ora';
import chalk from 'chalk';
import { Logger } from '../utils/logger';
import { extractZipSafely, validateExtractedFiles } from '../utils/zip-handler';
import { ensureFfmpeg } from '../utils/ffmpeg-check';
import { validateExportPackage, type ExportPackage } from '../types/export-package';

export interface RenderOptions {
  output?: string;
  verbose?: boolean;
  dryRun?: boolean;
  keepTemp?: boolean;
  codec?: 'h264' | 'h264-mkv' | 'h265' | 'vp8' | 'vp9' | 'prores';
  maxSize?: number;
}

/**
 * Main render command implementation
 */
export async function renderCommand(
  inputPath: string,
  options: RenderOptions = {}
): Promise<void> {
  const logger = new Logger(options.verbose);
  let tempDir: string | null = null;
  let shouldCleanup = false;

  try {
    // Header
    console.log(chalk.cyan.bold('\n🎬 VideoScript Renderer\n'));

    // Check FFmpeg
    if (!options.dryRun) {
      ensureFfmpeg(logger);
    }

    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const isZipFile = inputPath.toLowerCase().endsWith('.zip');
    let projectJsonPath = inputPath;
    let publicDir: string | undefined;

    // Extract ZIP if needed
    if (isZipFile) {
      const extractSpinner = ora('Extracting ZIP file...').start();

      try {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'videoscript-render-'));
        shouldCleanup = !options.keepTemp;
        logger.debug(`Temp directory: ${tempDir}`);

        await extractZipSafely(inputPath, tempDir, {
          maxSize: options.maxSize,
          logger,
        });

        validateExtractedFiles(tempDir, ['project.json']);

        extractSpinner.succeed('ZIP extracted successfully');

        projectJsonPath = path.join(tempDir, 'project.json');
        publicDir = tempDir;

        // Check for assets directory
        const assetsDir = path.join(tempDir, 'assets');
        if (fs.existsSync(assetsDir)) {
          logger.debug(`Assets directory found: ${assetsDir}`);
        }
      } catch (error) {
        extractSpinner.fail('Failed to extract ZIP');
        throw error;
      }
    } else {
      logger.info('Processing JSON file directly');
    }

    // Read and validate project JSON
    const validationSpinner = ora('Validating project data...').start();

    let exportData: ExportPackage;
    try {
      const jsonContent = fs.readFileSync(projectJsonPath, 'utf-8');
      const rawData = JSON.parse(jsonContent);
      exportData = validateExportPackage(rawData);

      validationSpinner.succeed('Project data validated');
    } catch (error) {
      validationSpinner.fail('Invalid project data');
      if (error instanceof Error) {
        logger.error(`Validation error: ${error.message}`);
      }
      throw new Error('Failed to validate export package');
    }

    // Display project info
    console.log(chalk.bold('\n📋 Project Information:'));
    console.log(`   Name: ${chalk.cyan(exportData.project.name)}`);
    console.log(`   Resolution: ${chalk.cyan(`${exportData.project.width}x${exportData.project.height}`)}`);
    console.log(`   FPS: ${chalk.cyan(exportData.project.fps)}`);
    console.log(`   Duration: ${chalk.cyan(exportData.project.durationInFrames)} frames (${(exportData.project.durationInFrames / exportData.project.fps).toFixed(2)}s)`);
    console.log(`   Prototypes: ${chalk.cyan(exportData.prototypes.length)}`);

    if (exportData.mediaFiles && exportData.mediaFiles.length > 0) {
      console.log(`   Media files: ${chalk.cyan(exportData.mediaFiles.length)}`);
    }

    // Validate media files if needed
    if (exportData.mediaFiles && exportData.mediaFiles.length > 0 && publicDir) {
      const mediaSpinner = ora('Validating media files...').start();

      const assetsDir = path.join(publicDir, 'assets');
      const missingFiles: string[] = [];

      for (const mediaFile of exportData.mediaFiles) {
        const filename = mediaFile.filename.replace(/^assets\//, '');
        const mediaPath = path.join(assetsDir, filename);

        if (!fs.existsSync(mediaPath)) {
          missingFiles.push(filename);
        } else {
          logger.debug(`Found media file: ${filename}`);
        }
      }

      if (missingFiles.length > 0) {
        mediaSpinner.fail('Missing media files');
        logger.error('The following media files are missing:');
        missingFiles.forEach(file => {
          logger.log(`   - ${file}`);
        });
        throw new Error('Missing required media files');
      }

      mediaSpinner.succeed('All media files validated');
    }

    // Dry run mode - exit here
    if (options.dryRun) {
      console.log(chalk.green.bold('\n✓ Dry run completed successfully\n'));
      logger.info('Use without --dry-run to render the video');
      return;
    }

    // Determine output path
    const outputPath = options.output || path.join(
      process.cwd(),
      `${exportData.project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp4`
    );

    console.log(chalk.bold('\n📹 Output:'), chalk.cyan(outputPath));

    // Bundle Remotion project
    const bundleSpinner = ora('Bundling Remotion project...').start();

    let bundleLocation: string;
    try {
      // Resolve the remotion entry point - must use source .ts files, not compiled .js
      // The bundler needs TypeScript/JSX source to properly process React components
      const remotionEntryPoint = path.resolve(__dirname, '../../src/remotion/index.ts');
      logger.debug(`Remotion entry point: ${remotionEntryPoint}`);

      if (!fs.existsSync(remotionEntryPoint)) {
        throw new Error(`Remotion entry point not found: ${remotionEntryPoint}`);
      }

      const bundleOptions: Parameters<typeof bundle>[0] = {
        entryPoint: remotionEntryPoint,
        onProgress: (progress) => {
          if (options.verbose && progress % 25 === 0) {
            logger.debug(`Bundle progress: ${progress}%`);
          }
        },
      };

      if (publicDir) {
        bundleOptions.publicDir = publicDir;
        logger.debug(`Public directory: ${publicDir}`);
      }

      bundleLocation = await bundle(bundleOptions);
      bundleSpinner.succeed('Remotion project bundled');
      logger.debug(`Bundle location: ${bundleLocation}`);
    } catch (error) {
      bundleSpinner.fail('Failed to bundle Remotion project');
      throw error;
    }

    // Select composition
    const compSpinner = ora('Preparing composition...').start();

    let composition;
    try {
      const inputProps = {
        project: exportData.project,
        prototypes: exportData.prototypes,
      };

      composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'DynamicVideo',
        inputProps,
      });

      // Override with project settings
      composition = {
        ...composition,
        width: exportData.project.width,
        height: exportData.project.height,
        fps: exportData.project.fps,
        durationInFrames: exportData.project.durationInFrames,
      };

      compSpinner.succeed('Composition prepared');
    } catch (error) {
      compSpinner.fail('Failed to prepare composition');
      throw error;
    }

    // Render video
    const renderSpinner = ora('Rendering video...').start();

    const startTime = Date.now();

    try {
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: options.codec || 'h264',
        outputLocation: outputPath,
        inputProps: {
          project: exportData.project,
          prototypes: exportData.prototypes,
        },
        onProgress: ({ progress }) => {
          const percent = Math.round(progress * 100);
          const width = 30;
          const completed = Math.round(width * progress);
          const remaining = width - completed;
          const bar = '█'.repeat(completed) + '░'.repeat(remaining);
          renderSpinner.text = `Rendering video... [${bar}] ${percent}%`;
        },
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(1);

      renderSpinner.succeed(`Video rendered in ${duration}s`);
    } catch (error) {
      renderSpinner.fail('Rendering failed');
      throw error;
    }

    // Success
    console.log(chalk.green.bold('\n✓ Render complete!\n'));
    console.log(chalk.bold('Output file:'), chalk.cyan(outputPath));

    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(chalk.bold('File size:'), chalk.cyan(`${sizeMB} MB\n`));

  } catch (error) {
    // Error handling
    console.log('');
    logger.error('Render failed');

    if (error instanceof Error) {
      logger.error(error.message);

      if (options.verbose && error.stack) {
        logger.debug('Stack trace:');
        console.error(error.stack);
      }
    }

    throw error;
  } finally {
    // Cleanup
    if (tempDir && shouldCleanup) {
      try {
        const cleanupSpinner = ora('Cleaning up temporary files...').start();
        fs.rmSync(tempDir, { recursive: true, force: true });
        cleanupSpinner.succeed('Cleanup complete');
      } catch (error) {
        logger.warn(`Failed to clean up temp directory: ${(error as Error).message}`);
      }
    } else if (tempDir && options.keepTemp) {
      logger.info(`Temporary files kept at: ${tempDir}`);
    }
  }
}
