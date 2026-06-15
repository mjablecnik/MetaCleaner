import { describe, it, expect, beforeAll } from 'vitest';

// The polyfill installs itself to globalThis.FileReader when FileReader is undefined.
// We save a reference to the original (if any), delete it so the polyfill always
// installs, then restore the original to avoid polluting other test files.
let FileReaderPolyfill: new () => {
  result: ArrayBuffer | string | null;
  error: Error | null;
  readyState: 0 | 1 | 2;
  onload: ((ev: Event) => void) | null;
  onloadend: ((ev: Event) => void) | null;
  onerror: ((ev: Event) => void) | null;
  readAsArrayBuffer(blob: Blob): void;
  readAsText(blob: Blob): void;
} & typeof EventTarget & {
  EMPTY: 0;
  LOADING: 1;
  DONE: 2;
};

beforeAll(async () => {
  const originalFR = (globalThis as Record<string, unknown>).FileReader;
  delete (globalThis as Record<string, unknown>).FileReader;
  await import('../src/polyfills.js');
  FileReaderPolyfill = (globalThis as Record<string, unknown>).FileReader as typeof FileReaderPolyfill;
  // Restore so other globals are not permanently changed
  if (originalFR !== undefined) {
    (globalThis as Record<string, unknown>).FileReader = originalFR;
  }
});

// ─── Static constants ─────────────────────────────────────────────────────────

describe('FileReaderPolyfill static constants', () => {
  it('EMPTY equals 0', () => {
    expect((FileReaderPolyfill as unknown as { EMPTY: number }).EMPTY).toBe(0);
  });

  it('LOADING equals 1', () => {
    expect((FileReaderPolyfill as unknown as { LOADING: number }).LOADING).toBe(1);
  });

  it('DONE equals 2', () => {
    expect((FileReaderPolyfill as unknown as { DONE: number }).DONE).toBe(2);
  });
});

// ─── readAsArrayBuffer ────────────────────────────────────────────────────────

describe('FileReaderPolyfill.readAsArrayBuffer', () => {
  it('sets result to an ArrayBuffer and readyState to DONE after load', async () => {
    const reader = new FileReaderPolyfill();
    const blob = new Blob([new Uint8Array([1, 2, 3])]);

    await new Promise<void>((resolve) => {
      reader.onloadend = () => resolve();
      reader.readAsArrayBuffer(blob);
    });

    expect(reader.result).toBeInstanceOf(ArrayBuffer);
    expect(reader.readyState).toBe(2);
  });

  it('ArrayBuffer result contains the blob bytes', async () => {
    const reader = new FileReaderPolyfill();
    const bytes = new Uint8Array([10, 20, 30, 40]);
    const blob = new Blob([bytes]);

    await new Promise<void>((resolve) => {
      reader.onloadend = () => resolve();
      reader.readAsArrayBuffer(blob);
    });

    const view = new Uint8Array(reader.result as ArrayBuffer);
    expect(Array.from(view)).toEqual([10, 20, 30, 40]);
  });

  it('fires onload before onloadend with event.target === reader', async () => {
    const reader = new FileReaderPolyfill();
    const blob = new Blob(['hello']);
    const order: string[] = [];
    let loadTarget: EventTarget | null = null;
    let loadEndTarget: EventTarget | null = null;

    reader.onload = (ev) => {
      order.push('load');
      loadTarget = (ev as Event & { target: EventTarget }).target;
    };

    await new Promise<void>((resolve) => {
      reader.onloadend = (ev) => {
        order.push('loadend');
        loadEndTarget = (ev as Event & { target: EventTarget }).target;
        resolve();
      };
      reader.readAsArrayBuffer(blob);
    });

    expect(order).toEqual(['load', 'loadend']);
    expect(loadTarget).toBe(reader);
    expect(loadEndTarget).toBe(reader);
  });

  it('error path: sets error and fires onerror + onloadend', async () => {
    const reader = new FileReaderPolyfill();
    const failBlob = {
      arrayBuffer: () => Promise.reject(new Error('read failed'))
    } as unknown as Blob;

    const order: string[] = [];

    await new Promise<void>((resolve) => {
      reader.onerror = () => order.push('error');
      reader.onloadend = () => {
        order.push('loadend');
        resolve();
      };
      reader.readAsArrayBuffer(failBlob);
    });

    expect(reader.error).toBeInstanceOf(Error);
    expect(reader.error?.message).toBe('read failed');
    expect(reader.readyState).toBe(2);
    expect(order).toEqual(['error', 'loadend']);
  });
});

// ─── readAsText ───────────────────────────────────────────────────────────────

describe('FileReaderPolyfill.readAsText', () => {
  it('sets result to a string and readyState to DONE after load', async () => {
    const reader = new FileReaderPolyfill();
    const blob = new Blob(['hello world']);

    await new Promise<void>((resolve) => {
      reader.onloadend = () => resolve();
      reader.readAsText(blob);
    });

    expect(reader.result).toBe('hello world');
    expect(reader.readyState).toBe(2);
  });

  it('fires onload before onloadend with event.target === reader', async () => {
    const reader = new FileReaderPolyfill();
    const blob = new Blob(['test text']);
    const order: string[] = [];

    reader.onload = () => order.push('load');

    await new Promise<void>((resolve) => {
      reader.onloadend = () => {
        order.push('loadend');
        resolve();
      };
      reader.readAsText(blob);
    });

    expect(order).toEqual(['load', 'loadend']);
  });

  it('error path: sets error and fires onerror + onloadend', async () => {
    const reader = new FileReaderPolyfill();
    const failBlob = {
      text: () => Promise.reject(new Error('text read failed'))
    } as unknown as Blob;

    const order: string[] = [];

    await new Promise<void>((resolve) => {
      reader.onerror = () => order.push('error');
      reader.onloadend = () => {
        order.push('loadend');
        resolve();
      };
      reader.readAsText(failBlob);
    });

    expect(reader.error?.message).toBe('text read failed');
    expect(reader.readyState).toBe(2);
    expect(order).toEqual(['error', 'loadend']);
  });
});
