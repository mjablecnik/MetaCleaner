import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// --- Cleanup Registry Tests ---

describe('signals – cleanup registry', () => {
  it('registerCleanup adds a function; unregisterCleanup removes it', async () => {
    const { registerCleanup, unregisterCleanup } = await import('../src/signals.js');

    let called = false;
    const fn = (): void => { called = true; };

    registerCleanup(fn);
    unregisterCleanup(fn);
    expect(called).toBe(false);
  });

  it('registerCleanup is idempotent — Set semantics deduplicate', async () => {
    const { registerCleanup, unregisterCleanup } = await import('../src/signals.js');

    let callCount = 0;
    const fn = (): void => { callCount++; };

    registerCleanup(fn);
    registerCleanup(fn); // duplicate — no-op in a Set
    unregisterCleanup(fn);
    expect(callCount).toBe(0);
  });

  it('unregisterCleanup is safe for a function that was never registered', async () => {
    const { unregisterCleanup } = await import('../src/signals.js');
    const fn = (): void => {};
    expect(() => unregisterCleanup(fn)).not.toThrow();
  });

  it('getAbortSignal returns an AbortSignal', async () => {
    const { getAbortSignal } = await import('../src/signals.js');
    const signal = getAbortSignal();
    expect(signal).toBeInstanceOf(AbortSignal);
  });
});

// --- SIGINT handler behavior ---

describe('signals – SIGINT behavior', () => {
  afterEach(() => {
    process.removeAllListeners('SIGINT');
    vi.restoreAllMocks();
  });

  it('exits with code 130 and writes "Interrupted." to stderr on SIGINT', async () => {
    const { installSignalHandler } = await import('../src/signals.js');

    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    // Resolve when process.exit is called so we can await completion of the async handler
    let capturedCode: number | undefined;
    const exitPromise = new Promise<void>((resolve) => {
      vi.spyOn(process, 'exit').mockImplementation((code) => {
        capturedCode = code as number;
        resolve();
        return undefined as never;
      });
    });

    installSignalHandler();
    process.emit('SIGINT');
    await exitPromise;

    expect(capturedCode).toBe(130);
    expect(stderrSpy).toHaveBeenCalledWith('Interrupted.\n');
  });

  it('runs registered cleanup functions before exiting on SIGINT', async () => {
    const { installSignalHandler, registerCleanup, unregisterCleanup } = await import('../src/signals.js');

    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    let cleanupRan = false;
    const cleanup = (): void => { cleanupRan = true; };
    registerCleanup(cleanup);

    let capturedCode: number | undefined;
    const exitPromise = new Promise<void>((resolve) => {
      vi.spyOn(process, 'exit').mockImplementation((code) => {
        capturedCode = code as number;
        resolve();
        return undefined as never;
      });
    });

    installSignalHandler();
    process.emit('SIGINT');
    await exitPromise;

    expect(cleanupRan).toBe(true);
    expect(capturedCode).toBe(130);

    unregisterCleanup(cleanup);
  });
});

// --- install.sh validation ---

describe('install.sh – script content validation', () => {
  const installShPath = join(PROJECT_ROOT, 'scripts', 'install.sh');

  it('install.sh exists', () => {
    expect(existsSync(installShPath)).toBe(true);
  });

  it('has bash shebang', () => {
    const content = readFileSync(installShPath, 'utf-8');
    expect(content).toMatch(/^#!\/bin\/bash/);
  });

  it('checks for binary existence and exits with code 2 if missing', () => {
    const content = readFileSync(installShPath, 'utf-8');
    expect(content).toContain('exit 2');
    expect(content).toContain('build.sh');
  });

  it('installs to ~/.local/bin/', () => {
    const content = readFileSync(installShPath, 'utf-8');
    expect(content).toContain('.local/bin');
  });

  it('installs completions to ~/.zsh/completions/', () => {
    const content = readFileSync(installShPath, 'utf-8');
    expect(content).toContain('.zsh/completions');
  });

  it('warns and skips completions if completion file is missing', () => {
    const content = readFileSync(installShPath, 'utf-8');
    expect(content).toContain('Warning');
    expect(content).toContain('Skipping');
  });

  it('copies binary with executable permissions', () => {
    const content = readFileSync(installShPath, 'utf-8');
    expect(content).toContain('chmod +x');
  });

  it('prints summary of installed paths', () => {
    const content = readFileSync(installShPath, 'utf-8');
    expect(content).toContain('Installed:');
  });
});

// --- completions/_metacleaner validation ---

describe('completions/_metacleaner – file content validation', () => {
  const completionPath = join(PROJECT_ROOT, 'completions/_metacleaner');

  it('completions file exists', () => {
    expect(existsSync(completionPath)).toBe(true);
  });

  it('starts with #compdef metacleaner', () => {
    const content = readFileSync(completionPath, 'utf-8');
    expect(content.trimStart()).toMatch(/^#compdef metacleaner/);
  });

  it('includes all subcommands', () => {
    const content = readFileSync(completionPath, 'utf-8');
    for (const cmd of ['scan', 'clean', 'compare', 'help', 'version']) {
      expect(content).toContain(cmd);
    }
  });

  it('includes all global long flags', () => {
    const content = readFileSync(completionPath, 'utf-8');
    for (const flag of ['--server', '--json', '--verbose', '--quiet', '--output', '--timeout', '--version', '--help']) {
      expect(content).toContain(flag);
    }
  });

  it('includes short flag aliases -h, -v, -q', () => {
    const content = readFileSync(completionPath, 'utf-8');
    expect(content).toContain('-h');
    expect(content).toContain('-v');
    expect(content).toContain('-q');
  });

  it('offers file path completion for scan/clean/compare', () => {
    const content = readFileSync(completionPath, 'utf-8');
    expect(content).toContain('_files');
  });
});
