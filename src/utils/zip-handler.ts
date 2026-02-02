import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { Logger } from './logger';

export interface ZipExtractionOptions {
  maxSize?: number; // Maximum uncompressed size in bytes (default: 500MB)
  maxFiles?: number; // Maximum number of files (default: 10000)
  logger?: Logger;
}

export class ZipSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZipSecurityError';
  }
}

/**
 * Sanitize a file path to prevent directory traversal attacks
 */
function sanitizePath(filePath: string): string {
  const normalized = path.normalize(filePath);

  // Reject absolute paths
  if (path.isAbsolute(normalized)) {
    throw new ZipSecurityError(`Absolute paths are not allowed: ${filePath}`);
  }

  // Reject paths with ..
  if (normalized.includes('..')) {
    throw new ZipSecurityError(`Path traversal detected: ${filePath}`);
  }

  return normalized;
}

/**
 * Extract a ZIP file with security checks
 */
export async function extractZipSafely(
  zipPath: string,
  outputDir: string,
  options: ZipExtractionOptions = {}
): Promise<void> {
  const {
    maxSize = 500 * 1024 * 1024, // 500MB
    maxFiles = 10000,
    logger,
  } = options;

  logger?.debug(`Extracting ZIP: ${zipPath}`);
  logger?.debug(`Output directory: ${outputDir}`);

  // Validate ZIP file exists
  if (!fs.existsSync(zipPath)) {
    throw new Error(`ZIP file not found: ${zipPath}`);
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let zip: AdmZip;
  try {
    zip = new AdmZip(zipPath);
  } catch (error) {
    throw new Error(`Failed to read ZIP file: ${(error as Error).message}`);
  }

  const entries = zip.getEntries();

  // Check file count
  if (entries.length > maxFiles) {
    throw new ZipSecurityError(
      `ZIP contains too many files: ${entries.length} (max: ${maxFiles})`
    );
  }

  logger?.debug(`ZIP contains ${entries.length} entries`);

  // Calculate total uncompressed size and validate paths
  let totalSize = 0;
  const filesToExtract: AdmZip.IZipEntry[] = [];

  for (const entry of entries) {
    // Skip directories
    if (entry.isDirectory) {
      continue;
    }

    // Sanitize path
    try {
      sanitizePath(entry.entryName);
    } catch (error) {
      throw new ZipSecurityError(
        `Invalid entry in ZIP: ${entry.entryName} - ${(error as Error).message}`
      );
    }

    totalSize += entry.header.size;
    filesToExtract.push(entry);

    // Check size limit
    if (totalSize > maxSize) {
      throw new ZipSecurityError(
        `ZIP uncompressed size exceeds limit: ${Math.round(totalSize / 1024 / 1024)}MB (max: ${Math.round(maxSize / 1024 / 1024)}MB)`
      );
    }
  }

  logger?.debug(
    `Total uncompressed size: ${Math.round(totalSize / 1024 / 1024)}MB`
  );

  // Extract files
  for (const entry of filesToExtract) {
    const outputPath = path.join(outputDir, entry.entryName);
    const outputDirPath = path.dirname(outputPath);

    // Ensure output directory exists
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }

    // Extract file
    try {
      const content = entry.getData();
      fs.writeFileSync(outputPath, content);
      logger?.debug(`Extracted: ${entry.entryName}`);
    } catch (error) {
      throw new Error(
        `Failed to extract ${entry.entryName}: ${(error as Error).message}`
      );
    }
  }

  logger?.debug(`Successfully extracted ${filesToExtract.length} files`);
}

/**
 * Validate that required files exist in the extracted directory
 */
export function validateExtractedFiles(
  extractedDir: string,
  requiredFiles: string[] = ['project.json']
): void {
  for (const file of requiredFiles) {
    const filePath = path.join(extractedDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file not found in ZIP: ${file}`);
    }
  }
}
