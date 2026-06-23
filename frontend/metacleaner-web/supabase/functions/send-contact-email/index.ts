import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Rate limiting: max 5 requests per IP per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const entry = ipRequestMap.get(ip);

	if (!entry || now > entry.resetAt) {
		ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return false;
	}

	entry.count++;
	return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

// Periodically clean up expired entries (every 5 minutes)
setInterval(
	() => {
		const now = Date.now();
		for (const [ip, entry] of ipRequestMap) {
			if (now > entry.resetAt) {
				ipRequestMap.delete(ip);
			}
		}
	},
	5 * 60 * 1000
);

function getAllowedOrigins(): string[] {
	const originsEnv = Deno.env.get('ALLOWED_ORIGINS');
	if (originsEnv) {
		return originsEnv.split(',').map((o) => o.trim());
	}
	// Defaults: production + local dev
	return [
		'https://metacleaner.app',
		'https://www.metacleaner.app',
		'http://localhost:5173',
		'http://localhost:4173',
		'http://localhost:3001'
	];
}

function isProduction(): boolean {
	const env = Deno.env.get('ENVIRONMENT') ?? 'development';
	return env === 'production';
}

function isAllowedOrigin(origin: string): boolean {
	const allowedOrigins = getAllowedOrigins();
	if (allowedOrigins.includes(origin)) return true;

	// Allow localhost and private network origins only in non-production
	if (!isProduction()) {
		try {
			const url = new URL(origin);
			const host = url.hostname;
			if (
				host === 'localhost' ||
				host === '127.0.0.1' ||
				host.startsWith('192.168.') ||
				host.startsWith('10.') ||
				host.startsWith('172.')
			) {
				return true;
			}
		} catch {
			// Invalid URL — not allowed
		}
	}

	return false;
}

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
	const origin =
		requestOrigin && isAllowedOrigin(requestOrigin) ? requestOrigin : getAllowedOrigins()[0];

	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization'
	};
}

interface ContactPayload {
	senderName: string;
	senderEmail: string;
	subject: string;
	message: string;
}

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePayload(
	body: unknown
): { valid: true; data: ContactPayload } | { valid: false; error: string } {
	if (!body || typeof body !== 'object') {
		return { valid: false, error: 'Invalid request body' };
	}

	const { senderName, senderEmail, subject, message } = body as Record<string, unknown>;

	if (typeof senderName !== 'string' || !senderName.trim() || senderName.length > 100) {
		return { valid: false, error: 'Invalid name (required, max 100 chars)' };
	}

	if (
		typeof senderEmail !== 'string' ||
		!senderEmail.trim() ||
		senderEmail.length > 254 ||
		!isValidEmail(senderEmail)
	) {
		return { valid: false, error: 'Invalid email address' };
	}

	if (typeof subject !== 'string' || !subject.trim() || subject.length > 150) {
		return {
			valid: false,
			error: 'Invalid subject (required, max 150 chars)'
		};
	}

	if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
		return {
			valid: false,
			error: 'Invalid message (required, max 2000 chars)'
		};
	}

	return {
		valid: true,
		data: {
			senderName: senderName.trim(),
			senderEmail: senderEmail.trim(),
			subject: subject.trim(),
			message: message.trim()
		}
	};
}

Deno.serve(async (req) => {
	const requestOrigin = req.headers.get('Origin');
	const corsHeaders = getCorsHeaders(requestOrigin);

	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	if (req.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	// Rate limiting
	const clientIp =
		req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		req.headers.get('cf-connecting-ip') ??
		'unknown';

	if (isRateLimited(clientIp)) {
		return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
			status: 429,
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json',
				'Retry-After': '600'
			}
		});
	}

	// Get secrets
	const brevoApiKey = Deno.env.get('BREVO_API_KEY');
	const recipient = Deno.env.get('CONTACT_RECIPIENT') ?? 'hello@metacleaner.app';
	const senderEmail = Deno.env.get('CONTACT_SENDER_EMAIL') ?? 'noreply@metacleaner.app';

	if (!brevoApiKey) {
		console.error('BREVO_API_KEY secret is not configured');
		return new Response(JSON.stringify({ error: 'Email service not configured' }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	// Parse and validate request body
	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	const validation = validatePayload(body);
	if (!validation.valid) {
		return new Response(JSON.stringify({ error: validation.error }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	const { data } = validation;

	// Send email via Brevo
	try {
		const brevoResponse = await fetch(BREVO_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': brevoApiKey
			},
			body: JSON.stringify({
				sender: { name: 'MetaCleaner', email: senderEmail },
				replyTo: { name: data.senderName, email: data.senderEmail },
				to: [{ email: recipient }],
				subject: `Contact form message`,
				textContent: `From: ${data.senderName} (${data.senderEmail})\n\nSubject: ${data.subject}\n\n${data.message}`
			})
		});

		if (!brevoResponse.ok) {
			const errorText = await brevoResponse.text();
			console.error(`Brevo API error (${brevoResponse.status}): ${errorText}`);
			return new Response(JSON.stringify({ error: 'Failed to send email' }), {
				status: 502,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Failed to call Brevo API:', err);
		return new Response(JSON.stringify({ error: 'Email service unavailable' }), {
			status: 502,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
});
