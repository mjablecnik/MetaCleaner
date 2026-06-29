import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ──────────────────────────────────────────────────────────

const { mockApiFetch } = vi.hoisted(() => ({
	mockApiFetch: vi.fn<() => Promise<Response>>()
}));

vi.mock('$lib/auth/api-client.js', () => ({
	apiFetch: mockApiFetch
}));

import {
	accountErrorToI18nKey,
	updateProfile,
	changeEmail,
	changePassword,
	deleteAccount,
	AccountError
} from '../accountClient.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeResponse(
	ok: boolean,
	status: number,
	body: unknown,
	statusText = 'Error'
): Response {
	return {
		ok,
		status,
		statusText,
		json: vi.fn().mockResolvedValue(body),
		text: vi.fn().mockResolvedValue(String(body))
	} as unknown as Response;
}

function makeResponseJsonFails(status: number, statusText: string): Response {
	return {
		ok: false,
		status,
		statusText,
		json: vi.fn().mockRejectedValue(new Error('not json')),
		text: vi.fn().mockResolvedValue(statusText)
	} as unknown as Response;
}

beforeEach(() => {
	mockApiFetch.mockReset();
});

// ─── accountErrorToI18nKey ──────────────────────────────────────────────────

describe('accountErrorToI18nKey', () => {
	it('maps VALIDATION_ERROR to validationError key', () => {
		const err = new AccountError('VALIDATION_ERROR', 422, 'validation failed');
		expect(accountErrorToI18nKey(err)).toBe('settings.error.validationError');
	});

	it('maps AUTH_EMAIL_EXISTS to emailExists key', () => {
		const err = new AccountError('AUTH_EMAIL_EXISTS', 409, 'email exists');
		expect(accountErrorToI18nKey(err)).toBe('settings.error.emailExists');
	});

	it('maps AUTH_INVALID_CREDENTIALS to invalidCurrentPassword key', () => {
		const err = new AccountError('AUTH_INVALID_CREDENTIALS', 401, 'invalid credentials');
		expect(accountErrorToI18nKey(err)).toBe('settings.error.invalidCurrentPassword');
	});

	it('maps AUTH_PROVIDER_UNAVAILABLE to providerUnavailable key', () => {
		const err = new AccountError('AUTH_PROVIDER_UNAVAILABLE', 503, 'unavailable');
		expect(accountErrorToI18nKey(err)).toBe('settings.error.providerUnavailable');
	});

	it('maps unknown code to unknown key', () => {
		const err = new AccountError('SOME_UNKNOWN_CODE', 500, 'unexpected');
		expect(accountErrorToI18nKey(err)).toBe('settings.error.unknown');
	});

	it('maps empty code to unknown key', () => {
		const err = new AccountError('', 500, 'unexpected');
		expect(accountErrorToI18nKey(err)).toBe('settings.error.unknown');
	});
});

// ─── AccountError class ─────────────────────────────────────────────────────

describe('AccountError', () => {
	it('has name AccountError', () => {
		const err = new AccountError('SOME_CODE', 400, 'message');
		expect(err.name).toBe('AccountError');
	});

	it('exposes code and status', () => {
		const err = new AccountError('MY_CODE', 422, 'msg');
		expect(err.code).toBe('MY_CODE');
		expect(err.status).toBe(422);
	});

	it('is an instance of Error', () => {
		const err = new AccountError('X', 500, 'msg');
		expect(err).toBeInstanceOf(Error);
	});
});

// ─── updateProfile ──────────────────────────────────────────────────────────

describe('updateProfile', () => {
	it('sends PATCH to /api/auth/profile with JSON body and Content-Type header', async () => {
		const profile = { id: '1', email: 'a@b.com', first_name: 'Jana', last_name: 'Nová' };
		mockApiFetch.mockResolvedValue(makeResponse(true, 200, profile));

		await updateProfile({ first_name: 'Jana', last_name: 'Nová' });

		expect(mockApiFetch).toHaveBeenCalledWith(
			'/api/auth/profile',
			expect.objectContaining({
				method: 'PATCH',
				headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
				body: JSON.stringify({ first_name: 'Jana', last_name: 'Nová' })
			})
		);
	});

	it('returns parsed UserProfile on success', async () => {
		const profile = { id: '1', email: 'a@b.com', first_name: 'Jana', last_name: 'Nová' };
		mockApiFetch.mockResolvedValue(makeResponse(true, 200, profile));

		const result = await updateProfile({ first_name: 'Jana', last_name: 'Nová' });
		expect(result).toEqual(profile);
	});

	it('throws AccountError on non-ok response', async () => {
		mockApiFetch.mockResolvedValue(
			makeResponse(false, 422, { error: 'VALIDATION_ERROR', message: 'Bad request' })
		);

		await expect(updateProfile({ first_name: '', last_name: '' })).rejects.toMatchObject({
			name: 'AccountError',
			code: 'VALIDATION_ERROR',
			status: 422
		});
	});

	it('falls back to statusText when json() rejects on error response', async () => {
		mockApiFetch.mockResolvedValue(makeResponseJsonFails(500, 'Internal Server Error'));

		await expect(updateProfile({ first_name: 'a', last_name: 'b' })).rejects.toMatchObject({
			name: 'AccountError',
			status: 500,
			message: 'Internal Server Error'
		});
	});
});

// ─── changeEmail ────────────────────────────────────────────────────────────

describe('changeEmail', () => {
	it('sends POST to /api/auth/change-email with new_email body', async () => {
		mockApiFetch.mockResolvedValue(makeResponse(true, 200, {}));

		await changeEmail('new@example.com');

		expect(mockApiFetch).toHaveBeenCalledWith(
			'/api/auth/change-email',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
				body: JSON.stringify({ new_email: 'new@example.com' })
			})
		);
	});

	it('resolves void on success', async () => {
		mockApiFetch.mockResolvedValue(makeResponse(true, 200, {}));
		await expect(changeEmail('new@example.com')).resolves.toBeUndefined();
	});

	it('throws AccountError on non-ok response', async () => {
		mockApiFetch.mockResolvedValue(
			makeResponse(false, 409, { error: 'AUTH_EMAIL_EXISTS', message: 'Email already exists' })
		);

		await expect(changeEmail('dup@example.com')).rejects.toMatchObject({
			name: 'AccountError',
			code: 'AUTH_EMAIL_EXISTS',
			status: 409
		});
	});

	it('falls back to statusText when json() rejects on error response', async () => {
		mockApiFetch.mockResolvedValue(makeResponseJsonFails(503, 'Service Unavailable'));

		await expect(changeEmail('a@b.com')).rejects.toMatchObject({
			name: 'AccountError',
			status: 503,
			message: 'Service Unavailable'
		});
	});
});

// ─── changePassword ─────────────────────────────────────────────────────────

describe('changePassword', () => {
	it('sends POST to /api/auth/change-password with current_password and new_password', async () => {
		mockApiFetch.mockResolvedValue(makeResponse(true, 200, {}));

		await changePassword('oldpass', 'newpass1');

		expect(mockApiFetch).toHaveBeenCalledWith(
			'/api/auth/change-password',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
				body: JSON.stringify({ current_password: 'oldpass', new_password: 'newpass1' })
			})
		);
	});

	it('resolves void on success', async () => {
		mockApiFetch.mockResolvedValue(makeResponse(true, 200, {}));
		await expect(changePassword('old', 'new12345')).resolves.toBeUndefined();
	});

	it('throws AccountError on non-ok response', async () => {
		mockApiFetch.mockResolvedValue(
			makeResponse(false, 401, { error: 'AUTH_INVALID_CREDENTIALS', message: 'Wrong password' })
		);

		await expect(changePassword('wrongpass', 'newpass1')).rejects.toMatchObject({
			name: 'AccountError',
			code: 'AUTH_INVALID_CREDENTIALS',
			status: 401
		});
	});

	it('falls back to statusText when json() rejects on error response', async () => {
		mockApiFetch.mockResolvedValue(makeResponseJsonFails(500, 'Server Error'));

		await expect(changePassword('a', 'b'.repeat(8))).rejects.toMatchObject({
			name: 'AccountError',
			status: 500,
			message: 'Server Error'
		});
	});
});

// ─── deleteAccount ──────────────────────────────────────────────────────────

describe('deleteAccount', () => {
	it('sends DELETE to /api/auth/account', async () => {
		mockApiFetch.mockResolvedValue(makeResponse(true, 200, {}));

		await deleteAccount();

		expect(mockApiFetch).toHaveBeenCalledWith(
			'/api/auth/account',
			expect.objectContaining({ method: 'DELETE' })
		);
	});

	it('resolves void on success', async () => {
		mockApiFetch.mockResolvedValue(makeResponse(true, 200, {}));
		await expect(deleteAccount()).resolves.toBeUndefined();
	});

	it('throws AccountError on non-ok response', async () => {
		mockApiFetch.mockResolvedValue(
			makeResponse(false, 403, { error: 'FORBIDDEN', message: 'Access denied' })
		);

		await expect(deleteAccount()).rejects.toMatchObject({
			name: 'AccountError',
			code: 'FORBIDDEN',
			status: 403
		});
	});

	it('falls back to statusText when json() rejects on error response', async () => {
		mockApiFetch.mockResolvedValue(makeResponseJsonFails(500, 'Internal Error'));

		await expect(deleteAccount()).rejects.toMatchObject({
			name: 'AccountError',
			status: 500,
			message: 'Internal Error'
		});
	});
});
