import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock references so they are available when vi.mock factories run.
const { mockSetLocale, mockGetLocale } = vi.hoisted(() => ({
	mockSetLocale: vi.fn(),
	mockGetLocale: vi.fn(() => 'en')
}));

// Mock the Paraglide runtime — match the import path used in locale.svelte.ts exactly.
vi.mock('$lib/paraglide/runtime', () => ({
	setLocale: mockSetLocale,
	getLocale: mockGetLocale,
	locales: ['en', 'cs'] as const
}));

async function importFresh() {
	return import('$lib/locale.svelte.js');
}

function makeMockStorage() {
	const store: Record<string, string> = {};
	return {
		getItem: (key: string): string | null => store[key] ?? null,
		setItem: (key: string, val: string) => {
			store[key] = val;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		get _store() {
			return store;
		}
	};
}

type MockStorage = ReturnType<typeof makeMockStorage>;

describe('locale.svelte.ts', () => {
	let mockStorage: MockStorage;

	beforeEach(() => {
		vi.resetModules();
		mockStorage = makeMockStorage();
		vi.stubGlobal('localStorage', mockStorage);
		mockSetLocale.mockClear();
		mockGetLocale.mockClear();
		mockGetLocale.mockReturnValue('en');
	});

	// ─── initLocale ────────────────────────────────────────────────────────────

	describe('initLocale', () => {
		it('uses the locale stored in localStorage when it is valid', async () => {
			mockStorage.setItem('PARAGLIDE_LOCALE', 'cs');
			const { initLocale, locale } = await importFresh();

			initLocale();

			expect(locale.current).toBe('cs');
			expect(mockSetLocale).toHaveBeenCalledOnce();
			expect(mockSetLocale).toHaveBeenCalledWith('cs', { reload: false });
		});

		it('falls back to getLocale() when localStorage is empty', async () => {
			mockGetLocale.mockReturnValue('en');
			const { initLocale, locale } = await importFresh();

			initLocale();

			expect(locale.current).toBe('en');
			expect(mockSetLocale).toHaveBeenCalledWith('en', { reload: false });
		});

		it('falls back to getLocale() when stored locale is not in the locales list', async () => {
			mockStorage.setItem('PARAGLIDE_LOCALE', 'de'); // not in ['en', 'cs']
			mockGetLocale.mockReturnValue('en');
			const { initLocale, locale } = await importFresh();

			initLocale();

			expect(locale.current).toBe('en');
			expect(mockSetLocale).toHaveBeenCalledWith('en', { reload: false });
		});

		it('falls back to getLocale() when stored value is an empty string', async () => {
			mockStorage.setItem('PARAGLIDE_LOCALE', '');
			mockGetLocale.mockReturnValue('cs');
			const { initLocale, locale } = await importFresh();

			initLocale();

			// empty string is falsy — condition `stored && includes(stored)` is false
			expect(locale.current).toBe('cs');
		});

		it('does not mutate locale when localStorage is unavailable (SSR guard)', async () => {
			vi.stubGlobal('localStorage', undefined);
			const { initLocale, locale } = await importFresh();
			const before = locale.current;

			initLocale();

			expect(locale.current).toBe(before);
			expect(mockSetLocale).not.toHaveBeenCalled();
		});

		it('prefers the stored locale over the current Paraglide locale', async () => {
			mockStorage.setItem('PARAGLIDE_LOCALE', 'cs');
			mockGetLocale.mockReturnValue('en'); // runtime says 'en'
			const { initLocale, locale } = await importFresh();

			initLocale();

			expect(locale.current).toBe('cs'); // stored wins
		});
	});

	// ─── switchLocale ──────────────────────────────────────────────────────────

	describe('switchLocale', () => {
		it('updates locale.current to the new language', async () => {
			const { switchLocale, locale } = await importFresh();

			switchLocale('cs');

			expect(locale.current).toBe('cs');
		});

		it('persists the selected locale to localStorage', async () => {
			const { switchLocale } = await importFresh();

			switchLocale('cs');

			expect(mockStorage._store['PARAGLIDE_LOCALE']).toBe('cs');
		});

		it('calls paraglideSetLocale with the new language and reload:false', async () => {
			const { switchLocale } = await importFresh();

			switchLocale('cs');

			expect(mockSetLocale).toHaveBeenCalledOnce();
			expect(mockSetLocale).toHaveBeenCalledWith('cs', { reload: false });
		});

		it('can switch back from cs to en', async () => {
			const { switchLocale, locale } = await importFresh();

			switchLocale('cs');
			expect(locale.current).toBe('cs');

			switchLocale('en');
			expect(locale.current).toBe('en');
			expect(mockStorage._store['PARAGLIDE_LOCALE']).toBe('en');
		});

		it('calls setLocale on every switch (not deduplicated)', async () => {
			const { switchLocale } = await importFresh();

			switchLocale('cs');
			switchLocale('cs'); // same value
			switchLocale('en');

			expect(mockSetLocale).toHaveBeenCalledTimes(3);
		});
	});
});
