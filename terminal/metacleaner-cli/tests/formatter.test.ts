import { describe, it, expect } from 'vitest';
import {
  computeAggregatedSummary,
  determineExitCode,
  getDefaultOutputPath,
  formatScanResult,
  formatCleanResult,
  formatCompareResult,
  formatSummary,
} from '../src/formatter.js';
import type { FileResult } from '../src/types.js';
import type { ScanResult } from 'metacleaner-app/src/lib/scanner/types.js';

function makeScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    fileId: 'test-id',
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
    filePath: '/tmp/test.jpg',
    fileName: 'test.jpg',
    fileSize: 1024,
    format: 'jpeg',
    ...overrides,
  };
}

describe('computeAggregatedSummary', () => {
  it('returns zero counts for empty array', () => {
    const summary = computeAggregatedSummary([]);
    expect(summary.totalFiles).toBe(0);
    expect(summary.successCount).toBe(0);
    expect(summary.errorCount).toBe(0);
    expect(summary.maxRiskScore).toBe(0);
    expect(summary.gpsFileCount).toBe(0);
  });

  it('counts errors correctly', () => {
    const results: FileResult[] = [
      makeFileResult({ error: 'not found' }),
      makeFileResult({ scanResult: makeScanResult({ fileScore: 20 }) }),
    ];
    const summary = computeAggregatedSummary(results);
    expect(summary.totalFiles).toBe(2);
    expect(summary.errorCount).toBe(1);
    expect(summary.successCount).toBe(1);
  });

  it('maxRiskScore equals highest file score', () => {
    const results: FileResult[] = [
      makeFileResult({ scanResult: makeScanResult({ fileScore: 30 }) }),
      makeFileResult({ scanResult: makeScanResult({ fileScore: 75 }) }),
      makeFileResult({ scanResult: makeScanResult({ fileScore: 50 }) }),
    ];
    const summary = computeAggregatedSummary(results);
    expect(summary.maxRiskScore).toBe(75);
  });

  it('gpsFileCount counts files with GPS', () => {
    const results: FileResult[] = [
      makeFileResult({ scanResult: makeScanResult({ hasGps: true }) }),
      makeFileResult({ scanResult: makeScanResult({ hasGps: false }) }),
      makeFileResult({ scanResult: makeScanResult({ hasGps: true }) }),
    ];
    const summary = computeAggregatedSummary(results);
    expect(summary.gpsFileCount).toBe(2);
  });

  it('totalFiles equals array length', () => {
    const results = [makeFileResult(), makeFileResult(), makeFileResult()];
    const summary = computeAggregatedSummary(results);
    expect(summary.totalFiles).toBe(3);
  });
});

describe('determineExitCode', () => {
  it('returns 0 for successful low-risk results', () => {
    const results = [makeFileResult({ scanResult: makeScanResult({ fileScore: 10 }) })];
    expect(determineExitCode(results)).toBe(0);
  });

  it('returns 1 when any file has score >= 50', () => {
    const results = [
      makeFileResult({ scanResult: makeScanResult({ fileScore: 10 }) }),
      makeFileResult({ scanResult: makeScanResult({ fileScore: 50 }) }),
    ];
    expect(determineExitCode(results)).toBe(1);
  });

  it('returns 2 when any file has an error', () => {
    const results = [
      makeFileResult({ scanResult: makeScanResult({ fileScore: 10 }) }),
      makeFileResult({ error: 'file not found' }),
    ];
    expect(determineExitCode(results)).toBe(2);
  });

  it('errors take priority over high risk scores', () => {
    const results = [
      makeFileResult({ scanResult: makeScanResult({ fileScore: 90 }) }),
      makeFileResult({ error: 'unsupported format' }),
    ];
    expect(determineExitCode(results)).toBe(2);
  });
});

describe('getDefaultOutputPath', () => {
  it('appends _cleaned before the extension', () => {
    expect(getDefaultOutputPath('photo.jpg')).toBe('photo_cleaned.jpg');
  });

  it('handles paths with directories', () => {
    expect(getDefaultOutputPath('/some/dir/photo.jpg')).toBe('photo_cleaned.jpg');
  });

  it('handles files without extensions', () => {
    expect(getDefaultOutputPath('noextension')).toBe('noextension_cleaned');
  });

  it('handles dotfiles (extension is the dot part)', () => {
    expect(getDefaultOutputPath('.hidden')).toBe('_cleaned.hidden');
  });

  it('preserves original extension', () => {
    expect(getDefaultOutputPath('video.mp4')).toBe('video_cleaned.mp4');
    expect(getDefaultOutputPath('image.PNG')).toBe('image_cleaned.PNG');
  });
});

describe('formatScanResult', () => {
  it('quiet mode outputs single line with filename, score, severity', () => {
    const result = makeFileResult({ scanResult: makeScanResult({ fileScore: 20 }) });
    const output = formatScanResult(result, { json: false, verbose: false, quiet: true });
    expect(output).toContain('test.jpg');
    expect(output).toContain('20');
    expect(output.split('\n').length).toBe(1);
  });

  it('json mode outputs valid JSON', () => {
    const result = makeFileResult({ scanResult: makeScanResult({ fileScore: 20 }) });
    const output = formatScanResult(result, { json: true, verbose: false, quiet: false });
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed.fileName).toBe('test.jpg');
  });

  it('human mode shows risk score and severity', () => {
    const result = makeFileResult({ scanResult: makeScanResult({ fileScore: 60 }) });
    const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
    expect(output).toContain('60');
    expect(output).toContain('test.jpg');
  });

  it('error result shows error message', () => {
    const result = makeFileResult({ error: 'File not found: test.jpg' });
    const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
    expect(output).toContain('File not found');
  });

  it('groups fields by category', () => {
    const result = makeFileResult({
      scanResult: makeScanResult({
        fileScore: 40,
        fields: [
          { key: 'GPSLatitude', value: '48.8566', category: 'gps' },
          { key: 'Make', value: 'Apple', category: 'deviceIdentity' },
        ],
      }),
    });
    const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
    expect(output).toContain('GPS Location');
    expect(output).toContain('Device Identity');
  });
});

describe('formatCleanResult', () => {
  it('quiet mode outputs single line with filename and fields removed', () => {
    const result = makeFileResult({
      cleanResult: {
        fieldsRemoved: 5,
        gpsStripped: true,
        originalSize: 2048,
        cleanedSize: 1024,
        cleanedFilePath: 'test_cleaned.jpg',
      },
    });
    const output = formatCleanResult(result, { json: false, verbose: false, quiet: true });
    expect(output).toContain('test.jpg');
    expect(output).toContain('5');
    expect(output.split('\n').length).toBe(1);
  });

  it('json mode outputs valid JSON', () => {
    const result = makeFileResult({
      cleanResult: {
        fieldsRemoved: 3,
        gpsStripped: false,
        originalSize: 2048,
        cleanedSize: 1500,
        cleanedFilePath: 'test_cleaned.jpg',
      },
    });
    const output = formatCleanResult(result, { json: true, verbose: false, quiet: false });
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('human mode shows all clean details', () => {
    const result = makeFileResult({
      cleanResult: {
        fieldsRemoved: 7,
        gpsStripped: true,
        originalSize: 4096,
        cleanedSize: 2048,
        cleanedFilePath: 'test_cleaned.jpg',
      },
    });
    const output = formatCleanResult(result, { json: false, verbose: false, quiet: false });
    expect(output).toContain('7');
    expect(output).toContain('yes');
    expect(output).toContain('test_cleaned.jpg');
  });
});

describe('formatSummary', () => {
  it('json mode includes results array and summary object', () => {
    const results = [makeFileResult({ scanResult: makeScanResult({ fileScore: 30 }) })];
    const output = formatSummary(results, { json: true, verbose: false, quiet: false });
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed.results)).toBe(true);
    expect(parsed.results.length).toBe(1);
    expect(parsed.summary).toBeDefined();
    expect(parsed.summary.totalFiles).toBe(1);
  });

  it('quiet mode outputs single line', () => {
    const results = [makeFileResult({ scanResult: makeScanResult({ fileScore: 10 }) })];
    const output = formatSummary(results, { json: false, verbose: false, quiet: true });
    expect(output.split('\n').length).toBe(1);
  });

  it('human mode includes total files count', () => {
    const results = [
      makeFileResult({ scanResult: makeScanResult({ fileScore: 10 }) }),
      makeFileResult({ scanResult: makeScanResult({ fileScore: 20 }) }),
    ];
    const output = formatSummary(results, { json: false, verbose: false, quiet: false });
    expect(output).toContain('2');
  });
});
