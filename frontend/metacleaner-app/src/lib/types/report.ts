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
