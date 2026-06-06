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
import type { FileResult, CleanResult, CompareResult } from '../src/types.js';
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

// Feature: metadata-inspect-cli, Property 5: Default cleaned file path naming
describe('getDefaultOutputPath property tests (Property 5)', () => {
  const safeNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}$/);
  const extArb = fc.stringMatching(/^[a-zA-Z0-9]{1,5}$/);

  it('output equals <name>_cleaned.<ext> for name.ext inputs', () => {
    fc.assert(
      fc.property(safeNameArb, extArb, (name, ext) => {
        const input = `${name}.${ext}`;
        const result = getDefaultOutputPath(input);
        expect(result).toBe(`${name}_cleaned.${ext}`);
      }),
      { numRuns: 200 }
    );
  });

  it('output equals <name>_cleaned for inputs with no extension', () => {
    fc.assert(
      fc.property(safeNameArb, (name) => {
        const result = getDefaultOutputPath(name);
        expect(result).toBe(`${name}_cleaned`);
      }),
      { numRuns: 100 }
    );
  });

  it('output has no directory separators regardless of input path', () => {
    fc.assert(
      fc.property(safeNameArb, extArb, safeNameArb, (dir, ext, name) => {
        const input = `/${dir}/${name}.${ext}`;
        const result = getDefaultOutputPath(input);
        expect(result).not.toContain('/');
      }),
      { numRuns: 100 }
    );
  });

  it('output always ends with _cleaned when no extension present', () => {
    fc.assert(
      fc.property(safeNameArb, (name) => {
        const result = getDefaultOutputPath(name);
        expect(result.endsWith('_cleaned')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('output always contains _cleaned as a substring', () => {
    fc.assert(
      fc.property(safeNameArb, extArb, (name, ext) => {
        const result = getDefaultOutputPath(`${name}.${ext}`);
        expect(result).toContain('_cleaned');
      }),
      { numRuns: 100 }
    );
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

// Feature: metadata-inspect-cli, Property 4: Aggregation summary correctness
describe('computeAggregatedSummary property tests (Property 4)', () => {
  const successResultArb: fc.Arbitrary<FileResult> = fc.record({
    filePath: fc.constant('/tmp/test.jpg'),
    fileName: fc.constant('test.jpg'),
    fileSize: fc.constant(1024),
    format: fc.constant('jpeg'),
    scanResult: fc.record({
      fileId: fc.constant('test-id'),
      status: fc.constant('done' as const),
      fields: fc.constant([]),
      hasGps: fc.boolean(),
      fieldCount: fc.constant(0),
      categoryScores: fc.constant({ gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 }),
      fileScore: fc.integer({ min: 0, max: 100 }),
    }),
  });

  const errorResultArb: fc.Arbitrary<FileResult> = fc.record({
    filePath: fc.constant('/tmp/test.jpg'),
    fileName: fc.constant('test.jpg'),
    fileSize: fc.constant(1024),
    format: fc.constant('jpeg'),
    error: fc.constant('some error'),
  });

  it('totalFiles equals the length of the input array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(successResultArb, errorResultArb), { minLength: 1, maxLength: 20 }),
        (results) => {
          const summary = computeAggregatedSummary(results);
          expect(summary.totalFiles).toBe(results.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('maxRiskScore equals the maximum fileScore among successful results', () => {
    fc.assert(
      fc.property(
        fc.array(successResultArb, { minLength: 1, maxLength: 20 }),
        (results) => {
          const summary = computeAggregatedSummary(results);
          const expectedMax = Math.max(...results.map(r => r.scanResult!.fileScore));
          expect(summary.maxRiskScore).toBe(expectedMax);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('gpsFileCount equals the count of successful results with hasGps=true', () => {
    fc.assert(
      fc.property(
        fc.array(successResultArb, { minLength: 1, maxLength: 20 }),
        (results) => {
          const summary = computeAggregatedSummary(results);
          const expectedGpsCount = results.filter(r => r.scanResult?.hasGps).length;
          expect(summary.gpsFileCount).toBe(expectedGpsCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('maxRiskScore is 0 when all results are errors', () => {
    fc.assert(
      fc.property(
        fc.array(errorResultArb, { minLength: 1, maxLength: 20 }),
        (results) => {
          const summary = computeAggregatedSummary(results);
          expect(summary.maxRiskScore).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('gpsFileCount is 0 when all results are errors', () => {
    fc.assert(
      fc.property(
        fc.array(errorResultArb, { minLength: 1, maxLength: 20 }),
        (results) => {
          const summary = computeAggregatedSummary(results);
          expect(summary.gpsFileCount).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: metadata-inspect-cli, Property 6: Clean formatter includes all required information
describe('formatCleanResult property tests (Property 6)', () => {
  const cleanResultArb: fc.Arbitrary<CleanResult> = fc.record({
    fieldsRemoved: fc.integer({ min: 0, max: 100 }),
    gpsStripped: fc.boolean(),
    originalSize: fc.integer({ min: 1, max: 1023 }),
    cleanedSize: fc.integer({ min: 0, max: 1023 }),
    cleanedFilePath: fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}_cleaned\.[a-z]{2,4}$/).filter(s => !s.includes('\n')),
  });

  it('output contains fieldsRemoved count in human mode', () => {
    fc.assert(
      fc.property(cleanResultArb, (clean) => {
        const result = makeFileResult({ cleanResult: clean });
        const output = formatCleanResult(result, { json: false, verbose: false, quiet: false });
        expect(output).toContain(String(clean.fieldsRemoved));
      }),
      { numRuns: 100 }
    );
  });

  it('output contains "yes" when gpsStripped is true', () => {
    fc.assert(
      fc.property(
        cleanResultArb.filter(c => c.gpsStripped),
        (clean) => {
          const result = makeFileResult({ cleanResult: clean });
          const output = formatCleanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain('yes');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('output contains "no" when gpsStripped is false', () => {
    fc.assert(
      fc.property(
        cleanResultArb.filter(c => !c.gpsStripped),
        (clean) => {
          const result = makeFileResult({ cleanResult: clean });
          const output = formatCleanResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain('no');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('output contains original size in bytes when size < 1024', () => {
    fc.assert(
      fc.property(cleanResultArb, (clean) => {
        const result = makeFileResult({ cleanResult: clean });
        const output = formatCleanResult(result, { json: false, verbose: false, quiet: false });
        expect(output).toContain(`${clean.originalSize} B`);
      }),
      { numRuns: 100 }
    );
  });

  it('output contains cleaned size in bytes when size < 1024', () => {
    fc.assert(
      fc.property(cleanResultArb, (clean) => {
        const result = makeFileResult({ cleanResult: clean });
        const output = formatCleanResult(result, { json: false, verbose: false, quiet: false });
        expect(output).toContain(`${clean.cleanedSize} B`);
      }),
      { numRuns: 100 }
    );
  });

  it('output contains cleanedFilePath in human mode', () => {
    fc.assert(
      fc.property(cleanResultArb, (clean) => {
        const result = makeFileResult({ cleanResult: clean });
        const output = formatCleanResult(result, { json: false, verbose: false, quiet: false });
        expect(output).toContain(clean.cleanedFilePath);
      }),
      { numRuns: 100 }
    );
  });

  it('JSON mode produces valid JSON containing fieldsRemoved and gpsStripped', () => {
    fc.assert(
      fc.property(cleanResultArb, (clean) => {
        const result = makeFileResult({ cleanResult: clean });
        const output = formatCleanResult(result, { json: true, verbose: false, quiet: false });
        const parsed = JSON.parse(output);
        expect(parsed.cleanResult.fieldsRemoved).toBe(clean.fieldsRemoved);
        expect(parsed.cleanResult.gpsStripped).toBe(clean.gpsStripped);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: metadata-inspect-cli, Property 7: Compare formatter includes all comparison data
describe('formatCompareResult property tests (Property 7)', () => {
  const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

  const scanResultForCmpArb: fc.Arbitrary<import('metacleaner-app/src/lib/scanner/types.js').ScanResult> = fc.record({
    fileId: fc.constant('test-id'),
    status: fc.constant('done' as const),
    fields: fc.constant([]),
    hasGps: fc.boolean(),
    fieldCount: fc.integer({ min: 0, max: 50 }),
    categoryScores: fc.constant({ gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 }),
    fileScore: fc.integer({ min: 0, max: 100 }),
  });

  const compareResultArb: fc.Arbitrary<CompareResult> = fc.record({
    before: scanResultForCmpArb,
    after: scanResultForCmpArb,
    fieldsRemovedCount: fc.integer({ min: 0, max: 50 }),
    scoreBefore: fc.integer({ min: 0, max: 100 }),
    scoreAfter: fc.integer({ min: 0, max: 100 }),
    severityBefore: fc.constantFrom(...SEVERITY_LEVELS),
    severityAfter: fc.constantFrom(...SEVERITY_LEVELS),
    gpsRemovedInCleaning: fc.boolean(),
  });

  it('output contains scoreBefore and scoreAfter values in human mode', () => {
    fc.assert(
      fc.property(compareResultArb, (cmp) => {
        const result = makeFileResult({ compareResult: cmp });
        const output = formatCompareResult(result, { json: false, verbose: false, quiet: false });
        expect(output).toContain(String(cmp.scoreBefore));
        expect(output).toContain(String(cmp.scoreAfter));
      }),
      { numRuns: 100 }
    );
  });

  it('output contains severityBefore and severityAfter labels in human mode', () => {
    fc.assert(
      fc.property(compareResultArb, (cmp) => {
        const result = makeFileResult({ compareResult: cmp });
        const output = formatCompareResult(result, { json: false, verbose: false, quiet: false });
        expect(output).toContain(cmp.severityBefore);
        expect(output).toContain(cmp.severityAfter);
      }),
      { numRuns: 100 }
    );
  });

  it('output contains field count change (before and after fieldCount) in human mode', () => {
    fc.assert(
      fc.property(compareResultArb, (cmp) => {
        const result = makeFileResult({ compareResult: cmp });
        const output = formatCompareResult(result, { json: false, verbose: false, quiet: false });
        expect(output).toContain(String(cmp.before.fieldCount));
        expect(output).toContain(String(cmp.after.fieldCount));
      }),
      { numRuns: 100 }
    );
  });

  it('output contains GPS presence labels (present/absent) in human mode', () => {
    fc.assert(
      fc.property(compareResultArb, (cmp) => {
        const result = makeFileResult({ compareResult: cmp });
        const output = formatCompareResult(result, { json: false, verbose: false, quiet: false });
        const beforeGps = cmp.before.hasGps ? 'present' : 'absent';
        const afterGps = cmp.after.hasGps ? 'present' : 'absent';
        expect(output).toContain(beforeGps);
        expect(output).toContain(afterGps);
      }),
      { numRuns: 100 }
    );
  });

  it('output contains "(removed)" when gpsRemovedInCleaning is true', () => {
    fc.assert(
      fc.property(
        compareResultArb.filter(c => c.gpsRemovedInCleaning),
        (cmp) => {
          const result = makeFileResult({ compareResult: cmp });
          const output = formatCompareResult(result, { json: false, verbose: false, quiet: false });
          expect(output).toContain('(removed)');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('quiet mode shows scoreBefore and scoreAfter', () => {
    fc.assert(
      fc.property(compareResultArb, (cmp) => {
        const result = makeFileResult({ compareResult: cmp });
        const output = formatCompareResult(result, { json: false, verbose: false, quiet: true });
        expect(output).toContain(String(cmp.scoreBefore));
        expect(output).toContain(String(cmp.scoreAfter));
      }),
      { numRuns: 100 }
    );
  });

  it('JSON mode produces valid JSON containing scoreBefore, scoreAfter, and gpsRemovedInCleaning', () => {
    fc.assert(
      fc.property(compareResultArb, (cmp) => {
        const result = makeFileResult({ compareResult: cmp });
        const output = formatCompareResult(result, { json: true, verbose: false, quiet: false });
        const parsed = JSON.parse(output);
        expect(parsed.compareResult.scoreBefore).toBe(cmp.scoreBefore);
        expect(parsed.compareResult.scoreAfter).toBe(cmp.scoreAfter);
        expect(parsed.compareResult.gpsRemovedInCleaning).toBe(cmp.gpsRemovedInCleaning);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: metadata-inspect-cli, Property 8: JSON output round-trip
describe('formatScanResult JSON round-trip (Property 8)', () => {
  const CATEGORIES = ['gps', 'deviceIdentity', 'personalData', 'timestamps'] as const;

  const metadataFieldArb: fc.Arbitrary<MetadataField> = fc.record({
    key: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('\0')),
    value: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('\0')),
    category: fc.constantFrom(...CATEGORIES),
  });

  const scanResultArb: fc.Arbitrary<import('metacleaner-app/src/lib/scanner/types.js').ScanResult> = fc
    .array(metadataFieldArb, { minLength: 0, maxLength: 10 })
    .chain(fields =>
      fc.record({
        fileId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('\0')),
        status: fc.constant('done' as const),
        fields: fc.constant(fields),
        hasGps: fc.boolean(),
        fieldCount: fc.constant(fields.length),
        categoryScores: fc.constant({ gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 }),
        fileScore: fc.integer({ min: 0, max: 100 }),
      })
    );

  it('parsed JSON has same fileName as the original FileResult', () => {
    fc.assert(
      fc.property(scanResultArb, (scanResult) => {
        const result = makeFileResult({ scanResult });
        const output = formatScanResult(result, { json: true, verbose: false, quiet: false });
        const parsed = JSON.parse(output);
        expect(parsed.fileName).toBe(result.fileName);
      }),
      { numRuns: 100 }
    );
  });

  it('parsed JSON has same fileScore as the original ScanResult', () => {
    fc.assert(
      fc.property(scanResultArb, (scanResult) => {
        const result = makeFileResult({ scanResult });
        const output = formatScanResult(result, { json: true, verbose: false, quiet: false });
        const parsed = JSON.parse(output);
        expect(parsed.scanResult.fileScore).toBe(scanResult.fileScore);
      }),
      { numRuns: 100 }
    );
  });

  it('parsed JSON has same hasGps as the original ScanResult', () => {
    fc.assert(
      fc.property(scanResultArb, (scanResult) => {
        const result = makeFileResult({ scanResult });
        const output = formatScanResult(result, { json: true, verbose: false, quiet: false });
        const parsed = JSON.parse(output);
        expect(parsed.scanResult.hasGps).toBe(scanResult.hasGps);
      }),
      { numRuns: 100 }
    );
  });

  it('parsed JSON fields array has same length as original', () => {
    fc.assert(
      fc.property(scanResultArb, (scanResult) => {
        const result = makeFileResult({ scanResult });
        const output = formatScanResult(result, { json: true, verbose: false, quiet: false });
        const parsed = JSON.parse(output);
        expect(parsed.scanResult.fields.length).toBe(scanResult.fields.length);
      }),
      { numRuns: 100 }
    );
  });

  it('parsed JSON fields preserve key, value, and category for each field', () => {
    fc.assert(
      fc.property(scanResultArb, (scanResult) => {
        const result = makeFileResult({ scanResult });
        const output = formatScanResult(result, { json: true, verbose: false, quiet: false });
        const parsed = JSON.parse(output);
        for (let i = 0; i < scanResult.fields.length; i++) {
          expect(parsed.scanResult.fields[i].key).toBe(scanResult.fields[i].key);
          expect(parsed.scanResult.fields[i].value).toBe(scanResult.fields[i].value);
          expect(parsed.scanResult.fields[i].category).toBe(scanResult.fields[i].category);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('output is always valid JSON for any ScanResult', () => {
    fc.assert(
      fc.property(scanResultArb, (scanResult) => {
        const result = makeFileResult({ scanResult });
        const output = formatScanResult(result, { json: true, verbose: false, quiet: false });
        expect(() => JSON.parse(output)).not.toThrow();
      }),
      { numRuns: 200 }
    );
  });
});

// Feature: metadata-inspect-cli, Property 9: JSON multi-file output structure
describe('formatSummary JSON multi-file structure (Property 9)', () => {
  const successResultArb: fc.Arbitrary<FileResult> = fc.record({
    filePath: fc.constant('/tmp/test.jpg'),
    fileName: fc.constant('test.jpg'),
    fileSize: fc.constant(1024),
    format: fc.constant('jpeg'),
    scanResult: fc.record({
      fileId: fc.constant('test-id'),
      status: fc.constant('done' as const),
      fields: fc.constant([]),
      hasGps: fc.boolean(),
      fieldCount: fc.constant(0),
      categoryScores: fc.constant({ gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 }),
      fileScore: fc.integer({ min: 0, max: 100 }),
    }),
  });

  const errorResultArb: fc.Arbitrary<FileResult> = fc.record({
    filePath: fc.constant('/tmp/error.jpg'),
    fileName: fc.constant('error.jpg'),
    fileSize: fc.constant(0),
    format: fc.constant('jpeg'),
    error: fc.constant('file not found'),
  });

  const fileResultArb = fc.oneof(successResultArb, errorResultArb);

  it('JSON output has a results array with length equal to input array length', () => {
    fc.assert(
      fc.property(
        fc.array(fileResultArb, { minLength: 1, maxLength: 20 }),
        (results) => {
          const output = formatSummary(results, { json: true, verbose: false, quiet: false });
          const parsed = JSON.parse(output);
          expect(Array.isArray(parsed.results)).toBe(true);
          expect(parsed.results.length).toBe(results.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('JSON output summary.totalFiles equals the input array length', () => {
    fc.assert(
      fc.property(
        fc.array(fileResultArb, { minLength: 1, maxLength: 20 }),
        (results) => {
          const output = formatSummary(results, { json: true, verbose: false, quiet: false });
          const parsed = JSON.parse(output);
          expect(parsed.summary).toBeDefined();
          expect(parsed.summary.totalFiles).toBe(results.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('JSON output is always valid JSON for any non-empty array of FileResult', () => {
    fc.assert(
      fc.property(
        fc.array(fileResultArb, { minLength: 1, maxLength: 20 }),
        (results) => {
          const output = formatSummary(results, { json: true, verbose: false, quiet: false });
          expect(() => JSON.parse(output)).not.toThrow();
        }
      ),
      { numRuns: 200 }
    );
  });

  it('JSON results array length equals N for every N from 1 to 10', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }).chain(n =>
          fc.tuple(fc.constant(n), fc.array(fileResultArb, { minLength: n, maxLength: n }))
        ),
        ([n, results]) => {
          const output = formatSummary(results, { json: true, verbose: false, quiet: false });
          const parsed = JSON.parse(output);
          expect(parsed.results.length).toBe(n);
          expect(parsed.summary.totalFiles).toBe(n);
        }
      ),
      { numRuns: 100 }
    );
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
