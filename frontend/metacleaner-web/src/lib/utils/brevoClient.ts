export interface ContactEmailPayload {
	senderName: string;
	senderEmail: string;
	subject: string;
	message: string;
}

export async function sendContactEmail(
	payload: ContactEmailPayload
): Promise<{ success: boolean; error?: string }> {
	const apiKey = import.meta.env.VITE_BREVO_API_KEY;
	const recipient = import.meta.env.VITE_BREVO_RECIPIENT ?? 'hello@metacleaner.app';

	try {
		const response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': apiKey
			},
			body: JSON.stringify({
				sender: { name: payload.senderName, email: payload.senderEmail },
				to: [{ email: recipient }],
				subject: payload.subject,
				textContent: payload.message
			})
		});

		if (!response.ok) {
			const text = await response.text();
			return { success: false, error: text };
		}

		return { success: true };
	} catch (err) {
		return { success: false, error: err instanceof Error ? err.message : 'Network error' };
	}
}
