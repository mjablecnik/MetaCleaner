import * as m from '$lib/paraglide/messages';

export function t(key: string): string {
	const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
	if (!fn) {
		console.warn(`[i18n] Missing message key: "${key}"`);
		return key;
	}
	return fn();
}
