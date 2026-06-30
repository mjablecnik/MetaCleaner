import { describe, it, expect } from 'vitest';
import { getPlanPrice, pricingRepository, getEnterprise } from '../pricing.ts';
import type { Plan } from '../pricing.ts';

describe('getPlanPrice()', () => {
	const plan: Plan = {
		id: 'test',
		nameKey: 'key',
		nameText: null,
		priceMonthly: '€5',
		priceYearly: '€50',
		originalYearly: null,
		saveAmountYearly: null,
		subtitleKey: 'sub',
		perKey: null,
		featureKeys: ['f1'],
		ctaKey: 'cta',
		featured: false,
		disabled: false
	};

	it('returns priceYearly when yearly is true', () => {
		expect(getPlanPrice(plan, true)).toBe('€50');
	});

	it('returns priceMonthly when yearly is false', () => {
		expect(getPlanPrice(plan, false)).toBe('€5');
	});
});

describe('pricingRepository()', () => {
	const plans = pricingRepository();

	it('returns exactly 4 plans', () => {
		expect(plans.length).toBe(4);
	});

	it('has unique plan ids', () => {
		const ids = plans.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('includes plans with ids: free, pack, pro, proplus', () => {
		const ids = plans.map((p) => p.id);
		expect(ids).toContain('free');
		expect(ids).toContain('pack');
		expect(ids).toContain('pro');
		expect(ids).toContain('proplus');
	});

	it('has exactly one featured plan', () => {
		const featured = plans.filter((p) => p.featured);
		expect(featured.length).toBe(1);
	});

	it('the pro plan is the featured one', () => {
		const featured = plans.find((p) => p.featured);
		expect(featured?.id).toBe('pro');
	});

	it('the proplus plan is disabled', () => {
		const proplus = plans.find((p) => p.id === 'proplus');
		expect(proplus?.disabled).toBe(true);
	});

	it('every plan has at least one feature key', () => {
		for (const plan of plans) {
			expect(plan.featureKeys.length).toBeGreaterThan(0);
		}
	});

	it('every plan has exactly one of nameKey or nameText set (not both, not neither)', () => {
		for (const plan of plans) {
			const hasNameKey = plan.nameKey !== null;
			const hasNameText = plan.nameText !== null;
			expect(hasNameKey !== hasNameText).toBe(true);
		}
	});
});

describe('getEnterprise()', () => {
	const enterprise = getEnterprise();

	it('returns an object with titleKey', () => {
		expect(enterprise.titleKey).toBeTruthy();
	});

	it('returns an object with descKey', () => {
		expect(enterprise.descKey).toBeTruthy();
	});

	it('returns an object with ctaKey', () => {
		expect(enterprise.ctaKey).toBeTruthy();
	});
});
