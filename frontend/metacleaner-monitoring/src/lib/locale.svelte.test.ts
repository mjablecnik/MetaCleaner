const { mockSetLocale, mockGetLocale, mockLocales } = vi.hoisted(() => ({
	mockSetLocale: vi.fn(),
	mockGetLocale: vi.fn(() => 'en'),
	mockLocales: ['en', 'cs'] as string[]
}));

vi.mock('$lib/paraglide/runtime', () => ({
	setLocale: mockSetLocale,
	getLocale: mockGetLocale,
	locales: mockLocales
}));

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { locale, initLocale, switchLocale } from './locale.svelte.js';

beforeEach(() => {
	mockSetLocale.mockClear();
	mockGetLocale.mockClear();
	mockGetLocale.mockReturnValue('en');
	localStorage.clear();
	locale.current = 'en';
});

afterEach(() => {
	vi.unstubAllGlobals();
	localStorage.clear();
});

describe('initLocale — no stored value', () => {
	it('falls back to getLocale() when nothing is stored', () => {
		mockGetLocale.mockReturnValue('en');
		initLocale();
		expect(mockSetLocale).toHaveBeenCalledWith('en', { reload: false });
	});

	it('sets locale.current to the value from getLocale()', () => {
		mockGetLocale.mockReturnValue('cs');
		initLocale();
		expect(locale.current).toBe('cs');
	});
});

describe('initLocale — valid stored locale', () => {
	it('applies a valid stored locale', () => {
		localStorage.setItem('monitorly-locale', 'cs');
		initLocale();
		expect(mockSetLocale).toHaveBeenCalledWith('cs', { reload: false });
	});

	it('sets locale.current to the stored value', () => {
		localStorage.setItem('monitorly-locale', 'cs');
		initLocale();
		expect(locale.current).toBe('cs');
	});

	it('does not fall back to getLocale() for a valid stored locale', () => {
		localStorage.setItem('monitorly-locale', 'en');
		initLocale();
		expect(mockGetLocale).not.toHaveBeenCalled();
	});
});

describe('initLocale — invalid stored locale', () => {
	it('falls back to getLocale() when stored value is not in locales list', () => {
		localStorage.setItem('monitorly-locale', 'de');
		mockGetLocale.mockReturnValue('en');
		initLocale();
		expect(mockGetLocale).toHaveBeenCalled();
		expect(mockSetLocale).toHaveBeenCalledWith('en', { reload: false });
	});

	it('sets locale.current to the getLocale() fallback for invalid stored locale', () => {
		localStorage.setItem('monitorly-locale', 'invalid');
		mockGetLocale.mockReturnValue('en');
		initLocale();
		expect(locale.current).toBe('en');
	});
});

describe('initLocale — no localStorage available', () => {
	it('returns early without throwing when localStorage is not available', () => {
		vi.stubGlobal('localStorage', undefined);
		expect(() => initLocale()).not.toThrow();
	});

	it('does not call setLocale when localStorage is not available', () => {
		vi.stubGlobal('localStorage', undefined);
		initLocale();
		expect(mockSetLocale).not.toHaveBeenCalled();
	});
});

describe('switchLocale', () => {
	it('calls paraglide setLocale with the given lang and reload:false', () => {
		switchLocale('cs');
		expect(mockSetLocale).toHaveBeenCalledWith('cs', { reload: false });
	});

	it('writes the lang to localStorage under monitorly-locale', () => {
		switchLocale('cs');
		expect(localStorage.getItem('monitorly-locale')).toBe('cs');
	});

	it('updates locale.current to the given lang', () => {
		switchLocale('cs');
		expect(locale.current).toBe('cs');
	});

	it('handles switching back to en', () => {
		locale.current = 'cs';
		switchLocale('en');
		expect(locale.current).toBe('en');
		expect(localStorage.getItem('monitorly-locale')).toBe('en');
		expect(mockSetLocale).toHaveBeenCalledWith('en', { reload: false });
	});
});
