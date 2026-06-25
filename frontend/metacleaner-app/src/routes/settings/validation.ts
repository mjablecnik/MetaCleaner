const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateName(value: string): string | null {
	const trimmed = value.trim();
	if (trimmed.length === 0) return 'settings.validation.nameRequired';
	if (trimmed.length > 100) return 'settings.validation.nameTooLong';
	return null;
}

export function validateEmail(value: string): string | null {
	if (!EMAIL_RE.test(value.trim())) return 'settings.validation.emailInvalid';
	return null;
}

export interface PasswordErrors {
	current?: string;
	newPassword?: string;
	confirm?: string;
}

export function validatePassword(current: string, newPwd: string, confirm: string): PasswordErrors {
	const errors: PasswordErrors = {};
	if (current.length === 0) {
		errors.current = 'settings.validation.currentPasswordRequired';
	}
	if (newPwd.length < 8 || newPwd.length > 72) {
		errors.newPassword = 'settings.validation.newPasswordLength';
	}
	if (newPwd !== confirm) {
		errors.confirm = 'settings.validation.passwordMismatch';
	}
	return errors;
}

export function validateApiKeyName(name: string): string | null {
	const trimmed = name.trim();
	if (trimmed.length === 0) return 'settings.validation.apiKeyNameRequired';
	if (trimmed.length > 100) return 'settings.validation.apiKeyNameTooLong';
	return null;
}

export function validateApiKeyNote(note: string): string | null {
	if (note.length > 500) return 'settings.validation.apiKeyNoteTooLong';
	return null;
}

export interface ProfileFields {
	first_name: string;
	last_name: string;
}

export function isFormUnchanged(original: ProfileFields, current: ProfileFields): boolean {
	return (
		original.first_name.trim() === current.first_name.trim() &&
		original.last_name.trim() === current.last_name.trim()
	);
}
