// FileReader polyfill for Bun environment — exifr uses FileReader with onloadend to read Blob/File inputs.
// Bun 1.3.14 does not expose FileReader as a global, so we provide a minimal implementation.
// NOTE: exifr uses `reader.onloadend = () => resolve(reader.result)` — onloadend must be supported.
if (typeof FileReader === 'undefined') {
  class FileReaderPolyfill extends EventTarget {
    result: ArrayBuffer | string | null = null;
    error: Error | null = null;
    readyState: 0 | 1 | 2 = 0;

    onload: ((ev: Event) => void) | null = null;
    onloadend: ((ev: Event) => void) | null = null;
    onerror: ((ev: Event) => void) | null = null;

    private dispatchLoadEvents(): void {
      const loadEv = new Event('load');
      Object.defineProperty(loadEv, 'target', { value: this });
      if (this.onload) this.onload(loadEv);
      this.dispatchEvent(loadEv);

      const endEv = new Event('loadend');
      Object.defineProperty(endEv, 'target', { value: this });
      if (this.onloadend) this.onloadend(endEv);
      this.dispatchEvent(endEv);
    }

    private dispatchErrorEvents(): void {
      const errEv = new Event('error');
      Object.defineProperty(errEv, 'target', { value: this });
      if (this.onerror) this.onerror(errEv);
      this.dispatchEvent(errEv);

      const endEv = new Event('loadend');
      Object.defineProperty(endEv, 'target', { value: this });
      if (this.onloadend) this.onloadend(endEv);
      this.dispatchEvent(endEv);
    }

    readAsArrayBuffer(blob: Blob): void {
      this.readyState = 1;
      blob.arrayBuffer().then(
        (buf) => {
          this.result = buf;
          this.readyState = 2;
          this.dispatchLoadEvents();
        },
        (err: Error) => {
          this.error = err;
          this.readyState = 2;
          this.dispatchErrorEvents();
        }
      );
    }

    readAsText(blob: Blob): void {
      this.readyState = 1;
      blob.text().then(
        (text) => {
          this.result = text;
          this.readyState = 2;
          this.dispatchLoadEvents();
        },
        (err: Error) => {
          this.error = err;
          this.readyState = 2;
          this.dispatchErrorEvents();
        }
      );
    }

    abort(): void {}
    readAsDataURL(_blob: Blob): void {}
    readAsBinaryString(_blob: Blob): void {}

    static EMPTY = 0 as const;
    static LOADING = 1 as const;
    static DONE = 2 as const;
  }

  (globalThis as Record<string, unknown>).FileReader = FileReaderPolyfill;
}
