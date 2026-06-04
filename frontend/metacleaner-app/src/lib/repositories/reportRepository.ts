export type ReportIconColor = 'green' | 'blue' | 'orange';
export type ReportFileType = 'image' | 'video';

export interface Report {
	id: string;
	date: string;
	time: string;
	duration: string;
	fileCount: number;
	fileTypes: string;
	type: ReportFileType;
	gps: boolean;
	fields: number;
	fieldsColor?: 'orange' | 'white';
	tags: string[];
	reportId: string;
	iconColor: ReportIconColor;
}

export interface ReportSummaryStats {
	totalReports: number;
	fieldsRemoved: number;
	filesProcessed: number;
	gpsRemoved: number;
}

export interface MetadataField {
	label: string;
	value: string;
	moreCount?: number;
}

export interface FileMetadataSection {
	gpsFields: MetadataField[];
	exifFields: MetadataField[];
	xmpFields: MetadataField[];
	totalRemoved: number;
}

export interface ReportFileDetail {
	name: string;
	extension: string;
	sizeMB: string;
	format: string;
	device: string;
	type: 'image' | 'video';
	iconColor: ReportIconColor;
	hasGps: boolean;
	fieldsRemoved: number;
	barWidthPercent: number;
	barGradientFrom: string;
	barGradientTo: string;
	metadata: FileMetadataSection;
}

export interface ChartDataPoint {
	label: string;
	fields: number;
	percentage: number;
}

export interface ReportDetail {
	reportId: string;
	date: string;
	filesProcessed: number;
	fieldsRemoved: number;
	gpsLocationsRemoved: number;
	totalTimeSeconds: number;
	chartData: ChartDataPoint[];
	files: ReportFileDetail[];
}

export async function getReports(): Promise<Report[]> {
	return [
		{
			id: '#A1',
			date: '2. 6. 2025',
			time: '10:22',
			duration: '28s',
			fileCount: 4,
			fileTypes: 'JPG, HEIC, MP4',
			type: 'image',
			gps: true,
			fields: 87,
			tags: ['GPS', 'EXIF', 'XMP'],
			reportId: 'MCR-2025-0602-A1',
			iconColor: 'green'
		},
		{
			id: '#B2',
			date: '29. 5. 2025',
			time: '14:05',
			duration: '12s',
			fileCount: 2,
			fileTypes: 'PNG, WEBP',
			type: 'image',
			gps: false,
			fields: 34,
			tags: ['EXIF', 'XMP'],
			reportId: 'MCR-2025-0529-B2',
			iconColor: 'blue'
		},
		{
			id: '#C3',
			date: '25. 5. 2025',
			time: '09:17',
			duration: '1m 42s',
			fileCount: 1,
			fileTypes: 'MP4',
			type: 'video',
			gps: true,
			fields: 156,
			fieldsColor: 'orange',
			tags: ['GPS', 'EXIF'],
			reportId: 'MCR-2025-0525-C3',
			iconColor: 'orange'
		},
		{
			id: '#D4',
			date: '20. 5. 2025',
			time: '16:44',
			duration: '55s',
			fileCount: 7,
			fileTypes: 'JPG, HEIC',
			type: 'image',
			gps: true,
			fields: 203,
			tags: ['GPS', 'EXIF', 'XMP'],
			reportId: 'MCR-2025-0520-D4',
			iconColor: 'green'
		},
		{
			id: '#E5',
			date: '15. 5. 2025',
			time: '11:30',
			duration: '18s',
			fileCount: 3,
			fileTypes: 'PNG, JPG',
			type: 'image',
			gps: false,
			fields: 45,
			tags: ['EXIF', 'XMP'],
			reportId: 'MCR-2025-0515-E5',
			iconColor: 'blue'
		},
		{
			id: '#F6',
			date: '10. 5. 2025',
			time: '08:55',
			duration: '2m 15s',
			fileCount: 2,
			fileTypes: 'MP4, MOV',
			type: 'video',
			gps: true,
			fields: 289,
			fieldsColor: 'orange',
			tags: ['GPS', 'EXIF'],
			reportId: 'MCR-2025-0510-F6',
			iconColor: 'orange'
		},
		{
			id: '#G7',
			date: '5. 5. 2025',
			time: '19:42',
			duration: '9s',
			fileCount: 1,
			fileTypes: 'HEIC',
			type: 'image',
			gps: true,
			fields: 22,
			tags: ['GPS', 'EXIF'],
			reportId: 'MCR-2025-0505-G7',
			iconColor: 'green'
		},
		{
			id: '#H8',
			date: '28. 4. 2025',
			time: '14:11',
			duration: '35s',
			fileCount: 5,
			fileTypes: 'JPG',
			type: 'image',
			gps: false,
			fields: 78,
			tags: ['EXIF', 'XMP'],
			reportId: 'MCR-2025-0428-H8',
			iconColor: 'blue'
		},
		{
			id: '#I9',
			date: '20. 4. 2025',
			time: '10:05',
			duration: '1m 8s',
			fileCount: 3,
			fileTypes: 'MP4',
			type: 'video',
			gps: true,
			fields: 134,
			fieldsColor: 'orange',
			tags: ['GPS', 'EXIF'],
			reportId: 'MCR-2025-0420-I9',
			iconColor: 'orange'
		},
		{
			id: '#J10',
			date: '12. 4. 2025',
			time: '16:22',
			duration: '42s',
			fileCount: 6,
			fileTypes: 'JPG, PNG',
			type: 'image',
			gps: true,
			fields: 99,
			tags: ['GPS', 'EXIF', 'XMP'],
			reportId: 'MCR-2025-0412-J10',
			iconColor: 'green'
		},
		{
			id: '#K11',
			date: '3. 4. 2025',
			time: '09:14',
			duration: '5s',
			fileCount: 1,
			fileTypes: 'PNG',
			type: 'image',
			gps: false,
			fields: 11,
			tags: ['XMP'],
			reportId: 'MCR-2025-0403-K11',
			iconColor: 'blue'
		},
		{
			id: '#L12',
			date: '25. 3. 2025',
			time: '17:30',
			duration: '58s',
			fileCount: 4,
			fileTypes: 'HEIC, MP4',
			type: 'video',
			gps: true,
			fields: 170,
			fieldsColor: 'orange',
			tags: ['GPS', 'EXIF', 'XMP'],
			reportId: 'MCR-2025-0325-L12',
			iconColor: 'orange'
		}
	];
}

export async function getSummaryStats(): Promise<ReportSummaryStats> {
	return {
		totalReports: 12,
		fieldsRemoved: 1248,
		filesProcessed: 47,
		gpsRemoved: 31
	};
}

export async function getReportDetail(id?: string): Promise<ReportDetail> {
	return {
		reportId: '#MCR-2025-0602-A1',
		date: '2. 6. 2025, 10:22',
		filesProcessed: 4,
		fieldsRemoved: 87,
		gpsLocationsRemoved: 3,
		totalTimeSeconds: 28,
		chartData: [
			{ label: 'GPS', fields: 9, percentage: 10 },
			{ label: 'EXIF', fields: 51, percentage: 59 },
			{ label: 'XMP', fields: 27, percentage: 31 }
		],
		files: [
			{
				name: 'IMG_4821.jpg',
				extension: 'JPG',
				sizeMB: '3.2',
				format: 'JPEG',
				device: 'Canon EOS R5',
				type: 'image',
				iconColor: 'green',
				hasGps: true,
				fieldsRemoved: 12,
				barWidthPercent: 14,
				barGradientFrom: 'brand-green',
				barGradientTo: 'green-400',
				metadata: {
					gpsFields: [
						{ label: 'GPS Latitude', value: '50.0755° N' },
						{ label: 'GPS Longitude', value: '14.4378° E' },
						{ label: 'GPS Altitude', value: '202 m' }
					],
					exifFields: [
						{ label: 'Make', value: 'Canon' },
						{ label: 'Model', value: 'EOS R5' },
						{ label: 'DateTime', value: '2024:08:14' },
						{ label: 'Software', value: 'Canon DPP' },
						{ label: '', value: '', moreCount: 5 }
					],
					xmpFields: [
						{ label: 'Creator', value: 'Jana N.' },
						{ label: 'Rights', value: '© 2024' },
						{ label: 'Description', value: 'Praha foto' },
						{ label: '', value: '', moreCount: 1 }
					],
					totalRemoved: 12
				}
			},
			{
				name: 'photo_holiday_2024.heic',
				extension: 'HEIC',
				sizeMB: '8.7',
				format: 'HEIC',
				device: 'iPhone 15 Pro',
				type: 'image',
				iconColor: 'green',
				hasGps: true,
				fieldsRemoved: 18,
				barWidthPercent: 21,
				barGradientFrom: 'brand-blue',
				barGradientTo: 'blue-400',
				metadata: {
					gpsFields: [
						{ label: 'GPS Latitude', value: '48.8566° N' },
						{ label: 'GPS Longitude', value: '2.3522° E' },
						{ label: 'GPS Speed', value: '0 km/h' }
					],
					exifFields: [
						{ label: 'Make', value: 'Apple' },
						{ label: 'Model', value: 'iPhone 15 Pro' },
						{ label: 'Lens', value: '2.2mm f/2.2' },
						{ label: 'DateTime', value: '2024:07:22' },
						{ label: '', value: '', moreCount: 8 }
					],
					xmpFields: [
						{ label: 'Subject', value: 'Dovolená' },
						{ label: 'Rating', value: '5' },
						{ label: 'Label', value: 'Red' },
						{ label: '', value: '', moreCount: 3 }
					],
					totalRemoved: 18
				}
			},
			{
				name: 'video_prague_walk.mp4',
				extension: 'MP4',
				sizeMB: '142',
				format: 'MP4',
				device: 'H.264',
				type: 'video',
				iconColor: 'orange',
				hasGps: true,
				fieldsRemoved: 43,
				barWidthPercent: 49,
				barGradientFrom: 'brand-orange',
				barGradientTo: 'orange-400',
				metadata: {
					gpsFields: [
						{ label: 'GPS Latitude', value: '50.0500° N' },
						{ label: 'GPS Longitude', value: '14.4000° E' },
						{ label: 'GPS Altitude', value: '150 m' }
					],
					exifFields: [
						{ label: 'Make', value: 'Canon' },
						{ label: 'Model', value: 'EOS R5' },
						{ label: 'DateTime', value: '2024:07:20' },
						{ label: 'Software', value: 'Canon DPP' },
						{ label: '', value: '', moreCount: 20 }
					],
					xmpFields: [
						{ label: 'Creator', value: 'Jana N.' },
						{ label: 'Rights', value: '© 2024' },
						{ label: 'Description', value: 'Praha video' },
						{ label: '', value: '', moreCount: 10 }
					],
					totalRemoved: 43
				}
			},
			{
				name: 'IMG_4822.jpg',
				extension: 'JPG',
				sizeMB: '3.2',
				format: 'JPEG',
				device: 'Canon EOS R5',
				type: 'image',
				iconColor: 'green',
				hasGps: true,
				fieldsRemoved: 14,
				barWidthPercent: 16,
				barGradientFrom: 'brand-green',
				barGradientTo: 'green-400',
				metadata: {
					gpsFields: [
						{ label: 'GPS Latitude', value: '50.0755° N' },
						{ label: 'GPS Longitude', value: '14.4378° E' },
						{ label: 'GPS Altitude', value: '202 m' }
					],
					exifFields: [
						{ label: 'Make', value: 'Canon' },
						{ label: 'Model', value: 'EOS R5' },
						{ label: 'DateTime', value: '2024:08:14' },
						{ label: 'Software', value: 'Canon DPP' },
						{ label: '', value: '', moreCount: 5 }
					],
					xmpFields: [
						{ label: 'Creator', value: 'Jana N.' },
						{ label: 'Rights', value: '© 2024' },
						{ label: 'Description', value: 'Praha foto' },
						{ label: '', value: '', moreCount: 1 }
					],
					totalRemoved: 14
				}
			}
		]
	};
}
