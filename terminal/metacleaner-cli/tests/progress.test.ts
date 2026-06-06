import { describe, it, expect, vi } from 'vitest';
import { createProgressIndicator } from '../src/progress.js';

describe('createProgressIndicator', () => {
  it('returns noop when quiet=true', () => {
    const indicator = createProgressIndicator({ quiet: true, json: false });
    // Noop indicator should not throw and should be callable
    expect(() => indicator.start('test')).not.toThrow();
    expect(() => indicator.update('test')).not.toThrow();
    expect(() => indicator.stop()).not.toThrow();
  });

  it('returns noop when json=true', () => {
    const indicator = createProgressIndicator({ quiet: false, json: true });
    expect(() => indicator.start('test')).not.toThrow();
    expect(() => indicator.update('test')).not.toThrow();
    expect(() => indicator.stop()).not.toThrow();
  });

  it('noop does not write to stderr when quiet=true', () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const indicator = createProgressIndicator({ quiet: true, json: false });
    indicator.start('Starting');
    indicator.update('Updating');
    indicator.stop();
    expect(stderrSpy).not.toHaveBeenCalled();
    stderrSpy.mockRestore();
  });

  it('noop does not write to stderr when json=true', () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const indicator = createProgressIndicator({ quiet: false, json: true });
    indicator.start('Starting');
    indicator.stop();
    expect(stderrSpy).not.toHaveBeenCalled();
    stderrSpy.mockRestore();
  });

  it('active indicator has start, update, stop methods', () => {
    const indicator = createProgressIndicator({ quiet: false, json: false });
    expect(typeof indicator.start).toBe('function');
    expect(typeof indicator.update).toBe('function');
    expect(typeof indicator.stop).toBe('function');
    // Clean up — stop immediately to avoid lingering interval
    indicator.stop();
  });

  it('active indicator writes to stderr (not stdout) on start', () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const indicator = createProgressIndicator({ quiet: false, json: false });
    indicator.start('Working');
    indicator.stop();
    expect(stderrSpy).toHaveBeenCalled();
    expect(stdoutSpy).not.toHaveBeenCalled();
    stderrSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it('stop() clears the spinner output by writing a blank line to stderr', () => {
    const writes: string[] = [];
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });
    const indicator = createProgressIndicator({ quiet: false, json: false });
    indicator.start('Working');
    writes.length = 0; // reset after start writes
    indicator.stop();
    // stop() should write a clear sequence (spaces + carriage returns) to erase the line
    expect(stderrSpy).toHaveBeenCalled();
    const clearOutput = writes.join('');
    expect(clearOutput).toMatch(/\r/); // must use carriage return to overwrite in-place
    stderrSpy.mockRestore();
  });
});
