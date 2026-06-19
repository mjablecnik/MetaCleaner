// defensive: also imported by index.ts — ensures polyfills are available when commands.ts is imported standalone (e.g. in tests)
import './polyfills.js';
import { readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { rm } from 'fs/promises';
import type { CLIOptions, CommandResult, FileResult, CleanResult, CompareResult } from './types.js';
import { scanFiles } from './scanner.js';
import {
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from 'metacleaner-app/src/lib/scanner/constants.js';
import {
  formatScanResult,
  formatCleanResult,
  formatCompareResult,
  formatSummary,
  computeAggregatedSummary,
  determineExitCode,
  getDefaultOutputPath,
  formatSeverity,
} from './formatter.js';
import {
  checkHealth,
  uploadFiles,
  createJob,
  waitForJob,
  downloadFile,
  TimeoutError,
} from './serverClient.js';
import { createProgressIndicator } from './progress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getVersion(): string {
  const pkgPath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
  return pkg.version;
}

const HELP_TEXT = `
metacleaner - File metadata inspection and cleaning CLI

USAGE:
  metacleaner <command> [files...] [flags]

COMMANDS:
  scan     Scan files and display metadata with risk assessment
  clean    Clean metadata from files via the backend server
  compare  Compare metadata before and after cleaning
  help     Show this help message

GLOBAL FLAGS:
  --server <url>       Backend server URL (default: http://localhost:8080)
  --json               Output results in JSON format
  --verbose            Show additional details including raw parser output
  --quiet              Output only risk score and severity per file (one line per file)
  --output <path>      Output directory or file path for cleaned files (default: current working directory)
  --timeout <seconds>  Maximum server polling wait time in seconds (default: 60)
  --version            Print the version string and exit

EXAMPLES:
  # Scan a single file
  metacleaner scan photo.jpg

  # Scan multiple files with JSON output
  metacleaner scan photo.jpg video.mp4 --json

  # Clean metadata from a file (requires backend server)
  metacleaner clean photo.jpg --server http://localhost:8080

  # Clean and save to specific location
  metacleaner clean photo.jpg --output ./cleaned/

  # Compare metadata before and after cleaning
  metacleaner compare photo.jpg

  # Scan quietly (one line per file)
  metacleaner scan photo.jpg --quiet

  # Print version
  metacleaner --version
`.trim();

async function executeScan(options: CLIOptions): Promise<CommandResult> {
  if (options.files.length === 0) {
    process.stderr.write('Error: No files specified. Usage: metacleaner scan <files...>\n');
    return { exitCode: 2, results: [] };
  }

  const results = await scanFiles(options.files);
  const formatOpts = { json: options.json, verbose: options.verbose, quiet: options.quiet, outputConfig: options.outputConfig };

  if (options.json) {
    if (results.length === 1) {
      process.stdout.write(formatScanResult(results[0], formatOpts) + '\n');
    } else {
      process.stdout.write(formatSummary(results, formatOpts) + '\n');
    }
  } else {
    for (const result of results) {
      process.stdout.write(formatScanResult(result, formatOpts) + '\n');
    }
    if (results.length > 1) {
      process.stdout.write(formatSummary(results, formatOpts) + '\n');
    }
  }

  return {
    exitCode: determineExitCode(results),
    results,
    summary: computeAggregatedSummary(results),
  };
}

function resolveOutputPath(filePath: string, output: string | undefined, multipleFiles: boolean): string {
  const fileName = filePath.split('/').pop() ?? filePath;
  const defaultName = getDefaultOutputPath(fileName);

  if (!output) return defaultName;

  if (existsSync(output) && statSync(output).isDirectory()) {
    return join(output, defaultName);
  }

  if (multipleFiles) {
    return join(output, defaultName);
  }

  return output;
}

async function executeClean(options: CLIOptions): Promise<CommandResult> {
  if (options.files.length === 0) {
    process.stderr.write('Error: No files specified. Usage: metacleaner clean <files...>\n');
    return { exitCode: 2, results: [] };
  }

  const healthy = await checkHealth(options.server);
  if (!healthy) {
    process.stderr.write(`Error: Cannot connect to server at ${options.server}\n`);
    return { exitCode: 2, results: [] };
  }

  const formatOpts = { json: options.json, verbose: options.verbose, quiet: options.quiet, outputConfig: options.outputConfig };
  const progress = createProgressIndicator(formatOpts);
  const results: FileResult[] = [];
  const multipleFiles = options.files.length > 1;

  for (const filePath of options.files) {
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

    const fileSize = statSync(filePath).size;

    try {
      const uploaded = await uploadFiles(options.server, [filePath]);
      if (uploaded.length === 0) throw new Error('Upload returned no files');
      const fileId = uploaded[0].id;

      const job = await createJob(options.server, [fileId]);
      const status = await waitForJob(options.server, job.jobId, options.timeout, progress);

      if (status.status === 'failed') throw new Error('Server cleaning job failed');

      const outputPath = resolveOutputPath(filePath, options.output, multipleFiles);
      await downloadFile(options.server, fileId, outputPath);
      const cleanedSize = statSync(outputPath).size;

      const cleanResult: CleanResult = {
        fieldsRemoved: status.fieldsRemoved,
        gpsStripped: status.gpsLocationsRemoved > 0,
        originalSize: fileSize,
        cleanedSize,
        cleanedFilePath: outputPath,
      };

      results.push({ filePath, fileName, fileSize, format, cleanResult });
    } catch (err) {
      if (err instanceof TimeoutError) {
        process.stderr.write(`Timeout: ${err.message}\n`);
        return { exitCode: 2, results };
      }
      results.push({
        filePath,
        fileName,
        fileSize,
        format,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (options.json) {
    if (results.length === 1) {
      process.stdout.write(formatCleanResult(results[0], formatOpts) + '\n');
    } else {
      process.stdout.write(formatSummary(results, formatOpts) + '\n');
    }
  } else {
    for (const result of results) {
      process.stdout.write(formatCleanResult(result, formatOpts) + '\n');
    }
    if (results.length > 1) {
      process.stdout.write(formatSummary(results, formatOpts) + '\n');
    }
  }

  return {
    exitCode: determineExitCode(results),
    results,
    summary: computeAggregatedSummary(results),
  };
}

async function executeCompare(options: CLIOptions): Promise<CommandResult> {
  if (options.files.length === 0) {
    process.stderr.write('Error: No files specified. Usage: metacleaner compare <files...>\n');
    return { exitCode: 2, results: [] };
  }

  const formatOpts = { json: options.json, verbose: options.verbose, quiet: options.quiet, outputConfig: options.outputConfig };

  const healthy = await checkHealth(options.server);
  if (!healthy) {
    process.stderr.write(
      `Warning: Server at ${options.server} is unreachable. Showing scan results only.\n`,
    );
    const scanResults = await scanFiles(options.files);
    if (options.json) {
      if (scanResults.length === 1) {
        process.stdout.write(formatScanResult(scanResults[0], formatOpts) + '\n');
      } else {
        process.stdout.write(formatSummary(scanResults, formatOpts) + '\n');
      }
    } else {
      for (const result of scanResults) {
        process.stdout.write(formatScanResult(result, formatOpts) + '\n');
      }
      if (scanResults.length > 1) {
        process.stdout.write(formatSummary(scanResults, formatOpts) + '\n');
      }
    }
    return { exitCode: determineExitCode(scanResults), results: scanResults };
  }

  const progress = createProgressIndicator(formatOpts);
  const results: FileResult[] = [];

  for (const filePath of options.files) {
    const fileName = filePath.split('/').pop() ?? filePath;
    const fileSize = existsSync(filePath) ? statSync(filePath).size : 0;
    const ext = extname(filePath).toLowerCase();
    const format = IMAGE_EXTENSIONS[ext] ?? VIDEO_EXTENSIONS[ext] ?? '';

    try {
      const [beforeResult] = await scanFiles([filePath]);
      if (beforeResult.error || !beforeResult.scanResult) {
        results.push(beforeResult);
        continue;
      }

      const uploaded = await uploadFiles(options.server, [filePath]);
      if (uploaded.length === 0) throw new Error('Upload returned no files');
      const fileId = uploaded[0].id;

      const job = await createJob(options.server, [fileId]);
      const status = await waitForJob(options.server, job.jobId, options.timeout, progress);

      if (status.status === 'failed') throw new Error('Server cleaning job failed');

      const tempPath = join(tmpdir(), `metacleaner_${Date.now()}${ext}`);
      await downloadFile(options.server, fileId, tempPath);

      const [afterResult] = await scanFiles([tempPath]);
      await rm(tempPath, { force: true });

      if (afterResult.error || !afterResult.scanResult) {
        results.push({
          filePath,
          fileName,
          fileSize,
          format,
          error: afterResult.error ?? 'Failed to scan cleaned file',
        });
        continue;
      }

      const before = beforeResult.scanResult;
      const after = afterResult.scanResult;

      const compareResult: CompareResult = {
        before,
        after,
        fieldsRemovedCount: before.fieldCount - after.fieldCount,
        scoreBefore: before.fileScore,
        scoreAfter: after.fileScore,
        severityBefore: formatSeverity(before.fileScore),
        severityAfter: formatSeverity(after.fileScore),
        gpsRemovedInCleaning: before.hasGps && !after.hasGps,
      };

      results.push({ filePath, fileName, fileSize, format, scanResult: before, compareResult });
    } catch (err) {
      if (err instanceof TimeoutError) {
        progress.stop();
        process.stderr.write(`Timeout: ${err.message}\n`);
        return { exitCode: 2, results };
      }
      results.push({
        filePath,
        fileName,
        fileSize,
        format,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (options.json) {
    if (results.length === 1) {
      process.stdout.write(formatCompareResult(results[0], formatOpts) + '\n');
    } else {
      process.stdout.write(formatSummary(results, formatOpts) + '\n');
    }
  } else {
    for (const result of results) {
      process.stdout.write(formatCompareResult(result, formatOpts) + '\n');
    }
    if (results.length > 1) {
      process.stdout.write(formatSummary(results, formatOpts) + '\n');
    }
  }

  return {
    exitCode: determineExitCode(results),
    results,
    summary: computeAggregatedSummary(results),
  };
}

export async function executeCommand(options: CLIOptions): Promise<CommandResult> {
  switch (options.command) {
    case 'version': {
      const version = getVersion();
      process.stdout.write(`metacleaner v${version}\n`);
      return { exitCode: 0, results: [] };
    }

    case 'help': {
      process.stdout.write(HELP_TEXT + '\n');
      return { exitCode: 0, results: [] };
    }

    case 'scan':
      return executeScan(options);

    case 'clean':
      return executeClean(options);

    case 'compare':
      return executeCompare(options);

    default: {
      process.stdout.write(HELP_TEXT + '\n');
      return { exitCode: 2, results: [] };
    }
  }
}
