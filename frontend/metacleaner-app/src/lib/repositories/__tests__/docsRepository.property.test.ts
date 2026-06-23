import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEndpoints, getSidebarEndpoints, getSidebarSections } from '../docsRepository.js';

// ── Load en.json and cs.json directly to verify key presence ─────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const messagesDir = join(__dirname, '../../../../messages');

const enMessages: Record<string, string> = JSON.parse(
	readFileSync(join(messagesDir, 'en.json'), 'utf-8')
);
const csMessages: Record<string, string> = JSON.parse(
	readFileSync(join(messagesDir, 'cs.json'), 'utf-8')
);

// ── Key collection helpers ────────────────────────────────────────────────────

function collectEndpointKeys(): string[] {
	const keys: string[] = [];
	for (const ep of getEndpoints()) {
		keys.push(ep.descriptionKey);
		for (const p of ep.params) keys.push(p.descriptionKey);
		if (ep.optionsParams) {
			for (const op of ep.optionsParams) keys.push(op.descriptionKey);
		}
		for (const r of ep.responses) keys.push(r.labelKey);
		if (ep.placeholderKey) keys.push(ep.placeholderKey);
	}
	return [...new Set(keys)];
}

function collectSidebarSectionKeys(): string[] {
	return getSidebarSections().map((s) => s.labelKey);
}

// SidebarEndpoint uses plain label strings (not i18n keys), but group values
// are used as sub-keys in the docs.sidebar.group.* namespace.
function collectSidebarGroupKeys(): string[] {
	const groups = [...new Set(getSidebarEndpoints().map((ep) => ep.group))];
	return groups.map((g) => `docs.sidebar.group.${g}`);
}

const endpointKeys = collectEndpointKeys();
const sidebarSectionKeys = collectSidebarSectionKeys();
const sidebarGroupKeys = collectSidebarGroupKeys();
const allDocsKeys = [...new Set([...endpointKeys, ...sidebarSectionKeys, ...sidebarGroupKeys])];

// ── Property 1: i18n key completeness ────────────────────────────────────────

describe('Property 1: i18n key completeness in en.json and cs.json', () => {
	it('all endpoint i18n keys start with the "docs." namespace', () => {
		fc.assert(
			fc.property(fc.constantFrom(...endpointKeys), (key) => {
				expect(key, `endpoint key "${key}" does not start with "docs."`).toMatch(/^docs\./);
			}),
			{ numRuns: endpointKeys.length }
		);
	});

	it('all sidebar section labelKeys start with "docs."', () => {
		fc.assert(
			fc.property(fc.constantFrom(...sidebarSectionKeys), (key) => {
				expect(key, `sidebar section key "${key}" does not start with "docs."`).toMatch(/^docs\./);
			}),
			{ numRuns: sidebarSectionKeys.length }
		);
	});

	it('all sidebar group keys (docs.sidebar.group.*) are present in en.json', () => {
		fc.assert(
			fc.property(fc.constantFrom(...sidebarGroupKeys), (key) => {
				expect(key in enMessages, `sidebar group key "${key}" is missing from en.json`).toBe(true);
			}),
			{ numRuns: sidebarGroupKeys.length }
		);
	});

	it('all sidebar group keys (docs.sidebar.group.*) are present in cs.json', () => {
		fc.assert(
			fc.property(fc.constantFrom(...sidebarGroupKeys), (key) => {
				expect(key in csMessages, `sidebar group key "${key}" is missing from cs.json`).toBe(true);
			}),
			{ numRuns: sidebarGroupKeys.length }
		);
	});

	it('every endpoint i18n key is present in en.json', () => {
		fc.assert(
			fc.property(fc.constantFrom(...endpointKeys), (key) => {
				expect(key in enMessages, `endpoint key "${key}" is missing from en.json`).toBe(true);
			}),
			{ numRuns: endpointKeys.length }
		);
	});

	it('every endpoint i18n key is present in cs.json', () => {
		fc.assert(
			fc.property(fc.constantFrom(...endpointKeys), (key) => {
				expect(key in csMessages, `endpoint key "${key}" is missing from cs.json`).toBe(true);
			}),
			{ numRuns: endpointKeys.length }
		);
	});

	it('every i18n key resolves to a non-empty string in en.json', () => {
		fc.assert(
			fc.property(fc.constantFrom(...allDocsKeys), (key) => {
				const value = enMessages[key];
				expect(value, `key "${key}" is missing from en.json`).toBeDefined();
				expect(
					typeof value === 'string' && value.length > 0,
					`key "${key}" has empty value in en.json`
				).toBe(true);
			}),
			{ numRuns: allDocsKeys.length }
		);
	});

	it('every i18n key resolves to a non-empty string in cs.json', () => {
		fc.assert(
			fc.property(fc.constantFrom(...allDocsKeys), (key) => {
				const value = csMessages[key];
				expect(value, `key "${key}" is missing from cs.json`).toBeDefined();
				expect(
					typeof value === 'string' && value.length > 0,
					`key "${key}" has empty value in cs.json`
				).toBe(true);
			}),
			{ numRuns: allDocsKeys.length }
		);
	});

	it('en.json and cs.json have matching docs keys (no key present in only one locale)', () => {
		const enDocsKeys = Object.keys(enMessages).filter((k) => k.startsWith('docs.'));
		const csDocsKeys = Object.keys(csMessages).filter((k) => k.startsWith('docs.'));

		fc.assert(
			fc.property(fc.constantFrom(...enDocsKeys), (key) => {
				expect(
					key in csMessages,
					`docs key "${key}" exists in en.json but is missing from cs.json`
				).toBe(true);
			}),
			{ numRuns: enDocsKeys.length }
		);

		fc.assert(
			fc.property(fc.constantFrom(...csDocsKeys), (key) => {
				expect(
					key in enMessages,
					`docs key "${key}" exists in cs.json but is missing from en.json`
				).toBe(true);
			}),
			{ numRuns: csDocsKeys.length }
		);
	});
});
