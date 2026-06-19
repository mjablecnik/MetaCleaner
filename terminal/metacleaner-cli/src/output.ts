export interface OutputConfig {
  noColor: boolean;
  stdoutTTY: boolean;
  stderrTTY: boolean;
}

export function detectOutputConfig(): OutputConfig {
  return {
    noColor: 'NO_COLOR' in process.env,
    stdoutTTY: !!process.stdout.isTTY,
    stderrTTY: !!process.stderr.isTTY,
  };
}

export function shouldUseColor(stream: 'stdout' | 'stderr', config: OutputConfig): boolean {
  if (config.noColor) return false;
  return stream === 'stdout' ? config.stdoutTTY : config.stderrTTY;
}

const ESC = '\x1b';

export function red(text: string, config: OutputConfig, stream: 'stdout' | 'stderr' = 'stdout'): string {
  if (!shouldUseColor(stream, config)) return text;
  return `${ESC}[31m${text}${ESC}[0m`;
}

export function yellow(text: string, config: OutputConfig, stream: 'stdout' | 'stderr' = 'stdout'): string {
  if (!shouldUseColor(stream, config)) return text;
  return `${ESC}[33m${text}${ESC}[0m`;
}

export function green(text: string, config: OutputConfig, stream: 'stdout' | 'stderr' = 'stdout'): string {
  if (!shouldUseColor(stream, config)) return text;
  return `${ESC}[32m${text}${ESC}[0m`;
}

export function cyan(text: string, config: OutputConfig, stream: 'stdout' | 'stderr' = 'stdout'): string {
  if (!shouldUseColor(stream, config)) return text;
  return `${ESC}[36m${text}${ESC}[0m`;
}

const EMOJI_REPLACEMENTS: Record<string, string> = {
  '🔴': '[critical]',
  '🟠': '[high]',
  '🟡': '[medium]',
  '🟢': '[low]',
  '❌': '[error]',
  '✅': '[success]',
  '📍': '[GPS]',
  '📱': '[device]',
  '🔍': '[compare]',
  '🤖': '[AI]',
  '🗑️': '[removed]',
  '⚠️': '[warning]',
  '⚠': '[warning]',
  '✔': '[confirmed]',
  '📋': '[metadata]',
  '🕐': '[timestamps]',
  '👤': '[personal]',
};

export function emoji(symbol: string, config: OutputConfig): string {
  if (shouldUseColor('stdout', config)) return symbol;
  return EMOJI_REPLACEMENTS[symbol] ?? symbol;
}
