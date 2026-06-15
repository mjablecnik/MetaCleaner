import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeCommand } from '../src/commands.js';
import { TimeoutError } from '../src/serverClient.js';
import { scanFiles } from '../src/scanner.js';
import {
  checkHealth,
  uploadFiles,
  createJob,
  waitForJob,
  downloadFile,
} from '../src/serverClient.js';
import type { CLIOptions, FileResult, ScanResult } from '../src/types.js';

vi.mock('../src/scanner.js', () => ({
  scanFiles: vi.fn(),
}));

vi.mock('../src/serverClient.js', async (importActual) => {
  const actual = await importActual<typeof import('../src/serverClient.js')>();
  return {
    ...actual,
    checkHealth: vi.fn(),
    uploadFiles: vi.fn(),
    createJob: vi.fn(),
    waitForJob: vi.fn(),
    downloadFile: vi.fn(),
  };
});

vi.mock('../src/progress.js', () => ({
  createProgressIndicator: vi.fn(() => ({
    start: vi.fn(),
    update: vi.fn(),
    stop: vi.fn(),
  })),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  statSync: vi.fn().mockReturnValue({ size: 1024, isDirectory: () => false }),
  readFileSync: vi.fn().mockReturnValue(JSON.stringify({ version: '0.1.0' })),
}));

vi.mock('fs/promises', () => ({
  rm: vi.fn().mockResolvedValue(undefined),
}));

function makeOptions(overrides: Partial<CLIOptions> = {}): CLIOptions {
  return {
    command: 'scan',
    files: [],
    server: 'http://localhost:8080',
    json: false,
    verbose: false,
    quiet: false,
    timeout: 60,
    ...overrides,
  };
}

function makeScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    fileId: 'file-1',
    status: 'done',
    fields: [],
    hasGps: false,
    fieldCount: 0,
    categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 },
    fileScore: 0,
    ...overrides,
  };
}

function makeFileResult(overrides: Partial<FileResult> = {}): FileResult {
  return {
    filePath: '/tmp/photo.jpg',
    fileName: 'photo.jpg',
    fileSize: 1024,
    format: 'jpeg',
    ...overrides,
  };
}

function makeJobStatus(
  status: 'processing' | 'completed' | 'failed',
  overrides: Record<string, unknown> = {},
) {
  return {
    jobId: 'job-1',
    status,
    totalFiles: 1,
    filesCompleted: status === 'completed' ? 1 : 0,
    fieldsRemoved: 3,
    gpsLocationsRemoved: 1,
    totalTimeSeconds: 1,
    ...overrides,
  };
}

const UPLOADED_FILE = {
  id: 'f-1',
  name: 'photo.jpg',
  size: 1024,
  extension: '.jpg',
  type: 'image',
  format: 'jpeg',
};

const JOB_RESPONSE = {
  jobId: 'job-1',
  status: 'pending',
  totalFiles: 1,
  createdAt: '2024-01-01T00:00:00Z',
};

describe('version command', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it('prints version from package.json and returns exit code 0', async () => {
    const result = await executeCommand(makeOptions({ command: 'version' }));
    expect(result.exitCode).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('0.1.0'));
  });
});

describe('help command', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it('prints usage for all commands and returns exit code 0', async () => {
    const result = await executeCommand(makeOptions({ command: 'help' }));
    expect(result.exitCode).toBe(0);
    const output = (stdoutSpy.mock.calls[0][0] as string);
    expect(output).toContain('scan');
    expect(output).toContain('clean');
    expect(output).toContain('compare');
    expect(output).toContain('--version');
  });
});

describe('unknown command', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it('displays help and returns exit code 2', async () => {
    const result = await executeCommand(
      makeOptions({ command: 'unknown' as CLIOptions['command'] }),
    );
    expect(result.exitCode).toBe(2);
    expect(stdoutSpy).toHaveBeenCalled();
  });
});

describe('scan command', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    vi.mocked(scanFiles).mockReset();
  });

  it('returns exit code 2 and error to stderr when no files provided', async () => {
    const result = await executeCommand(makeOptions({ command: 'scan', files: [] }));
    expect(result.exitCode).toBe(2);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('No files specified'));
  });

  it('returns exit code 0 for files with low risk score', async () => {
    vi.mocked(scanFiles).mockResolvedValue([
      makeFileResult({ scanResult: makeScanResult({ fileScore: 10 }) }),
    ]);

    const result = await executeCommand(
      makeOptions({ command: 'scan', files: ['/tmp/photo.jpg'] }),
    );
    expect(result.exitCode).toBe(0);
    expect(stdoutSpy).toHaveBeenCalled();
  });

  it('returns exit code 1 when a file has high risk score (>=50)', async () => {
    vi.mocked(scanFiles).mockResolvedValue([
      makeFileResult({ scanResult: makeScanResult({ fileScore: 75 }) }),
    ]);

    const result = await executeCommand(
      makeOptions({ command: 'scan', files: ['/tmp/photo.jpg'] }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('returns exit code 2 when a file has an error', async () => {
    vi.mocked(scanFiles).mockResolvedValue([
      makeFileResult({ error: 'File not found' }),
    ]);

    const result = await executeCommand(
      makeOptions({ command: 'scan', files: ['/tmp/missing.jpg'] }),
    );
    expect(result.exitCode).toBe(2);
  });

  it('processes mixed batch and returns exit code based on worst result', async () => {
    vi.mocked(scanFiles).mockResolvedValue([
      makeFileResult({
        filePath: '/tmp/a.jpg',
        fileName: 'a.jpg',
        scanResult: makeScanResult({ fileScore: 10 }),
      }),
      makeFileResult({
        filePath: '/tmp/b.jpg',
        fileName: 'b.jpg',
        error: 'Unsupported format',
      }),
    ]);

    const result = await executeCommand(
      makeOptions({ command: 'scan', files: ['/tmp/a.jpg', '/tmp/b.jpg'] }),
    );
    expect(result.exitCode).toBe(2);
    expect(result.results).toHaveLength(2);
  });

  it('outputs valid JSON when --json flag is set', async () => {
    vi.mocked(scanFiles).mockResolvedValue([
      makeFileResult({ scanResult: makeScanResult() }),
    ]);

    await executeCommand(
      makeOptions({ command: 'scan', files: ['/tmp/photo.jpg'], json: true }),
    );
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(() => JSON.parse(output)).not.toThrow();
  });
});

describe('clean command', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    vi.mocked(checkHealth).mockReset();
    vi.mocked(uploadFiles).mockReset();
    vi.mocked(createJob).mockReset();
    vi.mocked(waitForJob).mockReset();
    vi.mocked(downloadFile).mockReset();
  });

  it('returns exit code 2 and error to stderr when no files provided', async () => {
    const result = await executeCommand(makeOptions({ command: 'clean', files: [] }));
    expect(result.exitCode).toBe(2);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('No files specified'));
  });

  it('returns exit code 2 and connection error when server is unreachable', async () => {
    vi.mocked(checkHealth).mockResolvedValue(false);

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/photo.jpg'] }),
    );
    expect(result.exitCode).toBe(2);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Cannot connect to server'));
  });

  it('downloads cleaned file and returns exit code 0 on success', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);
    vi.mocked(uploadFiles).mockResolvedValue([UPLOADED_FILE]);
    vi.mocked(createJob).mockResolvedValue(JOB_RESPONSE);
    vi.mocked(waitForJob).mockResolvedValue(makeJobStatus('completed'));
    vi.mocked(downloadFile).mockResolvedValue(undefined);

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/photo.jpg'] }),
    );
    expect(result.exitCode).toBe(0);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].cleanResult).toBeDefined();
    expect(result.results[0].cleanResult?.gpsStripped).toBe(true);
    expect(result.results[0].cleanResult?.fieldsRemoved).toBe(3);
  });

  it('returns exit code 2 and timeout message when job exceeds timeout', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);
    vi.mocked(uploadFiles).mockResolvedValue([UPLOADED_FILE]);
    vi.mocked(createJob).mockResolvedValue(JOB_RESPONSE);
    vi.mocked(waitForJob).mockRejectedValue(new TimeoutError(60, 60));

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/photo.jpg'], timeout: 60 }),
    );
    expect(result.exitCode).toBe(2);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Timeout'));
  });

  it('records per-file error and continues when server returns an error for one file', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);
    vi.mocked(uploadFiles).mockRejectedValue(new Error('Upload failed'));

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/photo.jpg'] }),
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0].error).toBeDefined();
  });

  it('rejects file with unsupported extension and includes extension in error message', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/document.txt'] }),
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0].error).toContain('Unsupported file format');
    expect(result.results[0].error).toContain('.txt');
    expect(uploadFiles).not.toHaveBeenCalled();
  });

  it('rejects .pdf file with unsupported format error', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/report.pdf'] }),
    );
    expect(result.results[0].error).toContain('.pdf');
    expect(uploadFiles).not.toHaveBeenCalled();
  });

  it('rejects file with no extension and shows (no extension) in error message', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/photo'] }),
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0].error).toContain('(no extension)');
    expect(uploadFiles).not.toHaveBeenCalled();
  });

  it('returns exit code 2 when all files are unsupported', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/a.txt', '/tmp/b.pdf'] }),
    );
    expect(result.exitCode).toBe(2);
    expect(result.results).toHaveLength(2);
    expect(result.results.every((r) => !!r.error)).toBe(true);
    expect(uploadFiles).not.toHaveBeenCalled();
  });

  it('continues processing valid files after rejecting unsupported format files', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);
    vi.mocked(uploadFiles).mockResolvedValue([UPLOADED_FILE]);
    vi.mocked(createJob).mockResolvedValue(JOB_RESPONSE);
    vi.mocked(waitForJob).mockResolvedValue(makeJobStatus('completed'));
    vi.mocked(downloadFile).mockResolvedValue(undefined);

    const result = await executeCommand(
      makeOptions({ command: 'clean', files: ['/tmp/document.txt', '/tmp/photo.jpg'] }),
    );
    expect(result.results).toHaveLength(2);
    expect(result.results[0].error).toContain('Unsupported file format');
    expect(result.results[1].cleanResult).toBeDefined();
    expect(uploadFiles).toHaveBeenCalledOnce();
  });
});

describe('compare command', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    vi.mocked(scanFiles).mockReset();
    vi.mocked(checkHealth).mockReset();
    vi.mocked(uploadFiles).mockReset();
    vi.mocked(createJob).mockReset();
    vi.mocked(waitForJob).mockReset();
    vi.mocked(downloadFile).mockReset();
  });

  it('returns exit code 2 and error to stderr when no files provided', async () => {
    const result = await executeCommand(makeOptions({ command: 'compare', files: [] }));
    expect(result.exitCode).toBe(2);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('No files specified'));
  });

  it('gracefully degrades to scan-only results when server is unreachable', async () => {
    vi.mocked(checkHealth).mockResolvedValue(false);
    vi.mocked(scanFiles).mockResolvedValue([
      makeFileResult({ scanResult: makeScanResult({ fileScore: 20 }) }),
    ]);

    const result = await executeCommand(
      makeOptions({ command: 'compare', files: ['/tmp/photo.jpg'] }),
    );
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('unreachable'));
    expect(result.results).toHaveLength(1);
    expect(result.results[0].compareResult).toBeUndefined();
  });

  it('returns before/after comparison data when server is reachable', async () => {
    const beforeResult = makeFileResult({
      scanResult: makeScanResult({ fileScore: 30, hasGps: true, fieldCount: 5 }),
    });
    const afterResult = makeFileResult({
      scanResult: makeScanResult({ fileScore: 0, hasGps: false, fieldCount: 1 }),
    });

    vi.mocked(checkHealth).mockResolvedValue(true);
    vi.mocked(scanFiles)
      .mockResolvedValueOnce([beforeResult])
      .mockResolvedValueOnce([afterResult]);
    vi.mocked(uploadFiles).mockResolvedValue([UPLOADED_FILE]);
    vi.mocked(createJob).mockResolvedValue(JOB_RESPONSE);
    vi.mocked(waitForJob).mockResolvedValue(makeJobStatus('completed'));
    vi.mocked(downloadFile).mockResolvedValue(undefined);

    const result = await executeCommand(
      makeOptions({ command: 'compare', files: ['/tmp/photo.jpg'] }),
    );
    expect(result.results).toHaveLength(1);
    const compareResult = result.results[0].compareResult;
    expect(compareResult).toBeDefined();
    expect(compareResult?.scoreBefore).toBe(30);
    expect(compareResult?.scoreAfter).toBe(0);
    expect(compareResult?.gpsRemovedInCleaning).toBe(true);
    expect(compareResult?.fieldsRemovedCount).toBe(4);
  });

  it('returns exit code 2 and timeout message when job exceeds timeout', async () => {
    vi.mocked(checkHealth).mockResolvedValue(true);
    vi.mocked(scanFiles).mockResolvedValue([
      makeFileResult({ scanResult: makeScanResult({ fileScore: 30 }) }),
    ]);
    vi.mocked(uploadFiles).mockResolvedValue([UPLOADED_FILE]);
    vi.mocked(createJob).mockResolvedValue(JOB_RESPONSE);
    vi.mocked(waitForJob).mockRejectedValue(new TimeoutError(60, 60));

    const result = await executeCommand(
      makeOptions({ command: 'compare', files: ['/tmp/photo.jpg'], timeout: 60 }),
    );
    expect(result.exitCode).toBe(2);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Timeout'));
  });
});
