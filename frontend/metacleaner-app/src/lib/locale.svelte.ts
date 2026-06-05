import { setLocale as paraglideSetLocale, getLocale, locales } from '$lib/paraglide/runtime';

export const locale = $state({ current: 'en' });

export function initLocale(): void {
	if (typeof localStorage === 'undefined') return;
	const stored = localStorage.getItem('PARAGLIDE_LOCALE');
	const value = stored && (locales as readonly string[]).includes(stored) ? stored : getLocale();
	paraglideSetLocale(value as 'en' | 'cs', { reload: false });
	locale.current = value;
}

export function switchLocale(lang: string): void {
	paraglideSetLocale(lang as 'en' | 'cs', { reload: false });
	localStorage.setItem('PARAGLIDE_LOCALE', lang);
	locale.current = lang;
}
