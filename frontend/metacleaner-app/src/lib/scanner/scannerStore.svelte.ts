import type { QueuedFile, ScanResult } from './types.js';
import { detectFormat } from './parsers/formatDetector.js';
import { parseFile } from './metadataParser.js';
import { computeAggregatedRisk } from './riskAnalyzer.js';

let files = $state<QueuedFile[]>([]);
let _isProcessing = false;
let _idCounter = 0;
let lastRejection = $state<{ tooLarge: number; unsupported: number } | null>(null);

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

function generateId(): string {
	return `file-${Date.now()}-${++_idCounter}`;
}

function makePendingResult(fileId: string): ScanResult {
	return {
		fileId,
		status: 'pending',
		fields: [],
		hasGps: false,
		fieldCount: 0,
		categoryScores: { gps: 0, deviceIdentity: 0, personalData: 0, timestamps: 0 },
		fileScore: 0
	};
}

function updateFileScanResult(fileId: string, scanResult: ScanResult): void {
	const idx = files.findIndex((f) => f.id === fileId);
	if (idx !== -1) {
		files[idx] = { ...files[idx], scanResult };
	}
}

async function processNext(): Promise<void> {
	if (_isProcessing) return;

	const next = files.find((f) => f.scanResult?.status === 'pending');
	if (!next) return;

	_isProcessing = true;

	updateFileScanResult(next.id, { ...makePendingResult(next.id), status: 'scanning' });

	const result = await parseFile(next.file, next.id);
	updateFileScanResult(next.id, result);

	_isProcessing = false;
	void processNext();
}

export function addFiles(fileList: FileList): void {
	const added: QueuedFile[] = [];
	let tooLarge = 0;
	let unsupported = 0;

	for (const file of fileList) {
		if (file.size > MAX_FILE_SIZE) {
			tooLarge++;
			continue;
		}
		const detected = detectFormat(file);
		if (!detected) {
			unsupported++;
			continue;
		}
		const id = generateId();
		const dotIdx = file.name.lastIndexOf('.');

		added.push({
			id,
			file,
			name: file.name,
			size: file.size,
			extension: dotIdx !== -1 ? file.name.slice(dotIdx).toLowerCase() : '',
			type: detected.type,
			format: detected.format,
			scanResult: makePendingResult(id)
		});
	}

	if (tooLarge > 0 || unsupported > 0) {
		lastRejection = { tooLarge, unsupported };
	} else {
		lastRejection = null;
	}

	files = [...files, ...added];
	void processNext();
}

export function removeFile(fileId: string): void {
	files = files.filter((f) => f.id !== fileId);
}

export function clearFiles(): void {
	files = [];
	_isProcessing = false;
	_idCounter = 0;
}

const aggregatedRisk = $derived(
	computeAggregatedRisk(files.flatMap((f) => (f.scanResult ? [f.scanResult] : [])))
);

const hasFiles = $derived(files.length > 0);

const isScanning = $derived(
	files.some((f) => f.scanResult?.status === 'pending' || f.scanResult?.status === 'scanning')
);

export const scannerStore = {
	get files() {
		return files;
	},
	get aggregatedRisk() {
		return aggregatedRisk;
	},
	get hasFiles() {
		return hasFiles;
	},
	get isScanning() {
		return isScanning;
	},
	get lastRejection() {
		return lastRejection;
	},
	addFiles,
	removeFile,
	clearFiles,
	clearRejection() {
		lastRejection = null;
	}
};
