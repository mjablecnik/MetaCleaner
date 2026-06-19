export type CleanupFn = () => void | Promise<void>;

const cleanupRegistry: Set<CleanupFn> = new Set();
let abortController = new AbortController();

export function registerCleanup(fn: CleanupFn): void {
  cleanupRegistry.add(fn);
}

export function unregisterCleanup(fn: CleanupFn): void {
  cleanupRegistry.delete(fn);
}

export function getAbortSignal(): AbortSignal {
  return abortController.signal;
}

export function installSignalHandler(): void {
  process.on('SIGINT', async () => {
    abortController.abort();
    for (const fn of [...cleanupRegistry]) {
      try {
        await fn();
      } catch {
        // ignore cleanup errors during signal handling
      }
    }
    process.stderr.write('Interrupted.\n');
    process.exit(130);
  });
}
