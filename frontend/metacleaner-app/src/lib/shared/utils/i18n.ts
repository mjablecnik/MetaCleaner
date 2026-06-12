import { locale } from '$lib/locale.svelte';
import * as m from '$lib/paraglide/messages';

export function tx(key: string, params?: Record<string, unknown>): string {
	void locale.current;
	const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[
		key
	];
	if (!fn) return key;
	return params && Object.keys(params).length > 0 ? fn(params) : (fn as unknown as () => string)();
}
