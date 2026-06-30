import { describe, it, expect } from 'vitest';
import * as repositories from '../index.ts';

describe('repositories/index.ts barrel exports', () => {
	it('exports featuresRepository as a function', () => {
		expect(typeof repositories.featuresRepository).toBe('function');
	});

	it('exports pricingRepository as a function', () => {
		expect(typeof repositories.pricingRepository).toBe('function');
	});

	it('exports getEnterprise as a function', () => {
		expect(typeof repositories.getEnterprise).toBe('function');
	});

	it('exports getPlanPrice as a function', () => {
		expect(typeof repositories.getPlanPrice).toBe('function');
	});

	it('exports getAudience as a function', () => {
		expect(typeof repositories.getAudience).toBe('function');
	});

	it('exports getFaq as a function', () => {
		expect(typeof repositories.getFaq).toBe('function');
	});

	it('exports stepsRepository as a function', () => {
		expect(typeof repositories.stepsRepository).toBe('function');
	});

	it('exports statsRepository as a function', () => {
		expect(typeof repositories.statsRepository).toBe('function');
	});

	it('exports getMetadataFields as a function', () => {
		expect(typeof repositories.getMetadataFields).toBe('function');
	});

	it('exports getCleanedFields as a function', () => {
		expect(typeof repositories.getCleanedFields).toBe('function');
	});

	it('each exported function returns a non-empty array when called', () => {
		expect(repositories.featuresRepository().length).toBeGreaterThan(0);
		expect(repositories.pricingRepository().length).toBeGreaterThan(0);
		expect(repositories.getAudience().length).toBeGreaterThan(0);
		expect(repositories.getFaq().length).toBeGreaterThan(0);
		expect(repositories.stepsRepository().length).toBeGreaterThan(0);
		expect(repositories.statsRepository().length).toBeGreaterThan(0);
		expect(repositories.getMetadataFields().length).toBeGreaterThan(0);
		expect(repositories.getCleanedFields().length).toBeGreaterThan(0);
	});
});
