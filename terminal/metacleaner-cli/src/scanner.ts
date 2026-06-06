import './polyfills.js';
import { extname } from 'path';
import { existsSync, statSync } from 'fs';
import type { ScanResult } from 'metacleaner-app/src/lib/scanner/types.js';
import { parseFile } from 'metacleaner-app/src/lib/scanner/metadataParser.js';
import {
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from 'metacleaner-app/src/lib/scanner/constants.js';
import type { FileResult } from './types.js';

export async function createFileFromPath(filePath: string): Promise<File> {
  const buf = await Bun.file(filePath).arrayBuffer();
  const fileName = filePath.split('/').pop() ?? filePath;
  const ext = extname(fileName).toLowerCase();
  const isImage = ext in IMAGE_EXTENSIONS;
  const isVideo = ext in VIDEO_EXTENSIONS;
  const mimeType = isImage ? `image/${IMAGE_EXTENSIONS[ext]}` : isVideo ? `video/${VIDEO_EXTENSIONS[ext]}` : 'application/octet-stream';

  return new File([buf], fileName, { type: mimeType });
}

export async function scanFile(filePath: string): Promise<ScanResult> {
  const ext = extname(filePath).toLowerCase();
  const isSupported = ext in IMAGE_EXTENSIONS || ext in VIDEO_EXTENSIONS;

  if (!isSupported) {
    throw new Error(`Unsupported file format: ${ext || '(no extension)'}`);
  }

  const file = await createFileFromPath(filePath);
  const fileId = filePath;
  return parseFile(file, fileId);
}

export async function scanFiles(filePaths: string[]): Promise<FileResult[]> {
  const results: FileResult[] = [];

  for (const filePath of filePaths) {
    const fileName = filePath.split('/').pop() ?? filePath;

    if (!existsSync(filePath)) {
      results.push({
        filePath,
        fileName,
        fileSize: 0,
        format: '',
        error: `File not found: ${filePath}`,
      });
      continue;
    }

    const ext = extname(filePath).toLowerCase();
    const format = IMAGE_EXTENSIONS[ext] ?? VIDEO_EXTENSIONS[ext] ?? '';

    if (!format) {
      const fileSize = statSync(filePath).size;
      results.push({
        filePath,
        fileName,
        fileSize,
        format: '',
        error: `Unsupported file format: ${ext || '(no extension)'}`,
      });
      continue;
    }

    try {
      const fileSize = statSync(filePath).size;
      const scanResult = await scanFile(filePath);
      results.push({
        filePath,
        fileName,
        fileSize,
        format,
        scanResult,
      });
    } catch (err) {
      const fileSize = statSync(filePath).size;
      results.push({
        filePath,
        fileName,
        fileSize,
        format,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
