import type { PageServerLoad } from './$types.js';
import type { PerformancePageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getAnalytics } from '$lib/server/clients/cloudflareClient.js';
import { getMachinesForAllApps } from '$lib/server/clients/flyClient.js';
import { getRecentIssues } from '$lib/server/clients/sentryClient.js';
import {
	mapToPerformanceKpiStats,
	mapToSlowEndpoints,
	mapToPerformanceEvents
} from '$lib/server/mappers/performanceMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

export const load: PageServerLoad = async ({ setHeaders, depends }) => {
	depends('app:performance');
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	// Performance page requires at least Fly or Cloudflare for KPIs
	if (!configs.fly.configured && !configs.cloudflare.configured) {
		const missingVars = [
			...(!configs.fly.configured ? configs.fly.missingVars : []),
			...(!configs.cloudflare.configured ? configs.cloudflare.missingVars : [])
		];
		const nc = notConfigured([...new Set(missingVars)]);
		return {
			kpis: nc,
			slowEndpoints: nc,
			events: nc
		} satisfies PerformancePageData;
	}

	// Fetch all relevant data concurrently
	const [cfSettled, flySettled, sentrySettled] = await Promise.allSettled([
		configs.cloudflare.configured ? getAnalytics(configs.cloudflare.config) : Promise.resolve(null),
		configs.fly.configured ? getMachinesForAllApps(configs.fly.config) : Promise.resolve(null),
		configs.sentry.configured ? getRecentIssues(configs.sentry.config, 25) : Promise.resolve(null)
	]);

	const kpis = await callSection(async () => {
		const cfData = cfSettled.status === 'fulfilled' ? cfSettled.value : null;
		const flyData = flySettled.status === 'fulfilled' ? flySettled.value : null;

		// If the only configured primary source failed, propagate the error
		if (configs.cloudflare.configured && !configs.fly.configured) {
			if (cfSettled.status === 'rejected') throw cfSettled.reason;
		} else if (configs.fly.configured && !configs.cloudflare.configured) {
			if (flySettled.status === 'rejected') throw flySettled.reason;
		} else if (cfData === null && flyData === null) {
			// Both were configured but both failed
			if (cfSettled.status === 'rejected') throw cfSettled.reason;
		}

		const sentryData =
			sentrySettled.status === 'fulfilled' && sentrySettled.value !== null
				? sentrySettled.value
				: [];

		return mapToPerformanceKpiStats(cfData, flyData, sentryData);
	});

	// Real per-endpoint latency data is not available from Fly Machines API or Cloudflare Analytics.
	// mapToSlowEndpoints([]) returns [] honestly rather than estimating avgMs from Sentry issue severity.
	// Integrate a real latency source (e.g. Cloudflare httpRequestsAdaptiveGroups) to populate this.
	const slowEndpoints = await callSection(async () => mapToSlowEndpoints([]));

	// Events from Sentry issues + Fly machine events (use whatever is available)
	const events = await callSection(async () => {
		const flyData = flySettled.status === 'fulfilled' ? flySettled.value : null;
		const sentryData =
			sentrySettled.status === 'fulfilled' && sentrySettled.value !== null
				? sentrySettled.value
				: [];
		return mapToPerformanceEvents(sentryData, flyData);
	});

	return { kpis, slowEndpoints, events } satisfies PerformancePageData;
};
