import { describe, it, expect } from 'vitest';
import {
	detectAIInPngBytes,
	detectAIInJpegBytes,
	detectAIInMetadata,
	detectAIByStructure,
	buildAIDetectionResult
} from '../aiDetector.js';
import type { AISignal } from '../aiDetector.js';

function makeBuffer(bytes: number[]): ArrayBuffer {
	return new Uint8Array(bytes).buffer;
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function makePngWithChunk(chunkType: string, data: number[]): ArrayBuffer {
	const typeBytes = Array.from(chunkType).map((c) => c.charCodeAt(0));
	const len = data.length;
	const lengthBytes = [(len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff];
	const crc = [0, 0, 0, 0];
	return makeBuffer([...PNG_SIG, ...lengthBytes, ...typeBytes, ...data, ...crc]);
}

// ─── detectAIInPngBytes ──────────────────────────────────────────────────────

describe('detectAIInPngBytes', () => {
	it('returns no signals for non-PNG bytes', () => {
		const buf = makeBuffer([0xff, 0xd8, 0xff, 0xe0]);
		const signals = detectAIInPngBytes(buf);
		expect(signals).toHaveLength(0);
	});

	it('returns no signals for empty buffer', () => {
		const signals = detectAIInPngBytes(makeBuffer([]));
		expect(signals).toHaveLength(0);
	});

	it('returns no signals for PNG with only a normal IDAT chunk', () => {
		const buf = makePngWithChunk('IDAT', [0x78, 0x9c]);
		const signals = detectAIInPngBytes(buf);
		expect(signals).toHaveLength(0);
	});

	it('returns confirmed signal for caBX chunk containing "c2pa"', () => {
		const c2paData = Array.from('c2pa').map((c) => c.charCodeAt(0));
		const buf = makePngWithChunk('caBX', c2paData);
		const signals = detectAIInPngBytes(buf);
		expect(signals).toHaveLength(1);
		expect(signals[0].type).toBe('confirmed');
		expect(signals[0].source).toBe('caBX chunk');
	});

	it('returns confirmed signal for jUMb chunk containing "jumb"', () => {
		const jumbData = Array.from('jumb content here').map((c) => c.charCodeAt(0));
		const buf = makePngWithChunk('jUMb', jumbData);
		const signals = detectAIInPngBytes(buf);
		expect(signals).toHaveLength(1);
		expect(signals[0].type).toBe('confirmed');
	});

	it('returns heuristic signal for caBX chunk without c2pa/jumb in data', () => {
		const data = Array.from('aaaa').map((c) => c.charCodeAt(0));
		const buf = makePngWithChunk('caBX', data);
		const signals = detectAIInPngBytes(buf);
		expect(signals).toHaveLength(1);
		expect(signals[0].type).toBe('heuristic');
		expect(signals[0].source).toBe('caBX chunk');
	});

	it('identifies ChatGPT generator from openai keyword in caBX chunk', () => {
		const data = Array.from('c2pa openai generated image').map((c) => c.charCodeAt(0));
		const buf = makePngWithChunk('caBX', data);
		const signals = detectAIInPngBytes(buf);
		expect(signals).toHaveLength(1);
		expect(signals[0].type).toBe('confirmed');
		expect(signals[0].detail).toContain('ChatGPT / DALL-E');
	});
});

// ─── detectAIInJpegBytes ─────────────────────────────────────────────────────

describe('detectAIInJpegBytes', () => {
	it('returns no signals for non-JPEG bytes', () => {
		const buf = makeBuffer([0x89, 0x50, 0x4e, 0x47]); // PNG sig
		const signals = detectAIInJpegBytes(buf);
		expect(signals).toHaveLength(0);
	});

	it('returns no signals for empty buffer', () => {
		const signals = detectAIInJpegBytes(makeBuffer([]));
		expect(signals).toHaveLength(0);
	});

	it('returns confirmed signal for APP11 segment containing "jumb"', () => {
		// FF D8 SOI + FF EB APP11 with length=6, then "jumb"
		// segData = bytes.slice(offset+4, offset+2+segLength) = bytes.slice(6, 10) = "jumb"
		const buf = makeBuffer([
			0xff,
			0xd8, // SOI
			0xff,
			0xeb,
			0x00,
			0x06, // APP11, segmentLength=6
			0x6a,
			0x75,
			0x6d,
			0x62 // "jumb"
		]);
		const signals = detectAIInJpegBytes(buf);
		expect(signals).toHaveLength(1);
		expect(signals[0].type).toBe('confirmed');
		expect(signals[0].source).toBe('APP11/JUMBF segment');
	});

	it('returns confirmed signal for APP11 segment containing "c2pa"', () => {
		const buf = makeBuffer([
			0xff,
			0xd8, // SOI
			0xff,
			0xeb,
			0x00,
			0x06, // APP11, segmentLength=6
			0x63,
			0x32,
			0x70,
			0x61 // "c2pa"
		]);
		const signals = detectAIInJpegBytes(buf);
		expect(signals).toHaveLength(1);
		expect(signals[0].type).toBe('confirmed');
	});

	it('returns no signals for JPEG with only APP1 (no C2PA)', () => {
		const buf = makeBuffer([
			0xff,
			0xd8, // SOI
			0xff,
			0xe1,
			0x00,
			0x04, // APP1, segmentLength=4
			0x45,
			0x78 // "Ex" - Exif start (not C2PA)
		]);
		const signals = detectAIInJpegBytes(buf);
		expect(signals).toHaveLength(0);
	});

	it('returns confirmed signal for "c2pa" found after SOS (fallback scan)', () => {
		// SOS breaks the segment loop; fallback scans first 50KB for "c2pa"
		const buf = makeBuffer([
			0xff,
			0xd8, // SOI
			0xff,
			0xda, // SOS → breaks segment scan
			0x63,
			0x32,
			0x70,
			0x61 // "c2pa" in body
		]);
		const signals = detectAIInJpegBytes(buf);
		expect(signals).toHaveLength(1);
		expect(signals[0].type).toBe('confirmed');
		expect(signals[0].source).toBe('File header');
	});
});

// ─── detectAIInMetadata ──────────────────────────────────────────────────────

describe('detectAIInMetadata', () => {
	it('returns no signals for empty metadata and clean filename', () => {
		const signals = detectAIInMetadata({}, 'photo.jpg');
		expect(signals).toHaveLength(0);
	});

	it('returns confirmed signal for IPTC DigitalSourceType with AI value', () => {
		const signals = detectAIInMetadata(
			{
				DigitalSourceType: 'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia'
			},
			'image.jpg'
		);
		const confirmed = signals.filter((s) => s.type === 'confirmed');
		expect(confirmed.length).toBeGreaterThan(0);
		expect(confirmed[0].source).toContain('DigitalSourceType');
	});

	it('returns confirmed signal for known AI generator name in Software field', () => {
		const signals = detectAIInMetadata({ Software: 'Stable Diffusion 1.5' }, 'image.png');
		const confirmed = signals.filter((s) => s.type === 'confirmed');
		expect(confirmed.length).toBeGreaterThan(0);
	});

	it('returns confirmed signal for midjourney in metadata value', () => {
		const signals = detectAIInMetadata({ Software: 'Midjourney v6' }, 'output.jpg');
		const confirmed = signals.filter((s) => s.type === 'confirmed');
		expect(confirmed.length).toBeGreaterThan(0);
	});

	it('returns confirmed signal for UserComment containing AI tool name', () => {
		const signals = detectAIInMetadata({ UserComment: 'Generated by midjourney' }, 'img.jpg');
		const confirmed = signals.filter((s) => s.type === 'confirmed');
		expect(confirmed.length).toBeGreaterThan(0);
		expect(confirmed[0].source).toBe('UserComment field');
	});

	it('returns confirmed signal for UserComment with SD generation parameters', () => {
		const signals = detectAIInMetadata(
			{ UserComment: 'a beautiful landscape Steps: 20 Sampler: Euler CFG Scale: 7 Seed: 12345' },
			'img.jpg'
		);
		const confirmed = signals.filter((s) => s.type === 'confirmed');
		expect(confirmed.length).toBeGreaterThan(0);
	});

	it('returns confirmed signal for "parameters" key with SD params', () => {
		const signals = detectAIInMetadata(
			{ parameters: 'a beautiful portrait, steps: 20, sampler: euler, cfg scale: 7, seed: 42' },
			'img.png'
		);
		const confirmed = signals.filter((s) => s.type === 'confirmed');
		expect(confirmed.length).toBeGreaterThan(0);
		expect(confirmed[0].detail).toContain('Stable Diffusion');
	});

	it('returns confirmed signal for "prompt" key with non-trivial content', () => {
		const signals = detectAIInMetadata(
			{ prompt: 'an astronaut riding a horse, highly detailed, 4k' },
			'img.png'
		);
		const confirmed = signals.filter((s) => s.type === 'confirmed');
		expect(confirmed.length).toBeGreaterThan(0);
	});

	it('returns confirmed signal for "negative_prompt" key', () => {
		const signals = detectAIInMetadata({ negative_prompt: 'blurry, low quality' }, 'img.png');
		const confirmed = signals.filter((s) => s.type === 'confirmed');
		expect(confirmed.length).toBeGreaterThan(0);
	});

	it('returns heuristic signal for FileSource != 3', () => {
		const signals = detectAIInMetadata({ FileSource: 0 }, 'img.jpg');
		const heuristic = signals.filter((s) => s.type === 'heuristic');
		expect(heuristic.length).toBeGreaterThan(0);
		expect(heuristic[0].source).toContain('FileSource');
	});

	it('returns no signal for FileSource === 3 (digital camera)', () => {
		const signals = detectAIInMetadata(
			{ FileSource: 3, Make: 'Canon', Model: 'EOS R5' },
			'photo.jpg'
		);
		const hasFileSourceSignal = signals.some((s) => s.source.includes('FileSource'));
		expect(hasFileSourceSignal).toBe(false);
	});

	it('returns heuristic signal for AI-related filename pattern', () => {
		const signals = detectAIInMetadata({ Make: 'Canon', Model: 'EOS R5' }, 'ChatGPT Image.png');
		const heuristic = signals.filter((s) => s.source === 'Filename');
		expect(heuristic.length).toBeGreaterThan(0);
	});

	it('returns heuristic signal for Gemini_Generated filename', () => {
		const signals = detectAIInMetadata({}, 'Gemini_Generated_01.jpg');
		const filenameSignal = signals.find((s) => s.source === 'Filename');
		expect(filenameSignal).toBeDefined();
		expect(filenameSignal!.type).toBe('heuristic');
	});

	it('returns no signals for clean camera metadata with normal filename', () => {
		const signals = detectAIInMetadata(
			{
				Make: 'Sony',
				Model: 'A7R IV',
				ExposureTime: '1/200',
				FNumber: 2.8,
				ISOSpeedRatings: 400,
				DateTimeOriginal: '2024:01:01 12:00:00'
			},
			'DSC09123.jpg'
		);
		expect(signals).toHaveLength(0);
	});
});

// ─── detectAIByStructure ─────────────────────────────────────────────────────

describe('detectAIByStructure', () => {
	it('returns no signal for completely empty metadata (clean file is safe)', () => {
		const signals = detectAIByStructure({}, 'image_ai_output.png');
		const heuristic = signals.filter((s) => s.type === 'heuristic' && s.source === 'Structure');
		expect(heuristic).toHaveLength(0);
	});

	it('returns no signal for empty metadata regardless of filename', () => {
		const signals = detectAIByStructure({}, 'IMG_1234.jpg');
		const structureSignals = signals.filter((s) => s.source === 'Structure');
		expect(structureSignals).toHaveLength(0);
	});

	it('returns heuristic signal when metadata present but no camera info', () => {
		const signals = detectAIByStructure(
			{ Comment: 'some metadata', CreationDate: '2024-01-01' },
			'image.jpg'
		);
		const heuristic = signals.filter((s) => s.source === 'Structure');
		expect(heuristic.length).toBeGreaterThan(0);
	});

	it('returns heuristic signal when Make/Model present but no FocalLength/Flash/ISO', () => {
		const signals = detectAIByStructure(
			{ Make: 'Unknown', Model: 'AI Device', ExposureTime: '1/100', FNumber: 2.8 },
			'image.jpg'
		);
		const heuristic = signals.filter((s) => s.source === 'Structure');
		expect(heuristic.length).toBeGreaterThan(0);
		expect(heuristic[0].detail).toContain('FocalLength');
	});

	it('returns no heuristic for complete real camera EXIF', () => {
		const signals = detectAIByStructure(
			{
				Make: 'Canon',
				Model: 'EOS R5',
				ExposureTime: '1/200',
				FNumber: 2.8,
				ISOSpeedRatings: 400,
				FocalLength: 85,
				Flash: 0
			},
			'IMG_0001.jpg'
		);
		expect(signals).toHaveLength(0);
	});
});

// ─── buildAIDetectionResult ──────────────────────────────────────────────────

describe('buildAIDetectionResult', () => {
	it('returns not-AI result for empty signals', () => {
		const result = buildAIDetectionResult([]);
		expect(result.isAIGenerated).toBe(false);
		expect(result.confidence).toBe('none');
		expect(result.generator).toBeNull();
		expect(result.signals).toHaveLength(0);
	});

	it('returns confirmed confidence for one confirmed signal', () => {
		const signals: AISignal[] = [
			{ type: 'confirmed', source: 'caBX chunk', detail: 'C2PA content credentials found' }
		];
		const result = buildAIDetectionResult(signals);
		expect(result.isAIGenerated).toBe(true);
		expect(result.confidence).toBe('confirmed');
	});

	it('returns likely confidence for two or more heuristic signals', () => {
		const signals: AISignal[] = [
			{ type: 'heuristic', source: 'Structure', detail: 'No EXIF metadata present' },
			{ type: 'heuristic', source: 'Filename', detail: "Contains AI-related pattern: 'generated'" }
		];
		const result = buildAIDetectionResult(signals);
		expect(result.isAIGenerated).toBe(true);
		expect(result.confidence).toBe('likely');
	});

	it('returns suspected confidence for exactly one heuristic signal', () => {
		const signals: AISignal[] = [
			{ type: 'heuristic', source: 'Structure', detail: 'No EXIF metadata present' }
		];
		const result = buildAIDetectionResult(signals);
		expect(result.isAIGenerated).toBe(true);
		expect(result.confidence).toBe('suspected');
	});

	it('prefers confirmed over heuristic when both present', () => {
		const signals: AISignal[] = [
			{ type: 'heuristic', source: 'Structure', detail: 'No EXIF' },
			{ type: 'confirmed', source: 'UserComment field', detail: 'References AI tool: dall-e' }
		];
		const result = buildAIDetectionResult(signals);
		expect(result.confidence).toBe('confirmed');
	});

	it('extracts generator name from parenthetical in confirmed signal detail', () => {
		const signals: AISignal[] = [
			{
				type: 'confirmed',
				source: 'caBX chunk',
				detail: 'C2PA content credentials found (ChatGPT / DALL-E)'
			}
		];
		const result = buildAIDetectionResult(signals);
		expect(result.generator).toBe('ChatGPT / DALL-E');
	});

	it('passes all signals through to the result', () => {
		const signals: AISignal[] = [
			{ type: 'confirmed', source: 'src1', detail: 'd1' },
			{ type: 'heuristic', source: 'src2', detail: 'd2' }
		];
		const result = buildAIDetectionResult(signals);
		expect(result.signals).toBe(signals);
	});
});
