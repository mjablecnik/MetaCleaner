import type { FormatOptions } from './formatter.js';
import type { OutputConfig } from './output.js';

export interface ProgressIndicator {
  start(message: string): void;
  update(message: string): void;
  stop(): void;
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function createActiveProgressIndicator(): ProgressIndicator {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let frameIndex = 0;
  let currentMessage = '';
  let startTime = Date.now();
  let lastLineLength = 0;

  function render() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const frame = SPINNER_FRAMES[frameIndex % SPINNER_FRAMES.length];
    frameIndex++;
    const line = `${frame} ${currentMessage} (${elapsed}s)`;
    const padding = ' '.repeat(Math.max(0, lastLineLength - line.length));
    process.stderr.write(`\r${line}${padding}`);
    lastLineLength = line.length;
  }

  function clearLine() {
    const padding = ' '.repeat(lastLineLength);
    process.stderr.write(`\r${padding}\r`);
    lastLineLength = 0;
  }

  return {
    start(message: string) {
      currentMessage = message;
      startTime = Date.now();
      frameIndex = 0;
      lastLineLength = 0;
      render();
      intervalId = setInterval(render, 80);
    },

    update(message: string) {
      currentMessage = message;
    },

    stop() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      clearLine();
    },
  };
}

const noopIndicator: ProgressIndicator = {
  start(_message: string) {},
  update(_message: string) {},
  stop() {},
};

export function createProgressIndicator(options: Pick<FormatOptions, 'quiet' | 'json' | 'outputConfig'>): ProgressIndicator {
  if (options.quiet || options.json) {
    return noopIndicator;
  }
  if (options.outputConfig !== undefined && !options.outputConfig.stderrTTY) {
    return noopIndicator;
  }
  return createActiveProgressIndicator();
}
