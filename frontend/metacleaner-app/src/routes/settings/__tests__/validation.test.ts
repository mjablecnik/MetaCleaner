import { describe, it, expect } from 'vitest';
import {
	validateName,
	validateEmail,
	validatePassword,
	validateApiKeyName,
	validateApiKeyNote,
	isFormUnchanged
} from '../validation.js';

// ─── validateName ───────────────────────────────────────────────────────────

describe('validateName', () => {
	it('returns nameRequired for empty string', () => {
		expect(validateName('')).toBe('settings.validation.nameRequired');
	});

	it('returns nameRequired for whitespace-only string', () => {
		expect(validateName('   ')).toBe('settings.validation.nameRequired');
	});

	it('returns nameTooLong when trimmed length is 101', () => {
		expect(validateName('a'.repeat(101))).toBe('settings.validation.nameTooLong');
	});

	it('returns null when trimmed length is exactly 100', () => {
		expect(validateName('a'.repeat(100))).toBeNull();
	});

	it('returns null for a normal name', () => {
		expect(validateName('Jana')).toBeNull();
	});

	it('trims whitespace before length check — 100 chars + surrounding spaces is valid', () => {
		expect(validateName(' ' + 'a'.repeat(100) + ' ')).toBeNull();
	});

	it('returns nameTooLong when trimmed length is 101 even with surrounding spaces', () => {
		expect(validateName('  ' + 'a'.repeat(101) + '  ')).toBe('settings.validation.nameTooLong');
	});
});

// ─── validateEmail ──────────────────────────────────────────────────────────

describe('validateEmail', () => {
	it('returns null for valid email', () => {
		expect(validateEmail('user@example.com')).toBeNull();
	});

	it('returns null for minimal valid email a@b.c', () => {
		expect(validateEmail('a@b.c')).toBeNull();
	});

	it('returns emailInvalid for empty string', () => {
		expect(validateEmail('')).toBe('settings.validation.emailInvalid');
	});

	it('returns emailInvalid when @ is missing', () => {
		expect(validateEmail('userexample.com')).toBe('settings.validation.emailInvalid');
	});

	it('returns emailInvalid when domain dot is missing (a@b)', () => {
		expect(validateEmail('a@b')).toBe('settings.validation.emailInvalid');
	});

	it('returns emailInvalid when value contains spaces', () => {
		expect(validateEmail('user @example.com')).toBe('settings.validation.emailInvalid');
	});

	it('trims value before validation — valid email with surrounding spaces is valid', () => {
		expect(validateEmail('  user@example.com  ')).toBeNull();
	});
});

// ─── validatePassword ───────────────────────────────────────────────────────

describe('validatePassword', () => {
	it('returns empty object for all-valid inputs', () => {
		expect(validatePassword('current', 'newpass1', 'newpass1')).toEqual({});
	});

	it('sets current error when current password is empty', () => {
		const errs = validatePassword('', 'newpass1', 'newpass1');
		expect(errs.current).toBe('settings.validation.currentPasswordRequired');
	});

	it('sets newPassword error when new password is 7 characters', () => {
		const errs = validatePassword('current', 'a'.repeat(7), 'a'.repeat(7));
		expect(errs.newPassword).toBe('settings.validation.newPasswordLength');
	});

	it('does not set newPassword error when new password is exactly 8 characters', () => {
		const errs = validatePassword('current', 'a'.repeat(8), 'a'.repeat(8));
		expect(errs.newPassword).toBeUndefined();
	});

	it('does not set newPassword error when new password is exactly 72 characters', () => {
		const errs = validatePassword('current', 'a'.repeat(72), 'a'.repeat(72));
		expect(errs.newPassword).toBeUndefined();
	});

	it('sets newPassword error when new password is 73 characters', () => {
		const errs = validatePassword('current', 'a'.repeat(73), 'a'.repeat(73));
		expect(errs.newPassword).toBe('settings.validation.newPasswordLength');
	});

	it('sets confirm error when new password and confirm do not match', () => {
		const errs = validatePassword('current', 'newpass1', 'different');
		expect(errs.confirm).toBe('settings.validation.passwordMismatch');
	});

	it('does not set confirm error when new password matches confirm', () => {
		const errs = validatePassword('current', 'newpass1', 'newpass1');
		expect(errs.confirm).toBeUndefined();
	});

	it('can have multiple errors simultaneously', () => {
		const errs = validatePassword('', 'short', 'nomatch');
		expect(errs.current).toBeDefined();
		expect(errs.newPassword).toBeDefined();
		expect(errs.confirm).toBeDefined();
	});
});

// ─── validateApiKeyName ─────────────────────────────────────────────────────

describe('validateApiKeyName', () => {
	it('returns apiKeyNameRequired for empty string', () => {
		expect(validateApiKeyName('')).toBe('settings.validation.apiKeyNameRequired');
	});

	it('returns apiKeyNameRequired for whitespace-only string', () => {
		expect(validateApiKeyName('   ')).toBe('settings.validation.apiKeyNameRequired');
	});

	it('returns null for a valid name', () => {
		expect(validateApiKeyName('My API Key')).toBeNull();
	});

	it('returns null when trimmed length is exactly 100', () => {
		expect(validateApiKeyName('a'.repeat(100))).toBeNull();
	});

	it('returns apiKeyNameTooLong when trimmed length is 101', () => {
		expect(validateApiKeyName('a'.repeat(101))).toBe('settings.validation.apiKeyNameTooLong');
	});
});

// ─── validateApiKeyNote ─────────────────────────────────────────────────────

describe('validateApiKeyNote', () => {
	it('returns null for empty string', () => {
		expect(validateApiKeyNote('')).toBeNull();
	});

	it('returns null when length is exactly 500', () => {
		expect(validateApiKeyNote('a'.repeat(500))).toBeNull();
	});

	it('returns apiKeyNoteTooLong when length is 501', () => {
		expect(validateApiKeyNote('a'.repeat(501))).toBe('settings.validation.apiKeyNoteTooLong');
	});

	it('does not trim — leading/trailing spaces count toward length', () => {
		// 500 spaces = exactly 500, still valid
		expect(validateApiKeyNote(' '.repeat(500))).toBeNull();
		// 501 spaces = over limit
		expect(validateApiKeyNote(' '.repeat(501))).toBe('settings.validation.apiKeyNoteTooLong');
	});
});

// ─── isFormUnchanged ────────────────────────────────────────────────────────

describe('isFormUnchanged', () => {
	it('returns true when first_name and last_name are identical', () => {
		expect(
			isFormUnchanged(
				{ first_name: 'Jana', last_name: 'Nová' },
				{ first_name: 'Jana', last_name: 'Nová' }
			)
		).toBe(true);
	});

	it('returns false when first_name differs', () => {
		expect(
			isFormUnchanged(
				{ first_name: 'Jana', last_name: 'Nová' },
				{ first_name: 'Petra', last_name: 'Nová' }
			)
		).toBe(false);
	});

	it('returns false when last_name differs', () => {
		expect(
			isFormUnchanged(
				{ first_name: 'Jana', last_name: 'Nová' },
				{ first_name: 'Jana', last_name: 'Nováková' }
			)
		).toBe(false);
	});

	it('returns true when differences are whitespace only (both trimmed to same value)', () => {
		expect(
			isFormUnchanged(
				{ first_name: 'Jana', last_name: 'Nová' },
				{ first_name: ' Jana ', last_name: ' Nová ' }
			)
		).toBe(true);
	});

	it('returns false when current has extra meaningful chars beyond whitespace', () => {
		expect(
			isFormUnchanged(
				{ first_name: 'Jana', last_name: 'Nová' },
				{ first_name: 'Jana2', last_name: 'Nová' }
			)
		).toBe(false);
	});
});
