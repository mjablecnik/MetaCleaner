import type { PageServerLoad } from './$types.js';
import type { EdgePageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import {
	getAnalytics,
	getGeoDistribution,
	getFirewallEvents
} from '$lib/server/clients/cloudflareClient.js';
import {
	mapToEdgeKpiStats,
	mapToGeoDistribution,
	mapToWafLog,
	mapToHttpStatusDistribution
} from '$lib/server/mappers/cloudflareMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	if (!configs.cloudflare.configured) {
		const nc = notConfigured(configs.cloudflare.missingVars);
		return {
			kpis: nc,
			geoDistribution: nc,
			wafLog: nc,
			httpStatusDistribution: nc
		} satisfies EdgePageData;
	}

	const cfConfig = configs.cloudflare.config;

	const [analyticsSettled, geoSettled, firewallSettled] = await Promise.allSettled([
		getAnalytics(cfConfig),
		getGeoDistribution(cfConfig),
		getFirewallEvents(cfConfig, 20)
	]);

	const kpis = await callSection(async () => {
		if (analyticsSettled.status === 'rejected') throw analyticsSettled.reason;
		return mapToEdgeKpiStats(analyticsSettled.value);
	});

	const geoDistribution = await callSection(async () => {
		if (geoSettled.status === 'rejected') throw geoSettled.reason;
		return mapToGeoDistribution(geoSettled.value);
	});

	const wafLog = await callSection(async () => {
		if (firewallSettled.status === 'rejected') throw firewallSettled.reason;
		return mapToWafLog(firewallSettled.value);
	});

	const httpStatusDistribution = await callSection(async () => {
		if (analyticsSettled.status === 'rejected') throw analyticsSettled.reason;
		return mapToHttpStatusDistribution(analyticsSettled.value);
	});

	return { kpis, geoDistribution, wafLog, httpStatusDistribution } satisfies EdgePageData;
};
