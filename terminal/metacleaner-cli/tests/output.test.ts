import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  type OutputConfig,
  shouldUseColor,
  red,
  yellow,
  green,
  cyan,
  emoji,
  detectOutputConfig,
} from '../src/output.js';

const colorDisabled: OutputConfig = { noColor: true, stdoutTTY: false, stderrTTY: false };
const colorEnabled: OutputConfig = { noColor: false, stdoutTTY: true, stderrTTY: true };
const pipedStdout: OutputConfig = { noColor: false, stdoutTTY: false, stderrTTY: true };

const ANSI_RE = /\x1b\[[\d;]*m/;

describe('output – Property 5: color suppression when disabled', () => {
  it('no ANSI escape sequences when noColor=true', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        expect(red(text, colorDisabled)).not.toMatch(ANSI_RE);
        expect(yellow(text, colorDisabled)).not.toMatch(ANSI_RE);
        expect(green(text, colorDisabled)).not.toMatch(ANSI_RE);
        expect(cyan(text, colorDisabled)).not.toMatch(ANSI_RE);
      }),
      { numRuns: 100 },
    );
  });

  it('no ANSI escape sequences when stdout is not TTY', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        expect(red(text, pipedStdout)).not.toMatch(ANSI_RE);
        expect(yellow(text, pipedStdout)).not.toMatch(ANSI_RE);
        expect(green(text, pipedStdout)).not.toMatch(ANSI_RE);
        expect(cyan(text, pipedStdout)).not.toMatch(ANSI_RE);
      }),
      { numRuns: 100 },
    );
  });
});

describe('output – Property 6: correct ANSI wrapping when enabled', () => {
  it('red wraps text with \\x1b[31m...\\x1b[0m', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = red(text, colorEnabled);
        expect(result).toBe(`\x1b[31m${text}\x1b[0m`);
      }),
      { numRuns: 100 },
    );
  });

  it('yellow wraps text with \\x1b[33m...\\x1b[0m', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = yellow(text, colorEnabled);
        expect(result).toBe(`\x1b[33m${text}\x1b[0m`);
      }),
      { numRuns: 100 },
    );
  });

  it('green wraps text with \\x1b[32m...\\x1b[0m', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = green(text, colorEnabled);
        expect(result).toBe(`\x1b[32m${text}\x1b[0m`);
      }),
      { numRuns: 100 },
    );
  });

  it('cyan wraps text with \\x1b[36m...\\x1b[0m', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = cyan(text, colorEnabled);
        expect(result).toBe(`\x1b[36m${text}\x1b[0m`);
      }),
      { numRuns: 100 },
    );
  });
});

describe('output – Property 7: emoji replacement when colors disabled', () => {
  const knownEmoji = ['🔴', '🟠', '🟡', '🟢', '❌', '✅', '📍', '📱', '🔍', '🤖', '⚠️', '✔'];

  it('known emoji replaced with printable ASCII when color disabled', () => {
    fc.assert(
      fc.property(fc.constantFrom(...knownEmoji), (symbol) => {
        const result = emoji(symbol, colorDisabled);
        // Result should be only printable ASCII characters
        expect(result).toMatch(/^[\x20-\x7E[\]]+$/);
        // Should not contain the original emoji
        expect(result).not.toBe(symbol);
      }),
      { numRuns: 100 },
    );
  });

  it('emoji passed through unchanged when color enabled', () => {
    fc.assert(
      fc.property(fc.constantFrom(...knownEmoji), (symbol) => {
        const result = emoji(symbol, colorEnabled);
        expect(result).toBe(symbol);
      }),
      { numRuns: 100 },
    );
  });
});

describe('shouldUseColor', () => {
  it('returns false when noColor is true regardless of TTY', () => {
    const config: OutputConfig = { noColor: true, stdoutTTY: true, stderrTTY: true };
    expect(shouldUseColor('stdout', config)).toBe(false);
    expect(shouldUseColor('stderr', config)).toBe(false);
  });

  it('returns false for stdout when stdoutTTY is false', () => {
    const config: OutputConfig = { noColor: false, stdoutTTY: false, stderrTTY: true };
    expect(shouldUseColor('stdout', config)).toBe(false);
    expect(shouldUseColor('stderr', config)).toBe(true);
  });

  it('returns true when color enabled and TTY connected', () => {
    expect(shouldUseColor('stdout', colorEnabled)).toBe(true);
    expect(shouldUseColor('stderr', colorEnabled)).toBe(true);
  });
});

describe('detectOutputConfig', () => {
  it('returns an OutputConfig with boolean fields', () => {
    const config = detectOutputConfig();
    expect(typeof config.noColor).toBe('boolean');
    expect(typeof config.stdoutTTY).toBe('boolean');
    expect(typeof config.stderrTTY).toBe('boolean');
  });
});
