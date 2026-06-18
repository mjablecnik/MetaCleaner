export interface MetadataField {
	icon: string;
	labelKey: string;
	value: string;
}

export interface CleanedField {
	icon: string;
	labelKey: string;
}

const metadataFields: MetadataField[] = [
	{ icon: 'fa-location-dot', labelKey: 'meta_field_gps', value: '50.0755°N, 14.4378°E' },
	{ icon: 'fa-mobile-screen', labelKey: 'meta_field_device', value: 'Apple iPhone 15 Pro' },
	{ icon: 'fa-calendar', labelKey: 'meta_field_datetime', value: '2024-03-15 14:32:07' },
	{ icon: 'fa-user', labelKey: 'meta_field_author', value: 'Jan Novák' },
	{ icon: 'fa-camera', labelKey: 'meta_field_camera', value: 'f/1.8 · 1/120s · ISO 64' }
];

export function getMetadataFields(): MetadataField[] {
	return metadataFields;
}

export function getCleanedFields(): CleanedField[] {
	return metadataFields.map(({ icon, labelKey }) => ({ icon, labelKey }));
}
