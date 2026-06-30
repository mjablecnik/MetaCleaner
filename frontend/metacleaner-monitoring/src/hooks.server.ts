import type { Handle } from '@sveltejs/kit';
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

export const handle: Handle = handleParaglide;
