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
	gps: 0.4,
	deviceIdentity: 0.25,
	personalData: 0.2,
	timestamps: 0.15
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
