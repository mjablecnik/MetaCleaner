export interface Language {
	code: string;
	flag: string;
	label: string;
	name: string;
}

export async function getLanguages(): Promise<Language[]> {
	return [
		{ code: 'cs', flag: '🇨🇿', label: 'CS', name: 'Čeština' },
		{ code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
		{ code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
		{ code: 'sk', flag: '🇸🇰', label: 'SK', name: 'Slovenčina' }
	];
}
