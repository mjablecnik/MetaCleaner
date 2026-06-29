import { describe, it, expect } from 'vitest';
import { getSettingsProfile, getAffiliateStats } from '../settingsRepository.js';

describe('getSettingsProfile', () => {
	it('returns an object with a non-empty name', () => {
		expect(getSettingsProfile().name).toBeTruthy();
	});

	it('returns an object with a valid email address', () => {
		const { email } = getSettingsProfile();
		expect(email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
	});

	it('returns an object with a non-empty avatarUrl', () => {
		expect(getSettingsProfile().avatarUrl).toBeTruthy();
	});

	it('returns plan field as a non-empty string', () => {
		expect(getSettingsProfile().plan).toBeTruthy();
	});

	it('returns verified as a boolean', () => {
		expect(typeof getSettingsProfile().verified).toBe('boolean');
	});

	it('returns company as a string (may be empty)', () => {
		expect(typeof getSettingsProfile().company).toBe('string');
	});

	it('returns lastLogin as a non-empty string', () => {
		expect(getSettingsProfile().lastLogin).toBeTruthy();
	});

	it('returns a new object on each call (no shared mutable state)', () => {
		const a = getSettingsProfile();
		const b = getSettingsProfile();
		expect(a).toEqual(b);
		expect(a).not.toBe(b);
	});
});

describe('getAffiliateStats', () => {
	it('returns referrals as a non-negative number', () => {
		expect(getAffiliateStats().referrals).toBeGreaterThanOrEqual(0);
	});

	it('returns conversions as a non-negative number', () => {
		expect(getAffiliateStats().conversions).toBeGreaterThanOrEqual(0);
	});

	it('returns earnings as a non-empty string', () => {
		expect(getAffiliateStats().earnings).toBeTruthy();
	});

	it('returns affiliateLink as a non-empty string', () => {
		expect(getAffiliateStats().affiliateLink).toBeTruthy();
	});

	it('conversions do not exceed referrals', () => {
		const { referrals, conversions } = getAffiliateStats();
		expect(conversions).toBeLessThanOrEqual(referrals);
	});

	it('returns a new object on each call (no shared mutable state)', () => {
		const a = getAffiliateStats();
		const b = getAffiliateStats();
		expect(a).toEqual(b);
		expect(a).not.toBe(b);
	});
});
