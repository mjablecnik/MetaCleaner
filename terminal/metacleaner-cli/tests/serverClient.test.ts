import { describe, it, expect, vi, afterEach } from 'vitest';
import { writeFile } from 'fs/promises';
import {
  checkHealth,
  uploadFiles,
  createJob,
  waitForJob,
  downloadFile,
  TimeoutError,
  ServerError,
} from '../src/serverClient.js';
import type { ProgressIndicator } from '../src/progress.js';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

const SERVER = 'http://localhost:8080';

function makeMockProgress(): ProgressIndicator {
  return { start: vi.fn(), update: vi.fn(), stop: vi.fn() };
}

function makeJobStatus(status: 'processing' | 'completed' | 'failed', overrides = {}) {
  return {
    jobId: 'job-1',
    status,
    totalFiles: 1,
    filesCompleted: status === 'completed' ? 1 : 0,
    fieldsRemoved: 0,
    gpsLocationsRemoved: 0,
    totalTimeSeconds: 1,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('checkHealth', () => {
  it('returns true when server responds ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    expect(await checkHealth(SERVER)).toBe(true);
    expect(fetch).toHaveBeenCalledWith(`${SERVER}/api/health`);
  });

  it('returns false when server responds with non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    expect(await checkHealth(SERVER)).toBe(false);
  });

  it('returns false when fetch throws (connection refused)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    expect(await checkHealth(SERVER)).toBe(false);
  });
});

describe('uploadFiles', () => {
  it('sends multipart POST and returns uploaded files', async () => {
    const uploaded = [{ id: 'f-1', name: 'photo.jpg', size: 8, extension: '.jpg', type: 'image', format: 'jpeg' }];
    vi.stubGlobal('Bun', {
      file: vi.fn().mockReturnValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        type: 'image/jpeg',
      }),
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ files: uploaded }),
    }));

    const result = await uploadFiles(SERVER, ['/tmp/photo.jpg']);

    expect(result).toEqual(uploaded);
    expect(fetch).toHaveBeenCalledWith(`${SERVER}/api/upload`, expect.objectContaining({
      method: 'POST',
    }));
    const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(callArgs.body).toBeInstanceOf(FormData);
  });

  it('throws ServerError on non-2xx response', async () => {
    vi.stubGlobal('Bun', {
      file: vi.fn().mockReturnValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
        type: 'image/jpeg',
      }),
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 413,
      json: async () => ({ message: 'File too large' }),
    }));

    await expect(uploadFiles(SERVER, ['/tmp/big.jpg'])).rejects.toThrow(ServerError);
  });
});

describe('createJob', () => {
  it('sends POST with fileIds and returns JobResponse', async () => {
    const jobResponse = { jobId: 'job-42', status: 'pending', totalFiles: 2, createdAt: '2024-01-01T00:00:00Z' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => jobResponse,
    }));

    const result = await createJob(SERVER, ['f-1', 'f-2']);

    expect(result).toEqual(jobResponse);
    expect(fetch).toHaveBeenCalledWith(`${SERVER}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileIds: ['f-1', 'f-2'] }),
    });
  });

  it('throws ServerError on server error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    }));

    await expect(createJob(SERVER, ['f-1'])).rejects.toThrow(ServerError);
  });

  it('ServerError includes the HTTP status code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    }));

    const err = await createJob(SERVER, ['f-x']).catch(e => e);
    expect(err).toBeInstanceOf(ServerError);
    expect((err as ServerError).status).toBe(404);
  });
});

describe('waitForJob', () => {
  it('returns completed status after polling through processing state', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeJobStatus('processing'),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeJobStatus('completed', { fieldsRemoved: 5, gpsLocationsRemoved: 1 }),
      }),
    );
    const progress = makeMockProgress();

    const promise = waitForJob(SERVER, 'job-1', 60, progress);
    await vi.advanceTimersByTimeAsync(1000); // first poll fires
    await vi.advanceTimersByTimeAsync(1500); // second poll fires (pollInterval scaled to 1500)

    const result = await promise;
    expect(result.status).toBe('completed');
    expect(result.fieldsRemoved).toBe(5);
    expect(progress.start).toHaveBeenCalled();
    expect(progress.stop).toHaveBeenCalled();
  });

  it('throws TimeoutError when elapsed time exceeds timeout', async () => {
    vi.useFakeTimers();
    // No fetch mock needed — timeout fires before first poll
    const progress = makeMockProgress();

    const promise = waitForJob(SERVER, 'job-1', 1, progress);
    // Attach rejection handler before advancing timers to avoid unhandled rejection
    const rejectPromise = expect(promise).rejects.toThrow(TimeoutError);
    await vi.advanceTimersByTimeAsync(1000); // elapsed = 1s >= timeout of 1s
    await rejectPromise;
    expect(progress.stop).toHaveBeenCalled();
  });

  it('TimeoutError includes elapsed and configured timeout seconds', async () => {
    vi.useFakeTimers();
    const progress = makeMockProgress();

    const promise = waitForJob(SERVER, 'job-1', 1, progress);
    // Attach catch handler before advancing timers to avoid unhandled rejection
    const caught = promise.catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(1000);

    const err = await caught;
    expect(err).toBeInstanceOf(TimeoutError);
    expect((err as TimeoutError).elapsedSeconds).toBeGreaterThanOrEqual(1);
    expect((err as TimeoutError).timeoutSeconds).toBe(1);
    expect((err as TimeoutError).message).toContain('1s');
  });

  it('calls progress.update on each poll', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeJobStatus('completed'),
    }));
    const progress = makeMockProgress();

    const promise = waitForJob(SERVER, 'job-1', 60, progress);
    await vi.advanceTimersByTimeAsync(1000);

    await promise;
    expect(progress.update).toHaveBeenCalled();
  });

  it('throws ServerError when job status endpoint returns non-2xx', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal error' }),
    }));
    const progress = makeMockProgress();

    const promise = waitForJob(SERVER, 'job-1', 60, progress);
    // Attach rejection handler before advancing timers to avoid unhandled rejection
    const rejectPromise = expect(promise).rejects.toThrow(ServerError);
    await vi.advanceTimersByTimeAsync(1000);
    await rejectPromise;
  });
});

describe('downloadFile', () => {
  it('downloads file and writes it to the output path', async () => {
    const buffer = new ArrayBuffer(16);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => buffer,
    }));

    await downloadFile(SERVER, 'f-1', '/tmp/output.jpg');

    expect(fetch).toHaveBeenCalledWith(`${SERVER}/api/files/f-1/download`);
    expect(writeFile).toHaveBeenCalledWith('/tmp/output.jpg', expect.any(Buffer));
  });

  it('throws ServerError when download returns non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'File not found' }),
    }));

    await expect(downloadFile(SERVER, 'f-missing', '/tmp/out.jpg')).rejects.toThrow(ServerError);
  });
});
