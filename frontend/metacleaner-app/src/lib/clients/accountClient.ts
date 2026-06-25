import { apiFetch } from '$lib/auth/api-client.js';

export interface UserProfile {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
}

export interface UpdateProfileRequest {
	first_name: string;
	last_name: string;
}

export interface ChangeEmailRequest {
	new_email: string;
}

export interface ChangePasswordRequest {
	current_password: string;
	new_password: string;
}

export class AccountError extends Error {
	constructor(
		public readonly code: string,
		public readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'AccountError';
	}
}

async function parseErrorResponse(res: Response): Promise<AccountError> {
	const body = await res.json().catch(() => ({ error: res.statusText, message: res.statusText }));
	const code = (body as { error?: string }).error ?? 'UNKNOWN_ERROR';
	const message = (body as { message?: string }).message ?? res.statusText;
	return new AccountError(code, res.status, message);
}

export function accountErrorToI18nKey(err: AccountError): string {
	switch (err.code) {
		case 'VALIDATION_ERROR':
			return 'settings.error.validationError';
		case 'AUTH_EMAIL_EXISTS':
			return 'settings.error.emailExists';
		case 'AUTH_INVALID_CREDENTIALS':
			return 'settings.error.invalidCurrentPassword';
		case 'AUTH_PROVIDER_UNAVAILABLE':
			return 'settings.error.providerUnavailable';
		default:
			return 'settings.error.unknown';
	}
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
	const res = await apiFetch('/api/auth/profile', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json() as Promise<UserProfile>;
}

export async function changeEmail(newEmail: string): Promise<void> {
	const req: ChangeEmailRequest = { new_email: newEmail };
	const res = await apiFetch('/api/auth/change-email', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(req)
	});
	if (!res.ok) throw await parseErrorResponse(res);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
	const req: ChangePasswordRequest = {
		current_password: currentPassword,
		new_password: newPassword
	};
	const res = await apiFetch('/api/auth/change-password', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(req)
	});
	if (!res.ok) throw await parseErrorResponse(res);
}

export async function deleteAccount(): Promise<void> {
	const res = await apiFetch('/api/auth/account', {
		method: 'DELETE'
	});
	if (!res.ok) throw await parseErrorResponse(res);
}
