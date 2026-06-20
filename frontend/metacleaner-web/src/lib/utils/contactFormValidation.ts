export interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
}

export interface ValidationErrors {
	name?: string;
	email?: string;
	subject?: string;
	message?: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationErrors;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(data: ContactFormData): ValidationResult {
	const errors: ValidationErrors = {};

	if (!data.name.trim()) {
		errors.name = 'required';
	} else if (data.name.length > 100) {
		errors.name = 'max_length';
	}

	if (!data.email.trim()) {
		errors.email = 'required';
	} else if (data.email.length > 254) {
		errors.email = 'max_length';
	} else if (!EMAIL_REGEX.test(data.email)) {
		errors.email = 'email';
	}

	if (!data.subject.trim()) {
		errors.subject = 'required';
	} else if (data.subject.length > 150) {
		errors.subject = 'max_length';
	}

	if (!data.message.trim()) {
		errors.message = 'required';
	} else if (data.message.length > 2000) {
		errors.message = 'max_length';
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors
	};
}
