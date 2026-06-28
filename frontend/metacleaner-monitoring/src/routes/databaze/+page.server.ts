import type { PageServerLoad } from './$types.js';
import type { DatabasePageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getTableStats } from '$lib/server/clients/supabaseClient.js';
import { mapToTableSizes, mapToDbKpis } from '$lib/server/mappers/supabaseMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	if (!configs.supabase.configured) {
		const nc = notConfigured(configs.supabase.missingVars);
		return { kpis: nc, tableSizes: nc } satisfies DatabasePageData;
	}

	const supabaseConfig = configs.supabase.config;

	const [tableStatsSettled] = await Promise.allSettled([getTableStats(supabaseConfig)]);

	const kpis = await callSection(async () => {
		if (tableStatsSettled.status === 'rejected') throw tableStatsSettled.reason;
		return mapToDbKpis(tableStatsSettled.value);
	});

	const tableSizes = await callSection(async () => {
		if (tableStatsSettled.status === 'rejected') throw tableStatsSettled.reason;
		return mapToTableSizes(tableStatsSettled.value);
	});

	return { kpis, tableSizes } satisfies DatabasePageData;
};
