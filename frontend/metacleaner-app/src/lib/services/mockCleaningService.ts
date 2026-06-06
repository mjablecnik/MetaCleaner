import type {
	CleaningService,
	CleaningOptions,
	AnalysisResult,
	CleaningJob,
	CleaningCallbacks
} from './cleaningService.js';
import type { QueuedFile } from '$lib/scanner/types.js';
import type { ProcessingResults } from '$lib/types/processing.js';
import type { Report, ReportDetail, ReportSummaryStats } from '$lib/types/report.js';

const MIN_FIELDS = 8;
const MAX_FIELDS = 47;
const FILE_DELAY_MS = 800;
const PROGRESS_INTERVAL_MS = 100;

let _jobCounter = 0;
const _completedJobs = new Map<string, { results: ProcessingResults; files: QueuedFile[] }>();

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFieldCount(file: QueuedFile): number {
	// Image files tend to have more EXIF metadata
	const base = file.type === 'image' ? randomInt(15, MAX_FIELDS) : randomInt(MIN_FIELDS, 25);
	// Use scan result if available
	if (file.scanResult?.fieldCount && file.scanResult.fieldCount > 0) {
		return file.scanResult.fieldCount;
	}
	return base;
}

function hasGps(file: QueuedFile): boolean {
	if (file.scanResult) {
		return file.scanResult.hasGps;
	}
	// Simulate ~40% of image files having GPS
	return file.type === 'image' && Math.random() < 0.4;
}

class MockCleaningService implements CleaningService {
	async analyzeFiles(files: QueuedFile[]): Promise<AnalysisResult> {
		await new Promise((r) => setTimeout(r, 300));
		const perFileFieldCounts: Record<string, number> = {};
		let totalFields = 0;
		let hasAnyGps = false;

		for (const file of files) {
			const count = generateFieldCount(file);
			perFileFieldCounts[file.id] = count;
			totalFields += count;
			if (hasGps(file)) hasAnyGps = true;
		}

		return { totalFields, hasGps: hasAnyGps, perFileFieldCounts };
	}

	startCleaning(
		files: QueuedFile[],
		_options: CleaningOptions,
		callbacks: CleaningCallbacks
	): CleaningJob {
		const jobId = `mock-job-${++_jobCounter}-${Date.now()}`;
		let cancelled = false;

		// Error trigger: files named "error-*.xxx" simulate a cleaning failure
		const errorTriggerFile = files.find((f) => f.name.startsWith('error-'));
		if (errorTriggerFile) {
			setTimeout(() => {
				if (cancelled) return;
				callbacks.onFileStart(errorTriggerFile.id, errorTriggerFile.name);
				callbacks.onProgress(10, 0, files.length, 0, 5);
				setTimeout(() => {
					if (cancelled) return;
					callbacks.onError({
						code: 'ERR-0x4A2',
						hexCode: '0x4A2',
						message: 'Metadata cleaning failed unexpectedly',
						fileId: errorTriggerFile.id,
						fileName: errorTriggerFile.name,
						phase: 'metadata-extraction',
						timestamp: new Date().toISOString()
					});
				}, 300);
			}, 400);
			return { jobId, cancel() { cancelled = true; } };
		}

		const fieldCounts = files.map((f) => generateFieldCount(f));
		const gpsFlags = files.map((f) => hasGps(f));
		const totalFiles = files.length;
		const estimatedTotalMs = totalFiles * FILE_DELAY_MS;

		void (async () => {
			let filesCompleted = 0;
			let totalFieldsRemoved = 0;
			const fileResults: ProcessingResults['fileResults'] = [];
			const startTime = Date.now();

			for (let i = 0; i < files.length; i++) {
				if (cancelled) return;

				const file = files[i];
				const targetFields = fieldCounts[i];
				const fileHasGps = gpsFlags[i];

				callbacks.onFileStart(file.id, file.name);

				// Simulate per-file progress in steps
				const steps = Math.max(4, Math.floor(FILE_DELAY_MS / PROGRESS_INTERVAL_MS));
				for (let step = 0; step < steps; step++) {
					if (cancelled) return;
					await new Promise((r) => setTimeout(r, PROGRESS_INTERVAL_MS));

					const fileProgress = ((step + 1) / steps) * 100;
					const partialFields = Math.floor((fileProgress / 100) * targetFields);
					const elapsed = Date.now() - startTime;
					const overallProgress = Math.min(
						99,
						Math.floor(((i + fileProgress / 100) / totalFiles) * 100)
					);
					const remainingMs = estimatedTotalMs - elapsed;
					const timeRemainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

					callbacks.onProgress(
						overallProgress,
						filesCompleted,
						totalFiles,
						totalFieldsRemoved + partialFields,
						timeRemainingSeconds
					);
				}

				if (cancelled) return;

				filesCompleted++;
				totalFieldsRemoved += targetFields;
				callbacks.onFileComplete(file.id, targetFields, fileHasGps);

				// Build file result
				const exifCount = Math.floor(targetFields * 0.6);
				const xmpCount = Math.floor(targetFields * 0.25);
				fileResults.push({
					fileId: file.id,
					gpsRemoved: fileHasGps,
					exifCount,
					xmpCount,
					id3Count: file.type === 'video' ? randomInt(2, 10) : 0,
					mp4AtomsCount: file.format === 'mp4' ? randomInt(1, 5) : 0,
					pngChunksCount: file.format === 'png' ? randomInt(1, 3) : 0,
					totalFields: targetFields
				});

				callbacks.onProgress(
					Math.floor((filesCompleted / totalFiles) * 100),
					filesCompleted,
					totalFiles,
					totalFieldsRemoved,
					Math.max(0, Math.ceil(((totalFiles - filesCompleted) * FILE_DELAY_MS) / 1000))
				);
			}

			if (cancelled) return;

			const totalTimeSeconds = Math.ceil((Date.now() - startTime) / 1000);
			const totalGpsRemoved = gpsFlags.filter(Boolean).length;
			const gpsFields = fileResults.reduce((a, r) => a + (r.gpsRemoved ? randomInt(2, 8) : 0), 0);
			const exifFields = fileResults.reduce((a, r) => a + r.exifCount, 0);
			const xmpFields = fileResults.reduce((a, r) => a + r.xmpCount, 0);
			const otherFields = totalFieldsRemoved - gpsFields - exifFields - xmpFields;

			const results: ProcessingResults = {
				filesProcessed: totalFiles,
				fieldsRemoved: totalFieldsRemoved,
				gpsLocationsRemoved: totalGpsRemoved,
				totalTimeSeconds,
				fileResults,
				beforeBreakdown: {
					gpsLocations: gpsFields,
					exifFields,
					xmpFields,
					id3mp4Fields: fileResults.reduce((a, r) => a + r.id3Count + r.mp4AtomsCount, 0),
					otherFields: Math.max(0, otherFields)
				}
			};

			_completedJobs.set(jobId, { results, files });
			callbacks.onComplete(results);
		})();

		return {
			jobId,
			cancel() {
				cancelled = true;
			}
		};
	}

	async downloadResults(_jobId: string): Promise<Blob> {
		await new Promise((r) => setTimeout(r, 500));
		return new Blob(['mock-zip-content'], { type: 'application/zip' });
	}

	async getReports(): Promise<{ summary: ReportSummaryStats; reports: Report[] }> {
		await new Promise((r) => setTimeout(r, 200));
		return {
			summary: {
				totalReports: 12,
				fieldsRemoved: 1847,
				filesProcessed: 89,
				gpsRemoved: 34
			},
			reports: _generateMockReports()
		};
	}

	async getReportDetail(reportId: string): Promise<ReportDetail> {
		await new Promise((r) => setTimeout(r, 200));
		const job = _completedJobs.get(reportId);
		if (job) {
			return _generateReportDetailFromResults(reportId, job.results, job.files);
		}
		return _generateMockReportDetail();
	}
}

function _generateReportDetailFromResults(
	reportId: string,
	results: ProcessingResults,
	files: QueuedFile[]
): ReportDetail {
	const now = new Date();
	const dateStr = now.toLocaleDateString('cs-CZ', {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric'
	});
	const timeStr = now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });

	const totalExif = results.beforeBreakdown.exifFields;
	const totalXmp = results.beforeBreakdown.xmpFields;
	const totalGps = results.beforeBreakdown.gpsLocations;
	const totalFields = results.fieldsRemoved;

	const chartData = [
		{ label: 'GPS Data', fields: totalGps, percentage: totalFields > 0 ? Math.round((totalGps / totalFields) * 100) : 0 },
		{ label: 'EXIF Data', fields: totalExif, percentage: totalFields > 0 ? Math.round((totalExif / totalFields) * 100) : 0 },
		{ label: 'XMP Data', fields: totalXmp, percentage: totalFields > 0 ? Math.round((totalXmp / totalFields) * 100) : 0 }
	];

	const reportFiles = files.map((file, i) => {
		const fileResult = results.fileResults[i];
		const fieldsRemoved = fileResult?.totalFields ?? 0;
		const fileHasGps = fileResult?.gpsRemoved ?? false;
		const barWidthPercent = totalFields > 0 ? Math.round((fieldsRemoved / totalFields) * 100) : 0;

		return {
			name: file.name,
			extension: file.extension,
			sizeMB: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
			format: file.extension.replace('.', '').toUpperCase(),
			device: file.scanResult?.device ?? '',
			type: file.type as 'image' | 'video',
			iconColor: (file.type === 'video' ? 'orange' : 'green') as 'green' | 'blue' | 'orange',
			hasGps: fileHasGps,
			fieldsRemoved,
			barWidthPercent: Math.max(barWidthPercent, 5),
			barGradientFrom: '#22c55e',
			barGradientTo: '#16a34a',
			metadata: {
				gpsFields: fileHasGps
					? [
							{ label: 'GPS Latitude', value: '—' },
							{ label: 'GPS Longitude', value: '—' }
						]
					: [],
				exifFields: fileResult
					? [{ label: 'EXIF fields', value: `${fileResult.exifCount} removed` }]
					: [],
				xmpFields: fileResult
					? [{ label: 'XMP fields', value: `${fileResult.xmpCount} removed` }]
					: [],
				totalRemoved: fieldsRemoved
			}
		};
	});

	return {
		reportId,
		date: `${dateStr} · ${timeStr}`,
		filesProcessed: results.filesProcessed,
		fieldsRemoved: results.fieldsRemoved,
		gpsLocationsRemoved: results.gpsLocationsRemoved,
		totalTimeSeconds: results.totalTimeSeconds,
		chartData,
		files: reportFiles
	};
}

function _generateMockReports(): Report[] {
	const dates = ['2025-06-04', '2025-06-03', '2025-05-31', '2025-05-28', '2025-05-20'];
	const times = ['14:32', '09:15', '18:47', '11:22', '16:05'];
	const durations = ['2m 14s', '1m 38s', '3m 52s', '0m 58s', '4m 11s'];

	return dates.map((date, i) => ({
		id: `report-${i + 1}`,
		reportId: `MC-2025-${String(i + 1).padStart(3, '0')}`,
		date,
		time: times[i],
		duration: durations[i],
		fileCount: randomInt(3, 12),
		fileTypes: i % 2 === 0 ? 'JPG, PNG' : 'MP4, MOV',
		type: (i % 2 === 0 ? 'image' : 'video') as 'image' | 'video',
		gps: i % 3 !== 2,
		fields: randomInt(80, 350),
		fieldsColor: i === 1 ? 'orange' : 'white',
		tags: i % 2 === 0 ? ['GPS', 'EXIF'] : ['MP4'],
		iconColor: (['green', 'blue', 'orange'] as const)[i % 3]
	}));
}

function _generateMockReportDetail(): ReportDetail {
	return {
		reportId: 'MC-2025-001',
		date: '4. 6. 2025 · 14:32',
		filesProcessed: 8,
		fieldsRemoved: 247,
		gpsLocationsRemoved: 5,
		totalTimeSeconds: 134,
		chartData: [
			{ label: 'GPS Data', fields: 42, percentage: 17 },
			{ label: 'EXIF Data', fields: 138, percentage: 56 },
			{ label: 'XMP Data', fields: 67, percentage: 27 }
		],
		files: Array.from({ length: 8 }, (_, i) => ({
			name: `photo_${String(i + 1).padStart(3, '0')}.jpg`,
			extension: '.jpg',
			sizeMB: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
			format: 'JPEG',
			device: 'iPhone 15 Pro',
			type: 'image' as const,
			iconColor: 'green' as const,
			hasGps: i < 5,
			fieldsRemoved: randomInt(20, 50),
			barWidthPercent: randomInt(40, 90),
			barGradientFrom: '#22c55e',
			barGradientTo: '#16a34a',
			metadata: {
				gpsFields:
					i < 5
						? [
								{ label: 'GPS Latitude', value: '50.0755° N' },
								{ label: 'GPS Longitude', value: '14.4378° E' },
								{ label: 'GPS Altitude', value: '285 m' }
							]
						: [],
				exifFields: [
					{ label: 'Make', value: 'Apple' },
					{ label: 'Model', value: 'iPhone 15 Pro' },
					{ label: 'DateTimeOriginal', value: '2025:06:04 14:22:18' },
					{ label: 'ExposureTime', value: '1/120 s', moreCount: 12 }
				],
				xmpFields: [
					{ label: 'xmp:Creator', value: 'iPhone' },
					{ label: 'xmp:CreateDate', value: '2025-06-04T14:22:18' }
				],
				totalRemoved: randomInt(20, 50)
			}
		}))
	};
}

export const mockCleaningService: CleaningService = new MockCleaningService();
