import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from 'metacleaner-app/src/lib/scanner/constants.js';
import { scanFiles } from '../src/scanner.js';

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  statSync: vi.fn().mockReturnValue({ size: 1024 }),
}));

vi.mock('metacleaner-app/src/lib/scanner/metadataParser.js', () => ({
  parseFile: vi.fn().mockResolvedValue({
    fileId: 'mock-id',
    status: 'done',
    fields: [],
    hasGps: false,
    fieldCount: 0,
    categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 },
    fileScore: 0,
  }),
}));

describe('extension detection correctness (Property 11)', () => {
  beforeEach(() => {
    vi.stubGlobal('Bun', {
      file: vi.fn().mockReturnValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        type: 'application/octet-stream',
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('correctly identifies format for all IMAGE_EXTENSIONS', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(IMAGE_EXTENSIONS)),
        async (ext) => {
          const results = await scanFiles([`/tmp/test${ext}`]);
          expect(results).toHaveLength(1);
          expect(results[0].format).toBe(IMAGE_EXTENSIONS[ext]);
          expect(results[0].error).toBeUndefined();
        }
      )
    );
  });

  it('correctly identifies format for all VIDEO_EXTENSIONS', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(VIDEO_EXTENSIONS)),
        async (ext) => {
          const results = await scanFiles([`/tmp/test${ext}`]);
          expect(results).toHaveLength(1);
          expect(results[0].format).toBe(VIDEO_EXTENSIONS[ext]);
          expect(results[0].error).toBeUndefined();
        }
      )
    );
  });

  it('returns unsupported format error for unknown extension', async () => {
    const results = await scanFiles(['/tmp/test.pdf']);
    expect(results).toHaveLength(1);
    expect(results[0].format).toBe('');
    expect(results[0].error).toContain('Unsupported');
  });

  it('returns file-not-found error when existsSync returns false', async () => {
    const { existsSync } = await import('fs');
    vi.mocked(existsSync).mockReturnValueOnce(false);
    const results = await scanFiles(['/tmp/missing.jpg']);
    expect(results).toHaveLength(1);
    expect(results[0].error).toContain('File not found');
  });
});
