/**
 * Version checking utilities for the CLI
 */

import chalk from 'chalk';
import packageJson from '../../package.json';

/**
 * Display the current version
 */
export function displayVersion(): void {
  console.log(chalk.blue(`\n📦 VideoScript Renderer v${packageJson.version}\n`));
}

/**
 * Check for updates from npm registry
 */
export async function checkForUpdates(): Promise<void> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageJson.name}/latest`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      // Silently fail if we can't reach npm registry
      return;
    }

    const data = await response.json() as { version?: string };
    const latestVersion = data.version;
    const currentVersion = packageJson.version;

    if (latestVersion && latestVersion !== currentVersion) {
      // Compare versions
      if (isNewerVersion(latestVersion, currentVersion)) {
        console.log(chalk.yellow('┌─────────────────────────────────────────────────────────┐'));
        console.log(chalk.yellow('│') + '                                                         ' + chalk.yellow('│'));
        console.log(
          chalk.yellow('│') +
            '  ' +
            chalk.bold('Update available! ') +
            chalk.dim(`${currentVersion}`) +
            ' → ' +
            chalk.green.bold(`${latestVersion}`) +
            '  '.repeat(Math.max(0, 18 - currentVersion.length - latestVersion.length)) +
            chalk.yellow('│')
        );
        console.log(chalk.yellow('│') + '                                                         ' + chalk.yellow('│'));
        console.log(
          chalk.yellow('│') +
            '  Run: ' +
            chalk.cyan(`npm install -g ${packageJson.name}@latest`) +
            '  '.repeat(Math.max(0, 10 - packageJson.name.length)) +
            chalk.yellow('│')
        );
        console.log(chalk.yellow('│') + '                                                         ' + chalk.yellow('│'));
        console.log(chalk.yellow('└─────────────────────────────────────────────────────────┘\n'));
      }
    }
  } catch (error) {
    // Silently fail - don't interrupt the user's workflow
    // console.debug('Failed to check for updates:', error);
  }
}

/**
 * Compare two semver version strings
 * Returns true if newVersion is newer than currentVersion
 */
function isNewerVersion(newVersion: string, currentVersion: string): boolean {
  const newParts = newVersion.split('.').map(Number);
  const currentParts = currentVersion.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const newPart = newParts[i] || 0;
    const currentPart = currentParts[i] || 0;

    if (newPart > currentPart) return true;
    if (newPart < currentPart) return false;
  }

  return false;
}
