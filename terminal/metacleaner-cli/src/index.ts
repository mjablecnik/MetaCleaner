import './polyfills.js';
import type { CLIOptions, CommandResult } from './types.js';
import { executeCommand } from './commands.js';

const args = process.argv.slice(2);

const KNOWN_COMMANDS = new Set(['scan', 'clean', 'compare', 'help', 'version']);

interface ParseResult {
  options: CLIOptions;
  unknownCommand?: string;
}

function parseArgs(argv: string[]): ParseResult {
  let command: CLIOptions['command'] = 'help';
  const files: string[] = [];
  let server = 'http://localhost:8080';
  let json = false;
  let verbose = false;
  let quiet = false;
  let output: string | undefined;
  let timeout = 60;
  let unknownCommand: string | undefined;
  let commandSet = false;

  // --version anywhere in args takes precedence
  if (argv.includes('--version')) {
    return {
      options: { command: 'version', files: [], server, json, verbose, quiet, output, timeout },
    };
  }

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--server') {
      server = argv[++i] ?? server;
    } else if (arg === '--json') {
      json = true;
    } else if (arg === '--verbose') {
      verbose = true;
    } else if (arg === '--quiet') {
      quiet = true;
    } else if (arg === '--output') {
      output = argv[++i];
    } else if (arg === '--timeout') {
      const val = parseInt(argv[++i] ?? '', 10);
      timeout = isNaN(val) ? 60 : val;
    } else if (arg.startsWith('--')) {
      // unknown flag — ignore
    } else if (!commandSet) {
      if (KNOWN_COMMANDS.has(arg)) {
        command = arg as CLIOptions['command'];
      } else {
        unknownCommand = arg;
        command = 'help';
      }
      commandSet = true;
    } else {
      files.push(arg);
    }

    i++;
  }

  return {
    options: { command, files, server, json, verbose, quiet, output, timeout },
    unknownCommand,
  };
}

async function main(): Promise<void> {
  // No arguments → show help
  if (args.length === 0) {
    const { options } = parseArgs([]);
    const result: CommandResult = await executeCommand(options);
    process.exit(result.exitCode);
  }

  const { options, unknownCommand } = parseArgs(args);

  if (options.verbose && options.quiet) {
    process.stderr.write('Error: --verbose and --quiet flags are mutually exclusive\n');
    process.exit(2);
  }

  if (unknownCommand) {
    process.stderr.write(`Unknown command: ${unknownCommand}\n\n`);
    await executeCommand({ ...options, command: 'help' });
    process.exit(2);
  }

  const result: CommandResult = await executeCommand(options);
  process.exit(result.exitCode);
}

main().catch((err: Error) => {
  process.stderr.write(`Unexpected error: ${err.message}\n`);
  process.exit(2);
});
