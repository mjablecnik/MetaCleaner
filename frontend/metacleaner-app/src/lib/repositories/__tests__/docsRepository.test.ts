import { describe, it, expect } from 'vitest';
import {
	getDocsConfig,
	getSidebarSections,
	getSidebarEndpoints,
	getFeatureCards,
	getQuickStartSteps,
	getSupportedFormats,
	getErrorEntries,
	getEndpoints,
	getCodeExamples
} from '../docsRepository.js';

describe('getDocsConfig', () => {
	it('returns apiVersion and baseUrl', () => {
		const config = getDocsConfig();
		expect(config.apiVersion).toBe('v1');
		expect(config.baseUrl).toBe('https://api.metacleaner.com/v1');
	});
});

describe('getSidebarSections', () => {
	it('returns 4 sections', () => {
		expect(getSidebarSections()).toHaveLength(4);
	});

	it('each section has id, icon, and labelKey', () => {
		for (const s of getSidebarSections()) {
			expect(s.id.length).toBeGreaterThan(0);
			expect(s.icon).toMatch(/^fa-/);
			expect(s.labelKey).toMatch(/^docs\./);
		}
	});
});

describe('getSidebarEndpoints', () => {
	it('returns 11 endpoints', () => {
		expect(getSidebarEndpoints()).toHaveLength(11);
	});

	it('each endpoint has id, method, label, and group', () => {
		for (const ep of getSidebarEndpoints()) {
			expect(ep.id.length).toBeGreaterThan(0);
			expect(['GET', 'POST', 'DEL']).toContain(ep.method);
			expect(ep.label.length).toBeGreaterThan(0);
			expect(['fileProcessing', 'reports', 'account', 'system']).toContain(ep.group);
		}
	});
});

describe('getFeatureCards', () => {
	it('returns 3 feature cards', () => {
		expect(getFeatureCards()).toHaveLength(3);
	});

	it('each card has icon, iconColor, titleKey, and descriptionKey', () => {
		for (const card of getFeatureCards()) {
			expect(card.icon).toMatch(/^fa-/);
			expect(card.iconColor).toMatch(/^text-/);
			expect(card.titleKey).toMatch(/^docs\./);
			expect(card.descriptionKey).toMatch(/^docs\./);
		}
	});
});

describe('getQuickStartSteps', () => {
	it('returns 4 steps', () => {
		expect(getQuickStartSteps()).toHaveLength(4);
	});

	it('steps are numbered 1 through 4', () => {
		const steps = getQuickStartSteps();
		expect(steps.map((s) => s.number)).toEqual([1, 2, 3, 4]);
	});

	it('each step has titleKey, descriptionKey, and codeSnippets', () => {
		for (const step of getQuickStartSteps()) {
			expect(step.titleKey).toMatch(/^docs\./);
			expect(step.descriptionKey).toMatch(/^docs\./);
			expect(step.codeSnippets.length).toBeGreaterThan(0);
		}
	});

	it('last step has isLast flag', () => {
		const steps = getQuickStartSteps();
		expect(steps[3].isLast).toBe(true);
	});
});

describe('getSupportedFormats', () => {
	it('returns at least 4 format strings', () => {
		expect(getSupportedFormats().length).toBeGreaterThanOrEqual(4);
	});

	it('all formats are non-empty uppercase strings', () => {
		for (const fmt of getSupportedFormats()) {
			expect(fmt.length).toBeGreaterThan(0);
			expect(fmt).toBe(fmt.toUpperCase());
		}
	});
});

describe('getErrorEntries', () => {
	it('returns at least 8 entries', () => {
		expect(getErrorEntries().length).toBeGreaterThanOrEqual(8);
	});

	it('each entry has status, code, descriptionKey, and solutionKey', () => {
		for (const entry of getErrorEntries()) {
			expect(entry.status).toBeGreaterThan(0);
			expect(entry.code.length).toBeGreaterThan(0);
			expect(entry.descriptionKey).toMatch(/^docs\./);
			expect(entry.solutionKey).toMatch(/^docs\./);
		}
	});

	it('covers 4xx and 5xx HTTP status codes', () => {
		const statuses = getErrorEntries().map((e) => e.status);
		expect(statuses.some((s) => s >= 400 && s < 500)).toBe(true);
		expect(statuses.some((s) => s >= 500 && s < 600)).toBe(true);
	});

	it('includes UNAUTHORIZED (401) entry', () => {
		const entry = getErrorEntries().find((e) => e.code === 'UNAUTHORIZED');
		expect(entry).toBeDefined();
		expect(entry!.status).toBe(401);
	});
});

describe('getEndpoints', () => {
	it('returns 11 endpoints', () => {
		expect(getEndpoints()).toHaveLength(11);
	});

	it('each endpoint has id, method, path, and descriptionKey', () => {
		for (const ep of getEndpoints()) {
			expect(ep.id.length).toBeGreaterThan(0);
			expect(['GET', 'POST', 'DEL']).toContain(ep.method);
			expect(ep.path).toMatch(/^\//);
			expect(ep.descriptionKey).toMatch(/^docs\./);
		}
	});

	it('each endpoint has headers with non-empty code', () => {
		for (const ep of getEndpoints()) {
			expect(ep.headers).toBeDefined();
			expect(ep.headers.code.length).toBeGreaterThan(0);
		}
	});

	it('each endpoint has a curlExample referencing the canonical base URL', () => {
		for (const ep of getEndpoints()) {
			expect(ep.curlExample.code).toContain('api.metacleaner.com/v1');
		}
	});

	it('full endpoints with path parameters have matching params entries', () => {
		for (const ep of getEndpoints().filter((e) => !e.isMinimal && e.path.includes('{'))) {
			expect(ep.params.length, `${ep.id} has path params but empty params array`).toBeGreaterThan(0);
		}
	});

	it('full endpoints have at least one success response', () => {
		for (const ep of getEndpoints().filter((e) => !e.isMinimal)) {
			expect(ep.responses.some((r) => r.variant === 'success')).toBe(true);
		}
	});

	it('deprecated endpoints ep-metadata and ep-delete are absent', () => {
		const ids = getEndpoints().map((e) => e.id);
		expect(ids).not.toContain('ep-metadata');
		expect(ids).not.toContain('ep-delete');
	});

	it('response bodies contain no HTML markup (plain text only)', () => {
		for (const ep of getEndpoints()) {
			for (const resp of ep.responses) {
				expect(resp.body).not.toMatch(/<[a-z][^>]*>/i);
			}
		}
	});

	it('ep-upload exists as POST /api/upload', () => {
		const ep = getEndpoints().find((e) => e.id === 'ep-upload');
		expect(ep).toBeDefined();
		expect(ep!.method).toBe('POST');
		expect(ep!.path).toBe('/api/upload');
	});

	it('ep-status has statusValues array', () => {
		const ep = getEndpoints().find((e) => e.id === 'ep-status');
		expect(ep).toBeDefined();
		expect(ep!.statusValues).toBeDefined();
		expect(ep!.statusValues!.length).toBeGreaterThan(0);
	});

	it('ep-clean has optionsParams array', () => {
		const ep = getEndpoints().find((e) => e.id === 'ep-clean');
		expect(ep).toBeDefined();
		expect(ep!.optionsParams).toBeDefined();
		expect(ep!.optionsParams!.length).toBeGreaterThan(0);
	});
});

describe('getCodeExamples', () => {
	it('returns an object with expected keys', () => {
		const examples = getCodeExamples();
		expect(examples['base-url']).toBeDefined();
		expect(examples['auth-header']).toBeDefined();
		expect(examples['auth-curl']).toBeDefined();
		expect(examples['auth-401']).toBeDefined();
		expect(examples['auth-403']).toBeDefined();
		expect(examples['error-standard']).toBeDefined();
	});

	it('each example has non-empty id, code, and displayHtml', () => {
		for (const example of Object.values(getCodeExamples())) {
			expect(example.id.length).toBeGreaterThan(0);
			expect(example.code.length).toBeGreaterThan(0);
			expect(example.displayHtml.length).toBeGreaterThan(0);
		}
	});

	it('base-url is the canonical API URL', () => {
		expect(getCodeExamples()['base-url'].code).toBe('https://api.metacleaner.com/v1');
	});

	it('auth-header follows Bearer token format', () => {
		expect(getCodeExamples()['auth-header'].code).toMatch(/^Authorization: Bearer /);
	});

	it('code examples contain no HTML markup', () => {
		for (const example of Object.values(getCodeExamples())) {
			expect(example.code).not.toMatch(/<[a-z][^>]*>/i);
		}
	});
});

describe('i18n key completeness', () => {
	it('all docs translation keys start with "docs."', async () => {
		const keys: string[] = [];
		for (const s of getSidebarSections()) keys.push(s.labelKey);
		for (const card of getFeatureCards()) keys.push(card.titleKey, card.descriptionKey);
		for (const step of getQuickStartSteps()) keys.push(step.titleKey, step.descriptionKey);
		for (const entry of getErrorEntries()) keys.push(entry.descriptionKey, entry.solutionKey);
		for (const ep of getEndpoints()) {
			keys.push(ep.descriptionKey);
			for (const p of ep.params) keys.push(p.descriptionKey);
			if (ep.optionsParams) for (const o of ep.optionsParams) keys.push(o.descriptionKey);
			for (const r of ep.responses) keys.push(r.labelKey);
			if (ep.placeholderKey) keys.push(ep.placeholderKey);
		}
		for (const key of [...new Set(keys)]) {
			expect(key, `key "${key}" does not start with "docs."`).toMatch(/^docs\./);
		}
	});

	it('all docs keys resolve to non-empty strings in English', async () => {
		const m = await import('$lib/paraglide/messages');
		const messages = m as unknown as Record<string, ((opts?: object) => string) | undefined>;

		const keys: string[] = [];
		for (const s of getSidebarSections()) keys.push(s.labelKey);
		for (const card of getFeatureCards()) keys.push(card.titleKey, card.descriptionKey);
		for (const step of getQuickStartSteps()) keys.push(step.titleKey, step.descriptionKey);
		for (const entry of getErrorEntries()) keys.push(entry.descriptionKey, entry.solutionKey);
		for (const ep of getEndpoints()) {
			keys.push(ep.descriptionKey);
			for (const p of ep.params) keys.push(p.descriptionKey);
			if (ep.optionsParams) for (const o of ep.optionsParams) keys.push(o.descriptionKey);
			for (const r of ep.responses) keys.push(r.labelKey);
			if (ep.placeholderKey) keys.push(ep.placeholderKey);
		}

		for (const key of [...new Set(keys)]) {
			const fn = messages[key];
			expect(fn, `key "${key}" missing from messages`).toBeDefined();
			const result = fn!({ locale: 'en' });
			expect(result.length, `key "${key}" is empty in en`).toBeGreaterThan(0);
			expect(result, `key "${key}" returns raw key`).not.toBe(key);
		}
	});

	it('all docs keys resolve to non-empty strings in Czech', async () => {
		const m = await import('$lib/paraglide/messages');
		const messages = m as unknown as Record<string, ((opts?: object) => string) | undefined>;

		const keys: string[] = [];
		for (const s of getSidebarSections()) keys.push(s.labelKey);
		for (const card of getFeatureCards()) keys.push(card.titleKey, card.descriptionKey);
		for (const step of getQuickStartSteps()) keys.push(step.titleKey, step.descriptionKey);
		for (const entry of getErrorEntries()) keys.push(entry.descriptionKey, entry.solutionKey);
		for (const ep of getEndpoints()) {
			keys.push(ep.descriptionKey);
			for (const p of ep.params) keys.push(p.descriptionKey);
			if (ep.optionsParams) for (const o of ep.optionsParams) keys.push(o.descriptionKey);
			for (const r of ep.responses) keys.push(r.labelKey);
			if (ep.placeholderKey) keys.push(ep.placeholderKey);
		}

		for (const key of [...new Set(keys)]) {
			const fn = messages[key];
			expect(fn, `key "${key}" missing from messages`).toBeDefined();
			const result = fn!({ locale: 'cs' });
			expect(result.length, `key "${key}" is empty in cs`).toBeGreaterThan(0);
			expect(result, `key "${key}" returns raw key`).not.toBe(key);
		}
	});
});
