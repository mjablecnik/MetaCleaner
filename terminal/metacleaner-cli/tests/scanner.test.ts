import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from 'metacleaner-app/src/lib/scanner/constants.js';
import { createFileFromPath, scanFiles } from '../src/scanner.js';

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

describe('createFileFromPath (task 3.3)', () => {
  const mockArrayBuffer = new ArrayBuffer(16);

  beforeEach(() => {
    vi.stubGlobal('Bun', {
      file: vi.fn().mockReturnValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
        type: 'application/octet-stream',
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns File with name extracted from path', async () => {
    const file = await createFileFromPath('/tmp/photos/photo.jpg');
    expect(file.name).toBe('photo.jpg');
  });

  it('returns File with image/jpeg MIME type for .jpg extension', async () => {
    const file = await createFileFromPath('/tmp/photo.jpg');
    expect(file.type).toBe('image/jpeg');
  });

  it('returns File with image/png MIME type for .png extension', async () => {
    const file = await createFileFromPath('/tmp/photo.png');
    expect(file.type).toBe('image/png');
  });

  it('returns File with video/mp4 MIME type for .mp4 extension', async () => {
    const file = await createFileFromPath('/tmp/video.mp4');
    expect(file.type).toBe('video/mp4');
  });

  it('returns File with application/octet-stream for unknown extension', async () => {
    const file = await createFileFromPath('/tmp/document.pdf');
    expect(file.type).toBe('application/octet-stream');
  });

  it('returns File with application/octet-stream for no extension', async () => {
    const file = await createFileFromPath('/tmp/noextension');
    expect(file.type).toBe('application/octet-stream');
  });

  it('File arrayBuffer returns data from Bun.file', async () => {
    const file = await createFileFromPath('/tmp/photo.jpg');
    const buf = await file.arrayBuffer();
    expect(buf.byteLength).toBe(mockArrayBuffer.byteLength);
  });

  it('calls Bun.file with the provided file path', async () => {
    await createFileFromPath('/tmp/test.jpg');
    expect(Bun.file).toHaveBeenCalledWith('/tmp/test.jpg');
  });

  it('throws when Bun.file rejects (file not found)', async () => {
    vi.stubGlobal('Bun', {
      file: vi.fn().mockReturnValue({
        arrayBuffer: vi.fn().mockRejectedValue(new Error('ENOENT: no such file or directory')),
      }),
    });
    await expect(createFileFromPath('/tmp/missing.jpg')).rejects.toThrow('ENOENT');
  });
});

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
