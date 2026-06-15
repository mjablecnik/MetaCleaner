import { describe, it, expect } from 'vitest';
import { getAuthStats, getAuthPlans } from '../authRepository.js';

describe('getAuthStats', () => {
	it('returns exactly 3 stats', () => {
		const stats = getAuthStats();
		expect(stats).toHaveLength(3);
	});

	it('each stat has a non-empty value and labelKey', () => {
		for (const stat of getAuthStats()) {
			expect(stat.value).toBeTruthy();
			expect(stat.labelKey).toBeTruthy();
		}
	});

	it('first stat value is 50K+', () => {
		const [first] = getAuthStats();
		expect(first.value).toBe('50K+');
	});

	it('second stat value is 2M+', () => {
		const [, second] = getAuthStats();
		expect(second.value).toBe('2M+');
	});

	it('third stat value is 100%', () => {
		const [, , third] = getAuthStats();
		expect(third.value).toBe('100%');
	});

	it('label keys reference auth.common.stats namespace', () => {
		for (const stat of getAuthStats()) {
			expect(stat.labelKey).toMatch(/^auth\.common\.stats\./);
		}
	});
});

describe('getAuthPlans', () => {
	it('returns exactly 2 plans', () => {
		const plans = getAuthPlans();
		expect(plans).toHaveLength(2);
	});

	it('first plan has id "free"', () => {
		const [free] = getAuthPlans();
		expect(free.id).toBe('free');
	});

	it('second plan has id "pro"', () => {
		const [, pro] = getAuthPlans();
		expect(pro.id).toBe('pro');
	});

	it('free plan has color "green"', () => {
		const [free] = getAuthPlans();
		expect(free.color).toBe('green');
	});

	it('pro plan has color "orange"', () => {
		const [, pro] = getAuthPlans();
		expect(pro.color).toBe('orange');
	});

	it('each plan has a non-empty icon', () => {
		for (const plan of getAuthPlans()) {
			expect(plan.icon).toBeTruthy();
		}
	});

	it('each plan has nameKey, badgeKey, and descriptionKey', () => {
		for (const plan of getAuthPlans()) {
			expect(plan.nameKey).toBeTruthy();
			expect(plan.badgeKey).toBeTruthy();
			expect(plan.descriptionKey).toBeTruthy();
		}
	});

	it('plan keys reference auth.register.plan namespace', () => {
		for (const plan of getAuthPlans()) {
			expect(plan.nameKey).toMatch(/^auth\.register\.plan\./);
			expect(plan.badgeKey).toMatch(/^auth\.register\.plan\./);
			expect(plan.descriptionKey).toMatch(/^auth\.register\.plan\./);
		}
	});
});
