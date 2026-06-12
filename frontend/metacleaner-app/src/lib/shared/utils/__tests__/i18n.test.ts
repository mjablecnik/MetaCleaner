import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

vi.mock('$lib/locale.svelte', () => ({
	locale: { current: 'en' }
}));

// vitest strict mock: ALL keys accessed on this module must be defined here.
// Keys set to undefined simulate absent translations (tx() passthrough behavior).
vi.mock('$lib/paraglide/messages', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/paraglide/messages')>();
	return {
		...actual,
		// Known test keys
		'test.greet': () => 'Hello',
		'test.greet.param': (p: Record<string, unknown>) => `Hello ${p.name}`,
		// Absent keys defined as undefined so vitest doesn't throw on property access
		'__nonexistent__': undefined,
		'no.such.key': undefined,
		'totally.unknown.abc123': undefined,
		'missing.translation': undefined,
		'xyz.does.not.exist': undefined
	};
});

import { tx } from '../i18n';

const ABSENT_KEYS = [
	'__nonexistent__',
	'no.such.key',
	'totally.unknown.abc123',
	'missing.translation',
	'xyz.does.not.exist'
];

describe('tx() key lookup and passthrough', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the key unchanged for unknown keys', () => {
		for (const key of ABSENT_KEYS) {
			expect(tx(key)).toBe(key);
		}
	});

	it('property: absent keys always pass through unchanged', () => {
		fc.assert(
			fc.property(fc.constantFrom(...ABSENT_KEYS), (key) => {
				expect(tx(key)).toBe(key);
			}),
			{ numRuns: 50 }
		);
	});

	it('returns translated string for known key', () => {
		expect(tx('test.greet')).toBe('Hello');
	});

	it('passes params to message function for parameterized key', () => {
		expect(tx('test.greet.param', { name: 'World' })).toBe('Hello World');
	});

	it('calls parameterless form when empty params object provided', () => {
		expect(tx('test.greet', {})).toBe('Hello');
	});

	it('known key never returns itself as the passthrough value', () => {
		expect(tx('test.greet')).not.toBe('test.greet');
	});

	it('real paraglide keys return translations, not the key string', () => {
		const realKeys = ['common.nav.settings', 'common.nav.logout', 'step1.meta.title'];
		for (const key of realKeys) {
			const result = tx(key);
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
			expect(result).not.toBe(key);
		}
	});
});
