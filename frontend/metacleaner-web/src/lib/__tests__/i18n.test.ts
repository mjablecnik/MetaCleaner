import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the paraglide messages module before importing i18n.
// Include an explicit undefined entry for the unknown key so Vitest's strict
// module namespace does not throw when i18n.t() accesses it.
vi.mock('$lib/paraglide/messages', () => ({
	some_key: () => 'Hello',
	unknown_key: undefined
}));

import { t } from '$lib/i18n';

describe('t()', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns the resolved message string for a known key', () => {
		const result = t('some_key');
		expect(result).toBe('Hello');
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it('returns the key verbatim for an unknown key', () => {
		const result = t('unknown_key');
		expect(result).toBe('unknown_key');
	});

	it('calls console.warn exactly once with the missing-key text for an unknown key', () => {
		t('unknown_key');
		expect(warnSpy).toHaveBeenCalledOnce();
		expect(warnSpy).toHaveBeenCalledWith('[i18n] Missing message key: "unknown_key"');
	});
});
