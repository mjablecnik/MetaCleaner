import type { PageServerLoad } from './$types.js';
import type { ErrorsPageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getRecentIssues } from '$lib/server/clients/sentryClient.js';
import {
	mapToErrorLog,
	mapToErrorKpis,
	mapToTopEndpoints
} from '$lib/server/mappers/sentryMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

export const load: PageServerLoad = async ({ setHeaders, depends }) => {
	depends('app:chyby');
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	if (!configs.sentry.configured) {
		const nc = notConfigured(configs.sentry.missingVars);
		return {
			kpis: nc,
			log: nc,
			topEndpoints: nc
		} satisfies ErrorsPageData;
	}

	const sentryConfig = configs.sentry.config;

	const [issuesSettled] = await Promise.allSettled([getRecentIssues(sentryConfig, 25)]);

	const kpis = await callSection(async () => {
		if (issuesSettled.status === 'rejected') throw issuesSettled.reason;
		return mapToErrorKpis(issuesSettled.value);
	});

	const log = await callSection(async () => {
		if (issuesSettled.status === 'rejected') throw issuesSettled.reason;
		return mapToErrorLog(issuesSettled.value);
	});

	const topEndpoints = await callSection(async () => {
		if (issuesSettled.status === 'rejected') throw issuesSettled.reason;
		return mapToTopEndpoints(issuesSettled.value);
	});

	return { kpis, log, topEndpoints } satisfies ErrorsPageData;
};
