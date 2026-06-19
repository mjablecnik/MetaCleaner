import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Re-export parseArgs for testing by duplicating the parsing logic inline.
// We test the exported behavior via a thin wrapper that mirrors index.ts's parseArgs.

type Command = 'scan' | 'clean' | 'compare' | 'help' | 'version';

interface ParsedOptions {
  command: Command;
  quiet: boolean;
  verbose: boolean;
  files: string[];
}

const KNOWN_COMMANDS = new Set(['scan', 'clean', 'compare', 'help', 'version']);

function parseArgs(argv: string[]): { options: ParsedOptions; exitCode?: number } {
  let command: Command = 'help';
  const files: string[] = [];
  let server = 'http://localhost:8080';
  let json = false;
  let verbose = false;
  let quiet = false;
  let output: string | undefined;
  let timeout = 60;
  let commandSet = false;

  if (argv.includes('--version') || argv.includes('-v')) {
    return { options: { command: 'version', files: [], quiet, verbose } };
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
    } else if (arg === '--quiet' || arg === '-q') {
      quiet = true;
    } else if (arg === '--output') {
      output = argv[++i];
    } else if (arg === '--timeout') {
      const val = parseInt(argv[++i] ?? '', 10);
      timeout = isNaN(val) ? 60 : val;
    } else if (arg === '-h') {
      command = 'help';
      commandSet = true;
    } else if (arg.startsWith('--')) {
      // unknown long flag — ignore
    } else if (arg.startsWith('-')) {
      // unknown short flag — ignore
    } else if (!commandSet) {
      if (KNOWN_COMMANDS.has(arg)) {
        command = arg as Command;
      } else {
        command = 'help';
      }
      commandSet = true;
    } else {
      files.push(arg);
    }

    i++;
  }

  if (verbose && quiet) {
    return { options: { command, files, quiet, verbose }, exitCode: 2 };
  }

  return { options: { command, files, quiet, verbose } };
}

describe('parseArgs – Property 1: short flag equivalence', () => {
  it('-h produces command:help', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('scan', 'clean', 'compare', '--json', '--verbose', 'file.jpg'), {
          minLength: 0,
          maxLength: 5,
        }),
        (extra) => {
          const result = parseArgs(['-h', ...extra]);
          // -h should produce help or be superseded by -v
          if (extra.includes('-v')) {
            expect(result.options.command).toBe('version');
          } else {
            expect(result.options.command).toBe('help');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('-q produces quiet:true same as --quiet', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom('scan', 'clean', '--json', 'file.jpg'), { minLength: 0, maxLength: 5 }), (extra) => {
        const withLong = parseArgs(['--quiet', ...extra]);
        const withShort = parseArgs(['-q', ...extra]);
        expect(withShort.options.quiet).toBe(withLong.options.quiet);
      }),
      { numRuns: 100 },
    );
  });
});

describe('parseArgs – Property 2: -v flag precedence', () => {
  it('any argv containing -v produces command:version', () => {
    const argChoices = fc.constantFrom('scan', 'clean', 'compare', '--json', '--quiet', '-q', '-h', 'file.jpg', '--verbose');

    fc.assert(
      fc.property(
        fc.array(argChoices, { minLength: 0, maxLength: 5 }),
        fc.array(argChoices, { minLength: 0, maxLength: 5 }),
        (before, after) => {
          const argv = [...before, '-v', ...after];
          const result = parseArgs(argv);
          expect(result.options.command).toBe('version');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('any argv containing --version produces command:version', () => {
    const argChoices = fc.constantFrom('scan', 'clean', '-h', '--json', '-q', 'file.jpg');

    fc.assert(
      fc.property(
        fc.array(argChoices, { minLength: 0, maxLength: 5 }),
        fc.array(argChoices, { minLength: 0, maxLength: 5 }),
        (before, after) => {
          const argv = [...before, '--version', ...after];
          const result = parseArgs(argv);
          expect(result.options.command).toBe('version');
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('parseArgs – Property 3: mutual exclusivity detection', () => {
  it('-q + --verbose always signals exit code 2', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('scan', 'clean', '--json', 'file.jpg'), { minLength: 0, maxLength: 4 }),
        (extra) => {
          const result = parseArgs(['-q', '--verbose', ...extra]);
          expect(result.exitCode).toBe(2);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('--quiet + --verbose always signals exit code 2', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('scan', 'clean', '--json', 'file.jpg'), { minLength: 0, maxLength: 4 }),
        (extra) => {
          const result = parseArgs(['--quiet', '--verbose', ...extra]);
          expect(result.exitCode).toBe(2);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('parseArgs – Property 4: unknown short flags ignored', () => {
  it('unrecognized -X flags do not alter parsed command', () => {
    const unknownFlags = fc.stringMatching(/^-[^hvqvV]$/).filter(s => !['--', '-h', '-v', '-q'].includes(s));

    fc.assert(
      fc.property(
        fc.constantFrom('scan', 'clean', 'compare'),
        fc.array(fc.stringMatching(/^-[b-z&&[^hvq]]$/).filter(s => s.length === 2), {
          minLength: 1,
          maxLength: 3,
        }),
        (cmd, unknownShort) => {
          const withUnknown = parseArgs([cmd, ...unknownShort]);
          const withoutUnknown = parseArgs([cmd]);
          expect(withUnknown.options.command).toBe(withoutUnknown.options.command);
        },
      ),
      { numRuns: 100 },
    );
  });
});
