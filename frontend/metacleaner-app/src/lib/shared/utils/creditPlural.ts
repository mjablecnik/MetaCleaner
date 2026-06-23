export function creditLabel(count: number, locale: 'en' | 'cs'): string {
	if (locale === 'cs') {
		if (count === 1) return 'kredit';
		if (count >= 2 && count <= 4) return 'kredity';
		return 'kreditů';
	}
	return count === 1 ? 'credit' : 'credits';
}
