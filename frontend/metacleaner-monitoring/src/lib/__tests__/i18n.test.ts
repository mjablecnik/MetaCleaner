// Absent keys must be listed explicitly as undefined to avoid vitest strict-module-namespace errors.
// See: vitest strict mock — arbitrary key access on mocked modules throws (MEMORY).
const { mockFnNoParams, mockFnWithParams } = vi.hoisted(() => ({
	mockFnNoParams: vi.fn(() => 'hello world'),
	mockFnWithParams: vi.fn((p: Record<string, unknown>) => `hello ${p.name}`)
}));

vi.mock('$lib/paraglide/messages', () => ({
	known_no_params: mockFnNoParams,
	known_with_params: mockFnWithParams,
	unknown_key: undefined
}));

vi.mock('$lib/locale.svelte', () => ({
	locale: { current: 'en' }
}));

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { t } from '../i18n.js';

beforeEach(() => {
	mockFnNoParams.mockClear();
	mockFnWithParams.mockClear();
});

describe('t() — unknown key', () => {
	it('returns the key string unchanged when key is not in messages', () => {
		expect(t('unknown_key')).toBe('unknown_key');
	});

	it('does not call any message function for unknown key', () => {
		t('unknown_key');
		expect(mockFnNoParams).not.toHaveBeenCalled();
		expect(mockFnWithParams).not.toHaveBeenCalled();
	});
});

describe('t() — known key without params', () => {
	it('returns the string from the message function', () => {
		expect(t('known_no_params')).toBe('hello world');
	});

	it('calls the message function with no arguments', () => {
		t('known_no_params');
		expect(mockFnNoParams).toHaveBeenCalledWith();
	});

	it('treats undefined params as no-params branch', () => {
		expect(t('known_no_params', undefined)).toBe('hello world');
		expect(mockFnNoParams).toHaveBeenCalledWith();
	});

	it('treats empty-object params as no-params branch', () => {
		expect(t('known_no_params', {})).toBe('hello world');
		expect(mockFnNoParams).toHaveBeenCalledWith();
	});
});

describe('t() — known key with non-empty params', () => {
	it('passes params to the message function', () => {
		const params = { name: 'Alice' };
		t('known_with_params', params);
		expect(mockFnWithParams).toHaveBeenCalledWith(params);
	});

	it('returns the result from the message function with params', () => {
		expect(t('known_with_params', { name: 'Bob' })).toBe('hello Bob');
	});

	it('does not invoke no-params function when non-empty params provided', () => {
		t('known_with_params', { name: 'X' });
		expect(mockFnNoParams).not.toHaveBeenCalled();
	});
});

describe('t() — locale.current side-effect', () => {
	it('reads locale.current without throwing', () => {
		expect(() => t('known_no_params')).not.toThrow();
	});
});
