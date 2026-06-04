export type FileType = 'image' | 'video';

export interface UploadedFile {
	id: string;
	name: string;
	size: string;
	extension: string;
	type: FileType;
	metadataFieldCount: number;
	hasGps: boolean;
	device?: string;
}

export async function getUploadedFiles(): Promise<UploadedFile[]> {
	return [
		{
			id: 'img-4821',
			name: 'IMG_4821.jpg',
			size: '3.2 MB',
			extension: 'JPG',
			type: 'image',
			metadataFieldCount: 12,
			hasGps: false,
			device: 'Canon EOS R5'
		},
		{
			id: 'photo-holiday-2024',
			name: 'photo_holiday_2024.heic',
			size: '8.7 MB',
			extension: 'HEIC',
			type: 'image',
			metadataFieldCount: 18,
			hasGps: true,
			device: 'iPhone 15 Pro'
		},
		{
			id: 'video-prague-walk',
			name: 'video_prague_walk.mp4',
			size: '142.5 MB',
			extension: 'MP4',
			type: 'video',
			metadataFieldCount: 8,
			hasGps: false,
			device: 'H.264'
		},
		{
			id: 'screenshot-map',
			name: 'screenshot_map.png',
			size: '1.1 MB',
			extension: 'PNG',
			type: 'image',
			metadataFieldCount: 3,
			hasGps: false
		}
	];
}
