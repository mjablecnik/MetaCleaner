import type { PageServerLoad } from './$types.js';
import type { BusinessPageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import {
	getActiveSubscriptions,
	getCanceledSubscriptions,
	getPrices
} from '$lib/server/clients/stripeClient.js';
import { mapToBusinessKpiStats, mapToPlanRevenue } from '$lib/server/mappers/stripeMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

export const load: PageServerLoad = async ({ setHeaders, depends }) => {
	depends('app:business');
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	if (!configs.stripe.configured) {
		const nc = notConfigured(configs.stripe.missingVars);
		return {
			kpis: nc,
			planRevenue: nc,
			conversionFunnel: nc
		} satisfies BusinessPageData;
	}

	const stripeConfig = configs.stripe.config;
	const since = Math.floor(Date.now() / 1000) - THIRTY_DAYS_SECONDS;

	const [activeSettled, canceledSettled, pricesSettled] = await Promise.allSettled([
		getActiveSubscriptions(stripeConfig),
		getCanceledSubscriptions(stripeConfig, since),
		getPrices(stripeConfig)
	]);

	const kpis = await callSection(async () => {
		if (activeSettled.status === 'rejected') throw activeSettled.reason;
		const canceledSubs = canceledSettled.status === 'fulfilled' ? canceledSettled.value : [];
		return mapToBusinessKpiStats(activeSettled.value, canceledSubs);
	});

	const planRevenue = await callSection(async () => {
		if (activeSettled.status === 'rejected') throw activeSettled.reason;
		if (pricesSettled.status === 'rejected') throw pricesSettled.reason;
		return mapToPlanRevenue(activeSettled.value, pricesSettled.value);
	});

	const conversionFunnel = notConfigured([]);

	return { kpis, planRevenue, conversionFunnel } satisfies BusinessPageData;
};
