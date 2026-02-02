import { execSync } from 'child_process';
import { Logger } from './logger';

/**
 * Check if FFmpeg is installed and accessible
 */
export function checkFfmpeg(logger: Logger): boolean {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    logger.debug('FFmpeg is installed and accessible');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get FFmpeg installation instructions for the current platform
 */
export function getFfmpegInstallInstructions(): string {
  const platform = process.platform;

  switch (platform) {
    case 'darwin':
      return `Install FFmpeg on macOS:
  - Using Homebrew: brew install ffmpeg
  - Download from: https://ffmpeg.org/download.html`;

    case 'win32':
      return `Install FFmpeg on Windows:
  - Using Chocolatey: choco install ffmpeg
  - Using Scoop: scoop install ffmpeg
  - Download from: https://ffmpeg.org/download.html`;

    case 'linux':
      return `Install FFmpeg on Linux:
  - Ubuntu/Debian: sudo apt-get install ffmpeg
  - Fedora: sudo dnf install ffmpeg
  - Arch: sudo pacman -S ffmpeg
  - Download from: https://ffmpeg.org/download.html`;

    default:
      return `Install FFmpeg from: https://ffmpeg.org/download.html`;
  }
}

/**
 * Check FFmpeg and exit with instructions if not found
 */
export function ensureFfmpeg(logger: Logger): void {
  if (!checkFfmpeg(logger)) {
    logger.error('FFmpeg is not installed or not in PATH');
    logger.log('');
    logger.log(getFfmpegInstallInstructions());
    logger.log('');
    logger.log('After installing FFmpeg, please try again.');
    process.exit(1);
  }
}
