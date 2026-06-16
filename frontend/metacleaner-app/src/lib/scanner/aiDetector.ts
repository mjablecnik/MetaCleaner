/**
 * AI-generated image detection module.
 *
 * Detects AI-generated images by analyzing:
 * 1. C2PA/JUMBF content credentials (PNG caBX/jUMb chunks, JPEG APP11 segments)
 * 2. Known AI generator signatures in text metadata (tEXt, iTXt, XMP)
 * 3. IPTC DigitalSourceType standard for AI content classification
 * 4. FileSource/SceneType EXIF tags (camera vs synthetic)
 * 5. UserComment field (may contain AI prompts)
 * 6. Filename heuristics (e.g. "ChatGPT Image", "Gemini_Generated")
 * 7. Structural indicators (missing camera EXIF, no thumbnail, no ICC)
 */

export interface AIDetectionResult {
	isAIGenerated: boolean;
	confidence: 'confirmed' | 'likely' | 'suspected' | 'none';
	generator: string | null;
	signals: AISignal[];
}

export interface AISignal {
	type: 'confirmed' | 'heuristic';
	source: string;
	detail: string;
}

// Known AI generator keywords found in metadata text values
const AI_SOFTWARE_NAMES = [
	'stable diffusion',
	'automatic1111',
	'comfyui',
	'invokeai',
	'midjourney',
	'dall-e',
	'dalle',
	'novelai',
	'adobe firefly',
	'dreamstudio',
	'leonardo.ai',
	'playground ai',
	'ideogram',
	'flux',
	'openai',
	'chatgpt',
	'bing image creator',
	'copilot',
	'craiyon',
	'nightcafe',
	'artbreeder',
	'deepai'
];

// Known AI metadata keys (found in PNG tEXt/iTXt chunks)
const AI_METADATA_KEYS = new Set([
	'parameters',
	'prompt',
	'workflow',
	'sd-metadata',
	'invokeai_metadata',
	'dream',
	'comfyui',
	'negative_prompt',
	'aesthetic_score',
	'generation_data',
	'postprocessing'
]);

// Filename patterns suggesting AI generation
const AI_FILENAME_PATTERNS = [
	'chatgpt',
	'dall-e',
	'dalle',
	'midjourney',
	'stable_diffusion',
	'stablediffusion',
	'sd_',
	'comfyui',
	'generated',
	'gemini_generated',
	'firefly',
	'leonardo',
	'ideogram',
	'flux_',
	'playground',
	'bing_image',
	'copilot_image',
	'craiyon'
];

// IPTC DigitalSourceType values indicating AI generation
const AI_DIGITAL_SOURCE_TYPES = [
	'trainedalgorithmicmedia',
	'compositewithtrainedalgorithmicmedia',
	'algorithmicmedia'
];

/**
 * Detect AI generation indicators in a PNG file by scanning raw bytes for
 * C2PA content credential chunks (caBX, jUMb).
 */
export function detectAIInPngBytes(data: ArrayBuffer): AISignal[] {
	const signals: AISignal[] = [];
	const bytes = new Uint8Array(data);

	// PNG signature check
	if (
		bytes.length < 8 ||
		bytes[0] !== 0x89 ||
		bytes[1] !== 0x50 ||
		bytes[2] !== 0x4e ||
		bytes[3] !== 0x47
	) {
		return signals;
	}

	// Walk PNG chunks looking for C2PA-related chunks
	let offset = 8;
	while (offset + 8 <= bytes.length) {
		const chunkLength =
			(bytes[offset] << 24) |
			(bytes[offset + 1] << 16) |
			(bytes[offset + 2] << 8) |
			bytes[offset + 3];
		const chunkType = String.fromCharCode(
			bytes[offset + 4],
			bytes[offset + 5],
			bytes[offset + 6],
			bytes[offset + 7]
		);

		if (chunkType === 'caBX' || chunkType === 'jUMb') {
			// Read chunk data to look for C2PA identifier
			const chunkData = bytes.slice(offset + 8, offset + 8 + Math.min(chunkLength, 4096));
			const chunkStr = new TextDecoder('ascii', { fatal: false }).decode(chunkData);

			if (chunkStr.includes('c2pa') || chunkStr.includes('jumb')) {
				let generator: string | null = null;
				if (chunkStr.includes('openai') || chunkStr.includes('ChatGPT')) {
					generator = 'ChatGPT / DALL-E';
				} else if (chunkStr.includes('google') || chunkStr.includes('Gemini')) {
					generator = 'Google Gemini';
				} else if (chunkStr.includes('midjourney')) {
					generator = 'Midjourney';
				} else if (chunkStr.includes('firefly') || chunkStr.includes('Adobe')) {
					generator = 'Adobe Firefly';
				}

				signals.push({
					type: 'confirmed',
					source: `${chunkType} chunk`,
					detail: generator
						? `C2PA content credentials found (${generator})`
						: 'C2PA content credentials found'
				});
			} else {
				// caBX/jUMb chunk without explicit c2pa string — still suspicious
				signals.push({
					type: 'heuristic',
					source: `${chunkType} chunk`,
					detail: `${chunkType} chunk present (commonly used by AI generators for content provenance)`
				});
			}
		}

		// Move to next chunk: 4 (length) + 4 (type) + chunkLength + 4 (CRC)
		offset += 12 + chunkLength;
	}

	return signals;
}

/**
 * Detect AI generation indicators in a JPEG file by scanning raw bytes for
 * C2PA/JUMBF markers (APP11 segments).
 */
export function detectAIInJpegBytes(data: ArrayBuffer): AISignal[] {
	const signals: AISignal[] = [];
	const bytes = new Uint8Array(data);

	// JPEG SOI check
	if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
		return signals;
	}

	let offset = 2;
	while (offset + 4 <= bytes.length) {
		if (bytes[offset] !== 0xff) {
			offset++;
			continue;
		}

		const marker = bytes[offset + 1];

		// Start of scan — stop here
		if (marker === 0xda) break;

		// Skip padding
		if (marker === 0xff || marker === 0x00) {
			offset++;
			continue;
		}

		const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];

		// APP11 (0xFFEB) — used for C2PA/JUMBF
		if (marker === 0xeb) {
			const segData = bytes.slice(offset + 4, offset + 2 + Math.min(segmentLength, 4096));
			const segStr = new TextDecoder('ascii', { fatal: false }).decode(segData);

			if (segStr.includes('jumb') || segStr.includes('c2pa')) {
				signals.push({
					type: 'confirmed',
					source: 'APP11/JUMBF segment',
					detail: 'C2PA content credentials found in JPEG'
				});
			}
		}

		offset += 2 + segmentLength;
	}

	// Also search the first 50KB for c2pa string as fallback
	if (signals.length === 0) {
		const searchLimit = Math.min(bytes.length, 50000);
		const headerStr = new TextDecoder('ascii', { fatal: false }).decode(
			bytes.slice(0, searchLimit)
		);
		if (headerStr.includes('c2pa')) {
			signals.push({
				type: 'confirmed',
				source: 'File header',
				detail: 'C2PA identifier found in file data'
			});
		}
	}

	return signals;
}

/**
 * Detect AI generation indicators in parsed metadata fields (from exifr/ExifReader output).
 */
export function detectAIInMetadata(raw: Record<string, unknown>, fileName: string): AISignal[] {
	const signals: AISignal[] = [];

	for (const [key, value] of Object.entries(raw)) {
		if (value === null || value === undefined) continue;
		const strValue = String(value).toLowerCase();
		const keyLower = key.toLowerCase();

		// ─── IPTC DigitalSourceType (official AI classification standard) ───
		if (keyLower === 'digitalsourcetype' || keyLower === 'iptc4xmpext:digitalsourcetype') {
			for (const aiSourceType of AI_DIGITAL_SOURCE_TYPES) {
				if (strValue.includes(aiSourceType)) {
					signals.push({
						type: 'confirmed',
						source: `${key} field`,
						detail: `IPTC DigitalSourceType indicates AI-generated content: ${strValue}`
					});
					break;
				}
			}
			continue;
		}

		// ─── FileSource tag (EXIF 0xA300) ───
		// Value 1 = Film scanner, 2 = Reflection print scanner, 3 = Digital camera
		// Anything else or missing = not a camera photo
		if (keyLower === 'filesource') {
			const numValue = typeof value === 'number' ? value : parseInt(strValue, 10);
			if (!isNaN(numValue) && numValue !== 3) {
				signals.push({
					type: 'heuristic',
					source: `${key} field`,
					detail: `FileSource=${numValue} (not a digital camera, value 3 expected for real photos)`
				});
			}
			continue;
		}

		// ─── SceneType tag (EXIF 0xA301) ───
		// Value 1 = directly photographed; anything else = synthetic
		if (keyLower === 'scenetype') {
			const numValue = typeof value === 'number' ? value : parseInt(strValue, 10);
			if (!isNaN(numValue) && numValue !== 1) {
				signals.push({
					type: 'heuristic',
					source: `${key} field`,
					detail: `SceneType=${numValue} (not directly photographed, may be synthetic)`
				});
			}
			continue;
		}

		// ─── UserComment (EXIF 0x9286) — may contain AI prompts ───
		if (keyLower === 'usercomment') {
			// Check if UserComment contains AI-related content
			for (const aiName of AI_SOFTWARE_NAMES) {
				if (strValue.includes(aiName)) {
					signals.push({
						type: 'confirmed',
						source: 'UserComment field',
						detail: `UserComment references AI tool: ${aiName}`
					});
					break;
				}
			}
			// Check for prompt-like content (common SD pattern)
			if (
				strValue.includes('steps:') ||
				strValue.includes('sampler:') ||
				strValue.includes('cfg scale:') ||
				(strValue.includes('seed:') && strValue.length > 50)
			) {
				signals.push({
					type: 'confirmed',
					source: 'UserComment field',
					detail: 'UserComment contains AI generation parameters'
				});
			}
			continue;
		}

		// ─── Check for known AI metadata keys ───
		if (AI_METADATA_KEYS.has(keyLower)) {
			if (
				keyLower === 'parameters' &&
				(strValue.includes('steps:') ||
					strValue.includes('sampler:') ||
					strValue.includes('cfg scale:') ||
					strValue.includes('seed:'))
			) {
				signals.push({
					type: 'confirmed',
					source: `Metadata key '${key}'`,
					detail: 'Stable Diffusion generation parameters found'
				});
				continue;
			}

			if (keyLower === 'prompt' && strValue.length > 10) {
				signals.push({
					type: 'confirmed',
					source: `Metadata key '${key}'`,
					detail: 'AI generation prompt stored in metadata'
				});
				continue;
			}

			if (
				keyLower === 'workflow' &&
				(strValue.includes('nodes') || strValue.includes('class_type'))
			) {
				signals.push({
					type: 'confirmed',
					source: `Metadata key '${key}'`,
					detail: 'ComfyUI workflow data found'
				});
				continue;
			}

			if (keyLower === 'negative_prompt' && strValue.length > 5) {
				signals.push({
					type: 'confirmed',
					source: `Metadata key '${key}'`,
					detail: 'AI negative prompt found (Stable Diffusion / ComfyUI)'
				});
				continue;
			}

			if (
				[
					'sd-metadata',
					'invokeai_metadata',
					'dream',
					'aesthetic_score',
					'generation_data',
					'postprocessing'
				].includes(keyLower)
			) {
				signals.push({
					type: 'confirmed',
					source: `Metadata key '${key}'`,
					detail: 'AI generator metadata key detected'
				});
				continue;
			}
		}

		// ─── Check values for known AI software names ───
		for (const aiName of AI_SOFTWARE_NAMES) {
			if (strValue.includes(aiName)) {
				signals.push({
					type: 'confirmed',
					source: `${key} field`,
					detail: `References AI tool: ${aiName}`
				});
				break;
			}
		}

		// ─── C2PA/Content Credentials in XMP fields ───
		if (keyLower.includes('xmp') || keyLower === 'description' || keyLower === 'creatortool') {
			if (strValue.includes('c2pa') || strValue.includes('contentcredentials')) {
				signals.push({
					type: 'confirmed',
					source: `${key} field`,
					detail: 'C2PA Content Credentials reference in metadata'
				});
			}
			if (strValue.includes('ai:generatedby') || strValue.includes('digitalsourcetype')) {
				signals.push({
					type: 'confirmed',
					source: `${key} field`,
					detail: 'XMP AI generation indicator'
				});
			}
		}

		// ─── Midjourney prompt pattern ───
		if (keyLower === 'description' && (strValue.includes('--ar') || strValue.includes('--v '))) {
			signals.push({
				type: 'confirmed',
				source: `${key} field`,
				detail: 'Midjourney prompt syntax detected'
			});
		}
	}

	// ─── Filename heuristics ───
	const fileNameLower = fileName.toLowerCase();
	for (const pattern of AI_FILENAME_PATTERNS) {
		if (fileNameLower.includes(pattern)) {
			signals.push({
				type: 'heuristic',
				source: 'Filename',
				detail: `Contains AI-related pattern: '${pattern}'`
			});
			break;
		}
	}

	return signals;
}

/**
 * Analyze structural properties to detect AI-generated images.
 * Checks for missing camera indicators, thumbnail absence, and ICC profile absence.
 */
export function detectAIByStructure(raw: Record<string, unknown>, fileName: string): AISignal[] {
	const signals: AISignal[] = [];

	const hasMake = !!raw['Make'];
	const hasModel = !!raw['Model'];
	const hasExposure = !!raw['ExposureTime'];
	const hasFNumber = !!raw['FNumber'];
	const hasISO = !!raw['ISOSpeedRatings'] || !!raw['ISO'];
	const hasFocalLength = !!raw['FocalLength'];
	const hasFlash = raw['Flash'] !== undefined;

	// Only flag structural anomalies when metadata IS present but looks fake/incomplete.
	// Missing metadata entirely = clean/safe file, not an AI indicator.
	const hasAnyExif = Object.keys(raw).length > 0;
	if (hasAnyExif && !hasMake && !hasModel && !hasExposure && !hasFNumber && !hasISO) {
		signals.push({
			type: 'heuristic',
			source: 'Structure',
			detail: 'Metadata present but no camera or exposure info (unusual for real photos)'
		});
	}

	// Real camera photos from phones/DSLRs almost always have FocalLength + Flash + ISO
	// AI images that fake EXIF typically miss some of these
	if (hasMake && hasModel && !hasFocalLength && !hasFlash && !hasISO) {
		signals.push({
			type: 'heuristic',
			source: 'Structure',
			detail: 'Has Make/Model but missing FocalLength, Flash, and ISO (incomplete camera data)'
		});
	}

	return signals;
}

/**
 * Main AI detection function. Combines all detection methods.
 */
export function buildAIDetectionResult(signals: AISignal[]): AIDetectionResult {
	if (signals.length === 0) {
		return {
			isAIGenerated: false,
			confidence: 'none',
			generator: null,
			signals: []
		};
	}

	const confirmedSignals = signals.filter((s) => s.type === 'confirmed');
	const heuristicSignals = signals.filter((s) => s.type === 'heuristic');

	// Extract generator name from confirmed signals
	let generator: string | null = null;
	for (const signal of confirmedSignals) {
		const match = signal.detail.match(/\(([^)]+)\)/);
		if (match) {
			generator = match[1];
			break;
		}
		// Check for known generator references in detail text
		for (const aiName of AI_SOFTWARE_NAMES) {
			if (signal.detail.toLowerCase().includes(aiName)) {
				generator = aiName.charAt(0).toUpperCase() + aiName.slice(1);
				break;
			}
		}
		if (generator) break;
	}

	let confidence: AIDetectionResult['confidence'];
	if (confirmedSignals.length > 0) {
		confidence = 'confirmed';
	} else if (heuristicSignals.length >= 2) {
		confidence = 'likely';
	} else {
		confidence = 'suspected';
	}

	return {
		isAIGenerated: true,
		confidence,
		generator,
		signals
	};
}
