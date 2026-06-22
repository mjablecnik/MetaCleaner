export interface ContactEmailPayload {
	senderName: string;
	senderEmail: string;
	subject: string;
	message: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function sendContactEmail(
	payload: ContactEmailPayload
): Promise<{ success: boolean; error?: string }> {
	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
		return { success: false, error: 'Service not configured' };
	}

	const functionUrl = `${SUPABASE_URL}/functions/v1/send-contact-email`;

	try {
		const response = await fetch(functionUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${SUPABASE_ANON_KEY}`
			},
			body: JSON.stringify({
				senderName: payload.senderName,
				senderEmail: payload.senderEmail,
				subject: payload.subject,
				message: payload.message
			})
		});

		if (!response.ok) {
			const data = await response.json().catch(() => ({ error: 'Unknown error' }));
			console.error('Contact email failed:', data);

			if (response.status === 429) {
				return { success: false, error: 'rate_limit' };
			}

			return { success: false, error: data.error ?? 'Failed to send' };
		}

		return { success: true };
	} catch (err) {
		console.error('Contact email network error:', err);
		return { success: false, error: err instanceof Error ? err.message : 'Network error' };
	}
}
