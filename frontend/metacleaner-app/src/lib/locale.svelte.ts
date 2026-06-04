import { setLocale as paraglideSetLocale, getLocale, locales } from '$lib/paraglide/runtime';

export let currentLocale = $state<string>('en');

export function initLocale(): void {
	if (typeof localStorage === 'undefined') return;
	const stored = localStorage.getItem('PARAGLIDE_LOCALE');
	const locale =
		stored && (locales as readonly string[]).includes(stored) ? stored : getLocale();
	paraglideSetLocale(locale as 'en' | 'cs', { reload: false });
	currentLocale = locale;
}

export function switchLocale(lang: string): void {
	paraglideSetLocale(lang as 'en' | 'cs', { reload: false });
	localStorage.setItem('PARAGLIDE_LOCALE', lang);
	currentLocale = lang;
}
