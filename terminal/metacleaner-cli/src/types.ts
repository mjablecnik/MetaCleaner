export type {
  ScanResult,
  MetadataField,
  RiskCategory,
  SeverityLevel,
  FileType,
  ImageFormat,
  VideoFormat,
  AIDetectionInfo,
} from 'metacleaner-app/src/lib/scanner/types.js';

import type { ScanResult, SeverityLevel } from 'metacleaner-app/src/lib/scanner/types.js';

export interface CLIOptions {
  command: 'scan' | 'clean' | 'compare' | 'help' | 'version';
  files: string[];
  server: string;
  json: boolean;
  verbose: boolean;
  quiet: boolean;
  output?: string;
  timeout: number;
}

export interface CleanResult {
  fieldsRemoved: number;
  gpsStripped: boolean;
  originalSize: number;
  cleanedSize: number;
  cleanedFilePath: string;
}

export interface CompareResult {
  before: ScanResult;
  after: ScanResult;
  fieldsRemovedCount: number;
  scoreBefore: number;
  scoreAfter: number;
  severityBefore: SeverityLevel;
  severityAfter: SeverityLevel;
  gpsRemovedInCleaning: boolean;
}

export interface FileResult {
  filePath: string;
  fileName: string;
  fileSize: number;
  format: string;
  scanResult?: ScanResult;
  cleanResult?: CleanResult;
  compareResult?: CompareResult;
  error?: string;
}

export interface AggregatedSummary {
  totalFiles: number;
  successCount: number;
  errorCount: number;
  maxRiskScore: number;
  maxSeverity: SeverityLevel;
  gpsFileCount: number;
  aiFileCount: number;
}

export interface CommandResult {
  exitCode: number;
  results: FileResult[];
  summary?: AggregatedSummary;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  extension: string;
  type: string;
  format: string;
}

export interface JobResponse {
  jobId: string;
  status: string;
  totalFiles: number;
  createdAt: string;
}

export interface JobStatus {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  totalFiles: number;
  filesCompleted: number;
  fieldsRemoved: number;
  gpsLocationsRemoved: number;
  totalTimeSeconds: number;
}
