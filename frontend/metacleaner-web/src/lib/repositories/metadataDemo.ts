export interface MetadataField {
	icon: string;
	labelKey: string;
	value: string;
}

export interface CleanedField {
	icon: string;
	labelKey: string;
}

const desktopFields: MetadataField[] = [
	{ icon: 'fa-location-dot', labelKey: 'meta_field_gps', value: '50.0755°N, 14.4378°E' },
	{ icon: 'fa-mobile-screen', labelKey: 'meta_field_device', value: 'Apple iPhone 15 Pro' },
	{ icon: 'fa-calendar', labelKey: 'meta_field_datetime', value: '2024-03-15 14:32:07' },
	{ icon: 'fa-user', labelKey: 'meta_field_author', value: 'Jan Novák' },
	{ icon: 'fa-camera', labelKey: 'meta_field_camera', value: 'f/1.8 · 1/120s · ISO 64' }
];

const mobileFields: MetadataField[] = [
	{ icon: 'fa-location-dot', labelKey: 'meta_field_gps_short', value: '50.07°N, 14.43°E' },
	{ icon: 'fa-mobile-screen', labelKey: 'meta_field_device_short', value: 'iPhone 15 Pro' },
	{ icon: 'fa-calendar', labelKey: 'meta_field_datetime_short', value: '2024-03-15 14:32' },
	{ icon: 'fa-user', labelKey: 'meta_field_author_short', value: 'Jan Novák' }
];

export function getMetadataFields(layout: 'desktop' | 'mobile'): MetadataField[] {
	return layout === 'desktop' ? desktopFields : mobileFields;
}

export function getCleanedFields(layout: 'desktop' | 'mobile'): CleanedField[] {
	return getMetadataFields(layout).map(({ icon, labelKey }) => ({ icon, labelKey }));
}
