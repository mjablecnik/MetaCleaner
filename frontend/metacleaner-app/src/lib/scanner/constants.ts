// --- Pattern-based field categorization ---

// Prefixes/patterns that identify GPS-related metadata
const GPS_PATTERNS = [/^GPS/i];

// Exact keys and patterns for device identity
const DEVICE_EXACT = new Set([
	'Make',
	'Model',
	'LensMake',
	'LensModel',
	'Software',
	'HostComputer',
	'UniqueCameraModel',
	'CameraModelName'
]);
const DEVICE_PATTERNS = [/serial/i, /^Device/i, /^Lens(?!Info)/i, /BodySerialNumber/i];

// Exact keys and patterns for personal/identifiable data
const PERSONAL_EXACT = new Set([
	'Artist',
	'Copyright',
	'Creator',
	'XPAuthor',
	'XPComment',
	'XPKeywords',
	'XPSubject',
	'OwnerName',
	'CameraOwnerName',
	'ImageDescription',
	'UserComment',
	'ProfileCopyright',
	'ContactInfo',
	'PersonInImage',
	'UsageTerms',
	'WebStatement',
	'Credit',
	'Source'
]);
const PERSONAL_PATTERNS = [/^Owner/i, /^By-line/i, /^dc:creator/i, /^dc:rights/i, /^xmpRights/i, /^photoshop:Credit/i, /^photoshop:AuthorsPosition/i];

// Exact keys and patterns for timestamps
const TIMESTAMP_EXACT = new Set([
	'DateTimeOriginal',
	'DateTimeDigitized',
	'CreateDate',
	'ModifyDate',
	'DateTime',
	'GPSDateStamp',
	'GPSTimeStamp',
	'OffsetTimeOriginal',
	'OffsetTimeDigitized',
	'OffsetTime',
	'SubSecTimeOriginal',
	'SubSecTimeDigitized',
	'SubSecTime',
	'SubSecDateTimeOriginal',
	'MetadataDate',
	'DateCreated'
]);
const TIMESTAMP_PATTERNS = [/^SubSec/i, /^photoshop:DateCreated/i];

export type FieldCategory = 'gps' | 'deviceIdentity' | 'personalData' | 'timestamps';

/**
 * Categorizes a metadata field key using pattern matching.
 * Returns the risk category or null if the field is not privacy-relevant.
 */
export function categorizeField(key: string): FieldCategory | null {
	// GPS — anything starting with GPS prefix
	for (const pattern of GPS_PATTERNS) {
		if (pattern.test(key)) return 'gps';
	}

	// Device identity — exact match or pattern
	if (DEVICE_EXACT.has(key)) return 'deviceIdentity';
	for (const pattern of DEVICE_PATTERNS) {
		if (pattern.test(key)) return 'deviceIdentity';
	}

	// Personal data — exact match or pattern
	if (PERSONAL_EXACT.has(key)) return 'personalData';
	for (const pattern of PERSONAL_PATTERNS) {
		if (pattern.test(key)) return 'personalData';
	}

	// Timestamps — exact match or pattern
	if (TIMESTAMP_EXACT.has(key)) return 'timestamps';
	for (const pattern of TIMESTAMP_PATTERNS) {
		if (pattern.test(key)) return 'timestamps';
	}

	return null;
}

// Reference lists used by riskAnalyzer to compute category saturation scores.
// These represent the "most common" fields per category for scoring purposes.
export const GPS_FIELDS = ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSPosition'];
export const DEVICE_FIELDS = ['Make', 'Model', 'SerialNumber', 'Software', 'LensModel'];
export const PERSONAL_FIELDS = ['Artist', 'Copyright', 'XPAuthor', 'Creator', 'ContactInfo'];
export const TIMESTAMP_FIELDS = [
	'DateTimeOriginal',
	'DateTimeDigitized',
	'GPSDateStamp',
	'CreateDate'
];

export const CATEGORY_WEIGHTS = {
	gps: 0.3,
	deviceIdentity: 0.2,
	personalData: 0.25,
	timestamps: 0.25,
	aiOrigin: 0.65
} as const;

export const SEVERITY_THRESHOLDS = {
	critical: 75,
	high: 50,
	medium: 25,
	low: 0
} as const;

export const FILE_SIZE_THRESHOLD = 200 * 1024 * 1024; // 200MB
export const MAX_IMAGE_HEADER_BYTES = 512 * 1024; // 512KB
export const MAX_VIDEO_HEADER_BYTES = 2 * 1024 * 1024; // 2MB

export const IMAGE_EXTENSIONS: Record<string, string> = {
	'.jpg': 'jpeg',
	'.jpeg': 'jpeg',
	'.png': 'png',
	'.heic': 'heic',
	'.heif': 'heif',
	'.avif': 'avif',
	'.tiff': 'tiff',
	'.tif': 'tiff',
	'.dng': 'dng',
	'.webp': 'webp',
	'.gif': 'gif'
};

export const VIDEO_EXTENSIONS: Record<string, string> = {
	'.mp4': 'mp4',
	'.m4v': 'mp4',
	'.mov': 'mov',
	'.avi': 'avi',
	'.mkv': 'mkv',
	'.webm': 'webm',
	'.wmv': 'wmv',
	'.flv': 'flv',
	'.3gp': '3gp',
	'.mpg': 'mpeg',
	'.mpeg': 'mpeg',
	'.ogv': 'ogv',
	'.mts': 'mts',
	'.m2ts': 'mts'
};
