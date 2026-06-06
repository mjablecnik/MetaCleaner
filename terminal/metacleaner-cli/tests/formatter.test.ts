import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  computeAggregatedSummary,
  determineExitCode,
  getDefaultOutputPath,
  formatScanResult,
  formatCleanResult,
  formatCompareResult,
  formatSummary,
} from '../src/formatter.js';
import { classifySeverity } from 'metacleaner-app/src/lib/scanner/riskAnalyzer.js';
import type { FileResult } from '../src/types.js';
import type { ScanResult, MetadataField } from 'metacleaner-app/src/lib/scanner/types.js';

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

// Feature: metadata-inspect-cli, Property 1: Scan formatter groups fields by category
describe('formatScanResult category grouping (Property 1)', () => {
  const CATEGORIES = ['gps', 'deviceIdentity', 'personalData', 'timestamps'] as const;
  const CATEGORY_LABELS: Record<string, string> = {
    gps: 'GPS Location',
    deviceIdentity: 'Device Identity',
    personalData: 'Personal Data',
    timestamps: 'Timestamps',
  };

  const metadataFieldArb: fc.Arbitrary<MetadataField> = fc.record({
    key: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('\n')),
    value: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('\n')),
    category: fc.constantFrom(...CATEGORIES),
  });

  it('output contains a section header for each category present in fields', () => {
    fc.assert(
      fc.property(
        fc.array(metadataFieldArb, { minLength: 1, maxLength: 20 }),
        (fields) => {
          const result = makeFileResult({
            scanResult: makeScanResult({ fields, fieldCount: fields.length }),
          });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          const presentCategories = [...new Set(fields.map(f => f.category))];
          for (const cat of presentCategories) {
            expect(output).toContain(CATEGORY_LABELS[cat]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each field key appears in the output under its category section', () => {
    fc.assert(
      fc.property(
        fc.array(metadataFieldArb, { minLength: 1, maxLength: 10 }),
        (fields) => {
          const result = makeFileResult({
            scanResult: makeScanResult({ fields, fieldCount: fields.length }),
          });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          for (const field of fields) {
            expect(output).toContain(field.key);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('absent categories produce no section header in the output', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CATEGORIES),
        (onlyCategory) => {
          const fields: MetadataField[] = [{ key: 'SomeKey', value: 'val', category: onlyCategory }];
          const result = makeFileResult({
            scanResult: makeScanResult({ fields, fieldCount: 1 }),
          });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          const absentCategories = CATEGORIES.filter(c => c !== onlyCategory);
          for (const cat of absentCategories) {
            expect(output).not.toContain(CATEGORY_LABELS[cat]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: metadata-inspect-cli, Property 2: Scan formatter includes score and severity
describe('formatScanResult score and severity display (Property 2)', () => {
  it('human mode output contains the numeric score', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (fileScore) => {
          const result = makeFileResult({ scanResult: makeScanResult({ fileScore }) });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain(String(fileScore));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('human mode output contains the correct severity label for the score', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (fileScore) => {
          const expectedSeverity = classifySeverity(fileScore);
          const result = makeFileResult({ scanResult: makeScanResult({ fileScore }) });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain(expectedSeverity);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('score and severity are consistent (high score → critical/high label)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 75, max: 100 }),
        (fileScore) => {
          const result = makeFileResult({ scanResult: makeScanResult({ fileScore }) });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain('critical');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('low score produces low severity label', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 24 }),
        (fileScore) => {
          const result = makeFileResult({ scanResult: makeScanResult({ fileScore }) });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain('low');
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: metadata-inspect-cli, Property 3: Scan formatter includes conditional metadata when present
describe('formatScanResult conditional metadata display (Property 3)', () => {
  it('GPS latitude and longitude values appear in output when hasGps is true and GPS fields present', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        (lat, lon) => {
          const latStr = lat.toFixed(4);
          const lonStr = lon.toFixed(4);
          const result = makeFileResult({
            scanResult: makeScanResult({
              hasGps: true,
              fields: [
                { key: 'GPSLatitude', value: latStr, category: 'gps' },
                { key: 'GPSLongitude', value: lonStr, category: 'gps' },
              ],
            }),
          });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain(latStr);
          expect(output).toContain(lonStr);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no GPS line appears in output when hasGps is false', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        (lat, lon) => {
          const latStr = lat.toFixed(4);
          const lonStr = lon.toFixed(4);
          const result = makeFileResult({
            scanResult: makeScanResult({
              hasGps: false,
              fields: [
                { key: 'GPSLatitude', value: latStr, category: 'gps' },
                { key: 'GPSLongitude', value: lonStr, category: 'gps' },
              ],
            }),
          });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).not.toContain('📍 GPS:');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('device string appears in output when device is defined', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 40 }).filter(s => !s.includes('\n')),
        (device) => {
          const result = makeFileResult({
            scanResult: makeScanResult({ device }),
          });
          const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain(device);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no device line appears in output when device is undefined', () => {
    const result = makeFileResult({
      scanResult: makeScanResult({ device: undefined }),
    });
    const output = formatScanResult(result, { json: false, verbose: false, quiet: false });
    expect(output).not.toContain('📱 Device:');
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
