import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CLIOptions, CommandResult } from './types.js';

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
  --output <path>      Output directory or file path for cleaned files
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
    case 'clean':
    case 'compare': {
      // Implemented in later tasks (3, 7, 8)
      process.stderr.write(`Command '${options.command}' not yet implemented\n`);
      return { exitCode: 2, results: [] };
    }

    default: {
      process.stdout.write(HELP_TEXT + '\n');
      return { exitCode: 2, results: [] };
    }
  }
}
