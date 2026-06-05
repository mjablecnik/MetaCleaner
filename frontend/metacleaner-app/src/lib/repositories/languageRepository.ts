export interface Language {
	code: string;
	flag: string;
	label: string;
	name: string;
}

export async function getLanguages(): Promise<Language[]> {
	return [
		{ code: 'cs', flag: '/flags/cs.svg', label: 'CS', name: 'Čeština' },
		{ code: 'en', flag: '/flags/en.svg', label: 'EN', name: 'English' },
		{ code: 'de', flag: '/flags/de.svg', label: 'DE', name: 'Deutsch' },
		{ code: 'sk', flag: '/flags/sk.svg', label: 'SK', name: 'Slovenčina' }
	];
}
