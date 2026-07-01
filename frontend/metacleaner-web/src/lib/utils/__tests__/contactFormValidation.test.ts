import { describe, it, expect } from 'vitest';
import { validateContactForm } from '../contactFormValidation.ts';

const valid = {
	name: 'Alice',
	email: 'alice@example.com',
	subject: 'Hello',
	message: 'This is a message.'
};

describe('validateContactForm', () => {
	describe('all valid', () => {
		it('returns valid:true with no errors when all fields are correct', () => {
			expect(validateContactForm(valid)).toEqual({ valid: true, errors: {} });
		});
	});

	describe('name field', () => {
		it('returns required when name is empty', () => {
			const result = validateContactForm({ ...valid, name: '' });
			expect(result.valid).toBe(false);
			expect(result.errors.name).toBe('required');
		});

		it('returns required when name is whitespace-only', () => {
			const result = validateContactForm({ ...valid, name: '   ' });
			expect(result.valid).toBe(false);
			expect(result.errors.name).toBe('required');
		});

		it('returns max_length when name exceeds 100 characters', () => {
			const result = validateContactForm({ ...valid, name: 'a'.repeat(101) });
			expect(result.valid).toBe(false);
			expect(result.errors.name).toBe('max_length');
		});

		it('accepts name of exactly 100 characters (boundary)', () => {
			const result = validateContactForm({ ...valid, name: 'a'.repeat(100) });
			expect(result.errors.name).toBeUndefined();
		});
	});

	describe('email field', () => {
		it('returns required when email is empty', () => {
			const result = validateContactForm({ ...valid, email: '' });
			expect(result.valid).toBe(false);
			expect(result.errors.email).toBe('required');
		});

		it('returns required when email is whitespace-only', () => {
			const result = validateContactForm({ ...valid, email: '   ' });
			expect(result.valid).toBe(false);
			expect(result.errors.email).toBe('required');
		});

		it('returns max_length when email exceeds 254 characters', () => {
			const result = validateContactForm({ ...valid, email: 'a'.repeat(250) + '@b.co' });
			expect(result.valid).toBe(false);
			expect(result.errors.email).toBe('max_length');
		});

		it('accepts email of exactly 254 characters (boundary)', () => {
			const result = validateContactForm({ ...valid, email: 'a'.repeat(249) + '@b.co' });
			expect(result.errors.email).toBeUndefined();
		});

		it('returns email error for "foo" (no @)', () => {
			const result = validateContactForm({ ...valid, email: 'foo' });
			expect(result.errors.email).toBe('email');
		});

		it('returns email error for "foo@" (no domain)', () => {
			const result = validateContactForm({ ...valid, email: 'foo@' });
			expect(result.errors.email).toBe('email');
		});

		it('returns email error for "foo@bar" (no TLD dot)', () => {
			const result = validateContactForm({ ...valid, email: 'foo@bar' });
			expect(result.errors.email).toBe('email');
		});

		it('returns email error for "a b@c.d" (space in local part)', () => {
			const result = validateContactForm({ ...valid, email: 'a b@c.d' });
			expect(result.errors.email).toBe('email');
		});

		it('accepts valid minimal email "a@b.co"', () => {
			const result = validateContactForm({ ...valid, email: 'a@b.co' });
			expect(result.errors.email).toBeUndefined();
		});

		it('reports required not email when email is empty (precedence)', () => {
			const result = validateContactForm({ ...valid, email: '' });
			expect(result.errors.email).toBe('required');
		});

		describe('branch precedence edge cases', () => {
			it('returns max_length (not email) when email is both >254 chars and malformed', () => {
				// length check runs before regex — a 300-char string with no @ triggers max_length
				const result = validateContactForm({ ...valid, email: 'a'.repeat(300) });
				expect(result.errors.email).toBe('max_length');
			});

			it('returns email (not required) for whitespace-padded valid-looking email', () => {
				// .trim() passes the empty check, but regex tests the untrimmed value which starts with a space
				const result = validateContactForm({ ...valid, email: ' a@b.co ' });
				expect(result.errors.email).toBe('email');
			});
		});
	});

	describe('subject field', () => {
		it('returns required when subject is empty', () => {
			const result = validateContactForm({ ...valid, subject: '' });
			expect(result.valid).toBe(false);
			expect(result.errors.subject).toBe('required');
		});

		it('returns max_length when subject exceeds 150 characters', () => {
			const result = validateContactForm({ ...valid, subject: 'a'.repeat(151) });
			expect(result.valid).toBe(false);
			expect(result.errors.subject).toBe('max_length');
		});

		it('accepts subject of exactly 150 characters (boundary)', () => {
			const result = validateContactForm({ ...valid, subject: 'a'.repeat(150) });
			expect(result.errors.subject).toBeUndefined();
		});
	});

	describe('message field', () => {
		it('returns required when message is empty', () => {
			const result = validateContactForm({ ...valid, message: '' });
			expect(result.valid).toBe(false);
			expect(result.errors.message).toBe('required');
		});

		it('returns max_length when message exceeds 2000 characters', () => {
			const result = validateContactForm({ ...valid, message: 'a'.repeat(2001) });
			expect(result.valid).toBe(false);
			expect(result.errors.message).toBe('max_length');
		});

		it('accepts message of exactly 2000 characters (boundary)', () => {
			const result = validateContactForm({ ...valid, message: 'a'.repeat(2000) });
			expect(result.errors.message).toBeUndefined();
		});
	});

	describe('multi-field errors', () => {
		it('reports all errors when multiple fields are invalid', () => {
			const result = validateContactForm({ name: '', email: 'bad', subject: '', message: '' });
			expect(result.valid).toBe(false);
			expect(result.errors.name).toBe('required');
			expect(result.errors.email).toBe('email');
			expect(result.errors.subject).toBe('required');
			expect(result.errors.message).toBe('required');
		});
	});
});
