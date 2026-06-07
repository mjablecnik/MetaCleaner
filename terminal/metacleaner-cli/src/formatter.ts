import { classifySeverity } from 'metacleaner-app/src/lib/scanner/riskAnalyzer.js';
import type { SeverityLevel } from 'metacleaner-app/src/lib/scanner/types.js';
import type { FileResult, AggregatedSummary, CleanResult, CompareResult } from './types.js';

export interface FormatOptions {
  json: boolean;
  verbose: boolean;
  quiet: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  gps: 'GPS Location',
  deviceIdentity: 'Device Identity',
  personalData: 'Personal Data',
  timestamps: 'Timestamps',
};

const CATEGORY_EMOJI: Record<string, string> = {
  gps: '📍',
  deviceIdentity: '📱',
  personalData: '👤',
  timestamps: '🕐',
};

const SEVERITY_EMOJI: Record<SeverityLevel, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

export function formatSeverity(score: number): SeverityLevel {
  return classifySeverity(score);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function computeAggregatedSummary(results: FileResult[]): AggregatedSummary {
  let maxRiskScore = 0;
  let gpsFileCount = 0;
  let aiFileCount = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const r of results) {
    if (r.error) {
      errorCount++;
    } else {
      successCount++;
      const score = r.scanResult?.fileScore ?? 0;
      if (score > maxRiskScore) maxRiskScore = score;
      if (r.scanResult?.hasGps) gpsFileCount++;
      if (r.scanResult?.aiDetection?.isAIGenerated) aiFileCount++;
    }
  }

  return {
    totalFiles: results.length,
    successCount,
    errorCount,
    maxRiskScore,
    maxSeverity: classifySeverity(maxRiskScore),
    gpsFileCount,
    aiFileCount,
  };
}

export function determineExitCode(results: FileResult[]): number {
  if (results.some(r => r.error)) return 2;
  if (results.some(r => (r.scanResult?.fileScore ?? 0) >= 50)) return 1;
  return 0;
}

export function getDefaultOutputPath(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/');
  const fileName = lastSlash >= 0 ? filePath.slice(lastSlash + 1) : filePath;
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot < 0) return `${fileName}_cleaned`;
  const name = fileName.slice(0, lastDot);
  const ext = fileName.slice(lastDot);
  return `${name}_cleaned${ext}`;
}

export function formatScanResult(result: FileResult, options: FormatOptions): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  if (options.quiet) {
    const score = result.scanResult?.fileScore ?? 0;
    const severity = formatSeverity(score);
    return `${result.fileName} ${score} ${severity}`;
  }

  const lines: string[] = [];

  if (result.error) {
    lines.push(`❌ ${result.fileName} — ${result.error}`);
    return lines.join('\n');
  }

  const scan = result.scanResult!;
  const severity = formatSeverity(scan.fileScore);
  const emoji = SEVERITY_EMOJI[severity];

  lines.push(`${emoji} ${result.fileName}`);
  lines.push(`   Risk Score: ${scan.fileScore}/100 (${severity})`);
  lines.push(`   Fields: ${scan.fieldCount}`);

  if (scan.hasGps) {
    const latField = scan.fields.find(f => f.key === 'GPSLatitude');
    const lonField = scan.fields.find(f => f.key === 'GPSLongitude');
    if (latField && lonField) {
      lines.push(`   📍 GPS: ${latField.value}, ${lonField.value}`);
    }
  }

  if (scan.device) {
    lines.push(`   📱 Device: ${scan.device}`);
  }

  const categories = ['gps', 'deviceIdentity', 'personalData', 'timestamps'] as const;
  for (const cat of categories) {
    const catFields = scan.fields.filter(f => f.category === cat);
    if (catFields.length === 0) continue;
    const label = CATEGORY_LABELS[cat];
    const catEmoji = CATEGORY_EMOJI[cat];
    lines.push(`\n   ${catEmoji} ${label} (score: ${scan.categoryScores[cat]})`);
    for (const field of catFields) {
      lines.push(`      ${field.key}: ${field.value}`);
    }
  }

  if (options.verbose) {
    lines.push(`\n   Size: ${formatBytes(result.fileSize)}`);
    lines.push(`   Format: ${result.format}`);
    lines.push(`   File path: ${result.filePath}`);
  }

  // AI detection output
  if (scan.aiDetection?.isAIGenerated) {
    const ai = scan.aiDetection;
    const genStr = ai.generator ? ` (${ai.generator})` : '';
    lines.push(`\n   🤖 AI-Generated [${ai.confidence}]${genStr}`);
    for (const signal of ai.signals) {
      const icon = signal.type === 'confirmed' ? '✔' : '⚠';
      lines.push(`      ${icon} ${signal.detail} [${signal.source}]`);
    }
  }

  return lines.join('\n');
}

export function formatCleanResult(result: FileResult, options: FormatOptions): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  if (options.quiet) {
    const clean = result.cleanResult;
    if (!clean) return `${result.fileName} — no clean result`;
    return `${result.fileName} ${clean.fieldsRemoved} fields removed`;
  }

  const lines: string[] = [];

  if (result.error) {
    lines.push(`❌ ${result.fileName} — ${result.error}`);
    return lines.join('\n');
  }

  const clean = result.cleanResult!;
  const sizeDiff = clean.originalSize - clean.cleanedSize;
  const sizeArrow = sizeDiff >= 0 ? `↓ ${formatBytes(sizeDiff)} smaller` : `↑ ${formatBytes(-sizeDiff)} larger`;

  lines.push(`✅ ${result.fileName}`);
  lines.push(`   Fields removed: ${clean.fieldsRemoved}`);
  lines.push(`   GPS stripped: ${clean.gpsStripped ? 'yes' : 'no'}`);
  lines.push(`   Original size: ${formatBytes(clean.originalSize)}`);
  lines.push(`   Cleaned size: ${formatBytes(clean.cleanedSize)} (${sizeArrow})`);
  lines.push(`   Saved to: ${clean.cleanedFilePath}`);

  return lines.join('\n');
}

export function formatCompareResult(result: FileResult, options: FormatOptions): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  if (options.quiet) {
    const cmp = result.compareResult;
    if (!cmp) return `${result.fileName} — no compare result`;
    return `${result.fileName} ${cmp.scoreBefore} → ${cmp.scoreAfter}`;
  }

  const lines: string[] = [];

  if (result.error) {
    lines.push(`❌ ${result.fileName} — ${result.error}`);
    return lines.join('\n');
  }

  const cmp = result.compareResult!;
  const scoreDiff = cmp.scoreAfter - cmp.scoreBefore;
  const scoreArrow = scoreDiff <= 0 ? `↓ ${Math.abs(scoreDiff)}` : `↑ ${scoreDiff}`;
  const fieldDiff = cmp.after.fieldCount - cmp.before.fieldCount;

  lines.push(`🔍 ${result.fileName}`);
  lines.push(`   Score: ${cmp.scoreBefore} → ${cmp.scoreAfter} (${scoreArrow})`);
  lines.push(`   Severity: ${cmp.severityBefore} → ${cmp.severityAfter}`);
  lines.push(`   Fields: ${cmp.before.fieldCount} → ${cmp.after.fieldCount} (${fieldDiff < 0 ? fieldDiff : '+' + fieldDiff})`);
  lines.push(`   GPS: ${cmp.before.hasGps ? 'present' : 'absent'} → ${cmp.after.hasGps ? 'present' : 'absent'}${cmp.gpsRemovedInCleaning ? ' (removed)' : ''}`);

  const beforeDevice = cmp.before.device ?? 'none';
  const afterDevice = cmp.after.device ?? 'none';
  if (beforeDevice !== afterDevice) {
    lines.push(`   Device: ${beforeDevice} → ${afterDevice}`);
  } else {
    lines.push(`   Device: ${beforeDevice}`);
  }

  return lines.join('\n');
}

export function formatSummary(results: FileResult[], options: FormatOptions): string {
  const summary = computeAggregatedSummary(results);

  if (options.json) {
    return JSON.stringify({ results, summary }, null, 2);
  }

  if (options.quiet) {
    return `Total: ${summary.totalFiles} files, ${summary.successCount} ok, ${summary.errorCount} errors, max score: ${summary.maxRiskScore}`;
  }

  const lines: string[] = [];
  lines.push(`\n── Summary ──────────────────────────`);
  lines.push(`   Total files:    ${summary.totalFiles}`);
  lines.push(`   Succeeded:      ${summary.successCount}`);
  lines.push(`   Errors:         ${summary.errorCount}`);
  lines.push(`   Max risk score: ${summary.maxRiskScore} (${summary.maxSeverity})`);
  lines.push(`   GPS detected:   ${summary.gpsFileCount} file(s)`);
  lines.push(`   AI-generated:   ${summary.aiFileCount} file(s)`);
  lines.push(`─────────────────────────────────────`);

  return lines.join('\n');
}
