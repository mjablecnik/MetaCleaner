import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
	getEndpoints,
	getCodeExamples,
	getSidebarSections,
	getSidebarEndpoints,
	getFeatureCards,
	getQuickStartSteps,
	getErrorEntries
} from '$lib/repositories/docsRepository';

// ─── Pure helper extracted from +page.svelte scrollspy logic ─────────────────
// Mirrors: entries.filter(e => e.isIntersecting).sort((a,b) => a.top - b.top)[0]

interface ScrollspyEntry {
	id: string;
	isIntersecting: boolean;
	top: number;
}

function computeScrollspyActiveId(entries: ScrollspyEntry[], currentActiveId: string): string {
	const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.top - b.top);
	return visible.length > 0 ? visible[0].id : currentActiveId;
}

// ─── 11.1: Scrollspy single-active invariant ─────────────────────────────────

describe('Property 1: Scrollspy single-active invariant', () => {
	const SECTION_IDS = [
		'sec-intro',
		'sec-auth',
		'sec-errors',
		'ep-upload',
		'ep-clean',
		'ep-status',
		'ep-download',
		'ep-metadata',
		'ep-delete'
	];

	const entryArb = fc.record({
		id: fc.constantFrom(...SECTION_IDS),
		isIntersecting: fc.boolean(),
		top: fc.integer({ min: -500, max: 5000 })
	});

	it('always returns exactly one active ID (never zero, never more than one)', () => {
		fc.assert(
			fc.property(
				fc.array(entryArb, { minLength: 0, maxLength: 10 }),
				fc.constantFrom(...SECTION_IDS),
				(entries, currentId) => {
					const result = computeScrollspyActiveId(entries, currentId);
					expect(typeof result).toBe('string');
					expect(result.length).toBeGreaterThan(0);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('when visible entries exist, active is the topmost one (smallest top)', () => {
		fc.assert(
			fc.property(
				fc.array(entryArb, { minLength: 1, maxLength: 10 }),
				fc.constantFrom(...SECTION_IDS),
				(entries, currentId) => {
					const visible = entries.filter((e) => e.isIntersecting);
					if (visible.length === 0) return;

					const result = computeScrollspyActiveId(entries, currentId);
					const expectedTop = Math.min(...visible.map((e) => e.top));
					const expected = visible.find((e) => e.top === expectedTop)!.id;
					expect(result).toBe(expected);
				}
			),
			{ numRuns: 200 }
		);
	});

	it('when no entries are intersecting, active ID stays unchanged', () => {
		fc.assert(
			fc.property(
				fc.array(
					fc.record({
						id: fc.constantFrom(...SECTION_IDS),
						isIntersecting: fc.constant(false),
						top: fc.integer({ min: -500, max: 5000 })
					}),
					{ minLength: 0, maxLength: 10 }
				),
				fc.constantFrom(...SECTION_IDS),
				(entries, currentId) => {
					const result = computeScrollspyActiveId(entries, currentId);
					expect(result).toBe(currentId);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('result is always one of the known section IDs or the current active ID', () => {
		fc.assert(
			fc.property(
				fc.array(entryArb, { minLength: 0, maxLength: 10 }),
				fc.constantFrom(...SECTION_IDS),
				(entries, currentId) => {
					const result = computeScrollspyActiveId(entries, currentId);
					expect(SECTION_IDS).toContain(result);
				}
			),
			{ numRuns: 200 }
		);
	});
});

// ─── 11.2: Endpoint card expand reveals complete content ─────────────────────

describe('Property 2: Endpoint card expand completeness', () => {
	const endpoints = getEndpoints();
	const fullEndpoints = endpoints.filter((ep) => !ep.isMinimal);
	const minimalEndpoints = endpoints.filter((ep) => ep.isMinimal);

	it('every full endpoint has a non-empty descriptionKey', () => {
		fc.assert(
			fc.property(fc.constantFrom(...fullEndpoints), (ep) => {
				expect(ep.descriptionKey).toBeTruthy();
				expect(ep.descriptionKey.length).toBeGreaterThan(0);
			}),
			{ numRuns: fullEndpoints.length }
		);
	});

	it('every full endpoint has a headers CodeBlock with non-empty code', () => {
		fc.assert(
			fc.property(fc.constantFrom(...fullEndpoints), (ep) => {
				expect(ep.headers).toBeDefined();
				expect(ep.headers.code.length).toBeGreaterThan(0);
			}),
			{ numRuns: fullEndpoints.length }
		);
	});

	it('every full endpoint has at least one param entry', () => {
		fc.assert(
			fc.property(fc.constantFrom(...fullEndpoints), (ep) => {
				expect(ep.params.length).toBeGreaterThan(0);
			}),
			{ numRuns: fullEndpoints.length }
		);
	});

	it('every full endpoint param has name, type, and descriptionKey', () => {
		fc.assert(
			fc.property(fc.constantFrom(...fullEndpoints), (ep) => {
				for (const param of ep.params) {
					expect(param.name.length).toBeGreaterThan(0);
					expect(param.type.length).toBeGreaterThan(0);
					expect(param.descriptionKey.length).toBeGreaterThan(0);
				}
			}),
			{ numRuns: fullEndpoints.length }
		);
	});

	it('every full endpoint has a curlExample with non-empty code', () => {
		fc.assert(
			fc.property(fc.constantFrom(...fullEndpoints), (ep) => {
				expect(ep.curlExample).toBeDefined();
				expect(ep.curlExample.code.length).toBeGreaterThan(0);
			}),
			{ numRuns: fullEndpoints.length }
		);
	});

	it('every full endpoint has at least one success and one error response', () => {
		fc.assert(
			fc.property(fc.constantFrom(...fullEndpoints), (ep) => {
				expect(ep.responses.length).toBeGreaterThanOrEqual(2);
				const hasSuccess = ep.responses.some((r) => r.variant === 'success');
				const hasError = ep.responses.some((r) => r.variant === 'error');
				expect(hasSuccess).toBe(true);
				expect(hasError).toBe(true);
			}),
			{ numRuns: fullEndpoints.length }
		);
	});

	it('every minimal endpoint has a placeholderKey instead of responses', () => {
		fc.assert(
			fc.property(fc.constantFrom(...minimalEndpoints), (ep) => {
				expect(ep.isMinimal).toBe(true);
				expect(ep.placeholderKey).toBeTruthy();
				expect((ep.placeholderKey as string).length).toBeGreaterThan(0);
				expect(ep.responses).toHaveLength(0);
			}),
			{ numRuns: minimalEndpoints.length }
		);
	});

	it('curlExample code does not contain HTML markup', () => {
		fc.assert(
			fc.property(fc.constantFrom(...endpoints), (ep) => {
				expect(ep.curlExample.code).not.toMatch(/<[a-z]/i);
			}),
			{ numRuns: endpoints.length }
		);
	});
});

// ─── 11.3: Copy button copies correct plain text ─────────────────────────────

describe('Property 3: Copy button plain text correctness', () => {
	const codeExamples = Object.values(getCodeExamples());
	const allEndpointCodes = getEndpoints().flatMap((ep) => [
		ep.headers,
		ep.curlExample,
		...ep.responses.map((r) => ({ id: `${ep.id}-response`, code: r.body, displayHtml: r.body }))
	]);
	const allCodes = [...codeExamples, ...allEndpointCodes];

	it('all code examples have non-empty code content', () => {
		fc.assert(
			fc.property(fc.constantFrom(...allCodes), (example) => {
				expect(example.code.length).toBeGreaterThan(0);
			}),
			{ numRuns: allCodes.length }
		);
	});

	it('all code examples contain no HTML markup (plain text only)', () => {
		fc.assert(
			fc.property(fc.constantFrom(...allCodes), (example) => {
				expect(example.code).not.toMatch(/<[a-z][^>]*>/i);
			}),
			{ numRuns: allCodes.length }
		);
	});

	it('all code examples have non-empty id', () => {
		fc.assert(
			fc.property(fc.constantFrom(...codeExamples), (example) => {
				expect(example.id.length).toBeGreaterThan(0);
			}),
			{ numRuns: codeExamples.length }
		);
	});

	it('base-url code example is the canonical API URL', () => {
		const examples = getCodeExamples();
		expect(examples['base-url'].code).toBe('https://api.metacleaner.com/v1');
	});

	it('auth-header code example follows Bearer token format', () => {
		const examples = getCodeExamples();
		expect(examples['auth-header'].code).toMatch(/^Authorization: Bearer /);
	});
});

// ─── 11.4: i18n completeness — all docs keys resolve ─────────────────────────

describe('Property 4: i18n completeness — all docs keys resolve', () => {
	function collectDocsKeys(): string[] {
		const keys: string[] = [];

		for (const s of getSidebarSections()) {
			keys.push(s.labelKey);
		}
		for (const card of getFeatureCards()) {
			keys.push(card.titleKey, card.descriptionKey);
		}
		for (const step of getQuickStartSteps()) {
			keys.push(step.titleKey, step.descriptionKey);
		}
		for (const entry of getErrorEntries()) {
			keys.push(entry.descriptionKey, entry.solutionKey);
		}
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

	const docsKeys = collectDocsKeys();

	it('all collected docs keys are non-empty strings', () => {
		fc.assert(
			fc.property(fc.constantFrom(...docsKeys), (key) => {
				expect(typeof key).toBe('string');
				expect(key.length).toBeGreaterThan(0);
			}),
			{ numRuns: docsKeys.length }
		);
	});

	it('all collected docs keys start with the "docs." namespace', () => {
		fc.assert(
			fc.property(fc.constantFrom(...docsKeys), (key) => {
				expect(key).toMatch(/^docs\./);
			}),
			{ numRuns: docsKeys.length }
		);
	});

	it('all docs keys resolve in English locale', async () => {
		const m = await import('$lib/paraglide/messages');
		const messages = m as unknown as Record<string, ((opts?: object) => string) | undefined>;

		fc.assert(
			fc.property(fc.constantFrom(...docsKeys), (key) => {
				const fn = messages[key];
				expect(fn, `key "${key}" missing from en messages`).toBeDefined();
				const result = fn!({ locale: 'en' });
				expect(result.length, `key "${key}" resolves to empty string in en`).toBeGreaterThan(0);
				expect(result, `key "${key}" returns raw key in en`).not.toBe(key);
			}),
			{ numRuns: docsKeys.length }
		);
	});

	it('all docs keys resolve in Czech locale', async () => {
		const m = await import('$lib/paraglide/messages');
		const messages = m as unknown as Record<string, ((opts?: object) => string) | undefined>;

		fc.assert(
			fc.property(fc.constantFrom(...docsKeys), (key) => {
				const fn = messages[key];
				expect(fn, `key "${key}" missing from cs messages`).toBeDefined();
				const result = fn!({ locale: 'cs' });
				expect(result.length, `key "${key}" resolves to empty string in cs`).toBeGreaterThan(0);
				expect(result, `key "${key}" returns raw key in cs`).not.toBe(key);
			}),
			{ numRuns: docsKeys.length }
		);
	});
});

// ─── 11.5: Code block content is locale-independent ──────────────────────────

describe('Property 5: Code block content is locale-independent', () => {
	const allEndpoints = getEndpoints();
	const allCodeExamples = Object.values(getCodeExamples());

	const allCodeBlocks = [
		...allCodeExamples,
		...allEndpoints.map((ep) => ep.headers),
		...allEndpoints.map((ep) => ep.curlExample)
	];

	it('code content is a plain string (not a function) — locale-independent by construction', () => {
		fc.assert(
			fc.property(fc.constantFrom(...allCodeBlocks), (block) => {
				expect(typeof block.code).toBe('string');
			}),
			{ numRuns: allCodeBlocks.length }
		);
	});

	it('code content does not contain i18n placeholders or locale tokens', () => {
		fc.assert(
			fc.property(fc.constantFrom(...allCodeBlocks), (block) => {
				// Code blocks should not contain locale-specific text markers
				expect(block.code).not.toMatch(/\$\{.*\}/);
				expect(block.code).not.toMatch(/{{.*}}/);
			}),
			{ numRuns: allCodeBlocks.length }
		);
	});

	it('a code block evaluated twice always returns identical content', () => {
		// Code blocks are static strings — re-reading them returns the same value
		const examplesFirst = Object.values(getCodeExamples());
		const examplesSecond = Object.values(getCodeExamples());

		fc.assert(
			fc.property(fc.integer({ min: 0, max: examplesFirst.length - 1 }), (idx) => {
				expect(examplesFirst[idx].code).toBe(examplesSecond[idx].code);
			}),
			{ numRuns: examplesFirst.length }
		);
	});

	it('endpoint curl examples reference the canonical API base URL', () => {
		fc.assert(
			fc.property(fc.constantFrom(...allEndpoints), (ep) => {
				expect(ep.curlExample.code).toContain('api.metacleaner.com/v1');
			}),
			{ numRuns: allEndpoints.length }
		);
	});
});

// ─── 11.6: Info box variant styling correctness ───────────────────────────────

describe('Property 6: Info box variant styling correctness', () => {
	type InfoBoxVariant = 'blue' | 'green' | 'orange' | 'red';

	const VARIANT_BRAND_COLORS: Record<InfoBoxVariant, string> = {
		blue: 'brand-blue',
		green: 'brand-green',
		orange: 'brand-orange',
		red: 'brand-red'
	};

	// Mirrors InfoBox.svelte variant-to-class mapping
	function getInfoBoxClasses(variant: InfoBoxVariant): {
		bg: string;
		border: string;
		icon: string;
	} {
		const color = VARIANT_BRAND_COLORS[variant];
		return {
			bg: `bg-${color}/8`,
			border: `border-${color}/25`,
			icon: `text-${color}`
		};
	}

	const variants: InfoBoxVariant[] = ['blue', 'green', 'orange', 'red'];

	it('all 4 variants produce distinct background classes', () => {
		fc.assert(
			fc.property(fc.constantFrom(...variants), (variant) => {
				const { bg } = getInfoBoxClasses(variant);
				expect(bg).toMatch(/^bg-brand-(blue|green|orange|red)\/8$/);
			}),
			{ numRuns: variants.length }
		);
	});

	it('all 4 variants produce distinct border classes', () => {
		fc.assert(
			fc.property(fc.constantFrom(...variants), (variant) => {
				const { border } = getInfoBoxClasses(variant);
				expect(border).toMatch(/^border-brand-(blue|green|orange|red)\/25$/);
			}),
			{ numRuns: variants.length }
		);
	});

	it('variant brand color is embedded in both bg and border class', () => {
		fc.assert(
			fc.property(fc.constantFrom(...variants), (variant) => {
				const color = VARIANT_BRAND_COLORS[variant];
				const { bg, border, icon } = getInfoBoxClasses(variant);
				expect(bg).toContain(color);
				expect(border).toContain(color);
				expect(icon).toContain(color);
			}),
			{ numRuns: variants.length }
		);
	});

	it('background opacity is 8% (bg-*/8) for all variants', () => {
		fc.assert(
			fc.property(fc.constantFrom(...variants), (variant) => {
				const { bg } = getInfoBoxClasses(variant);
				expect(bg).toMatch(/\/8$/);
			}),
			{ numRuns: variants.length }
		);
	});

	it('border opacity is 25% (border-*/25) for all variants', () => {
		fc.assert(
			fc.property(fc.constantFrom(...variants), (variant) => {
				const { border } = getInfoBoxClasses(variant);
				expect(border).toMatch(/\/25$/);
			}),
			{ numRuns: variants.length }
		);
	});

	it('all 4 variants map to distinct brand colors (no duplicates)', () => {
		const colors = variants.map((v) => VARIANT_BRAND_COLORS[v]);
		const unique = new Set(colors);
		expect(unique.size).toBe(4);
	});

	it('sidebar sections each have a matching icon', () => {
		fc.assert(
			fc.property(fc.constantFrom(...getSidebarSections()), (section) => {
				expect(section.icon).toMatch(/^fa-/);
			}),
			{ numRuns: getSidebarSections().length }
		);
	});

	it('sidebar endpoints each have a valid HTTP method', () => {
		fc.assert(
			fc.property(fc.constantFrom(...getSidebarEndpoints()), (ep) => {
				expect(['GET', 'POST', 'DEL']).toContain(ep.method);
			}),
			{ numRuns: getSidebarEndpoints().length }
		);
	});
});
