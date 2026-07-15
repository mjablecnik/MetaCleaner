import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getServiceConfigs } from '$lib/server/config.js';

// Eagerly validate required env vars (SUPABASE_URL, SUPABASE_SERVICE_KEY) at startup.
// getServiceConfigs() throws if any required variable is missing, failing fast
// before the first request rather than silently appearing healthy.
try {
	getServiceConfigs();
} catch (e) {
	console.error(
		`[FATAL] Missing required configuration: ${e instanceof Error ? e.message : String(e)}`
	);
	process.exit(1);
}

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

// Simple in-memory per-IP rate limiter: 60 requests per 60 s window.
// Resets the counter when the window expires rather than using a sliding window,
// which is sufficient to prevent rapid automated scraping on a single-instance deployment.
const RL_MAX = 60;
const RL_WINDOW_MS = 60_000;
const rlMap = new Map<string, { count: number; resetAt: number }>();

const rateLimit: Handle = async ({ event, resolve }) => {
	const ip = event.getClientAddress();
	const now = Date.now();
	const entry = rlMap.get(ip);

	if (!entry || now > entry.resetAt) {
		rlMap.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
	} else {
		entry.count += 1;
		if (entry.count > RL_MAX) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) }
			});
		}
	}

	return resolve(event);
};

const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"img-src 'self' https: data:",
			// Plotly and inline Svelte styles require unsafe-inline; tighten with nonces when feasible
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
			"script-src 'self' 'unsafe-inline' https://cdn.plot.ly",
			"font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
			"connect-src 'self'",
			"frame-ancestors 'none'"
		].join('; ')
	);
	return response;
};

const requireAuth: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// Allow the login page and SvelteKit internal assets without auth
	if (pathname === '/login' || pathname.startsWith('/_app/') || pathname.startsWith('/favicon')) {
		return resolve(event);
	}

	const secret = env.DASHBOARD_SESSION_SECRET;
	const session = event.cookies.get('mc_session');

	if (!secret || !session || session !== secret) {
		redirect(303, '/login');
	}

	return resolve(event);
};

export const handle: Handle = sequence(rateLimit, requireAuth, securityHeaders, handleParaglide);
