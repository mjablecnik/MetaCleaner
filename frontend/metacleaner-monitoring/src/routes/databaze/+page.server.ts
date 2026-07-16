import type { PageServerLoad } from './$types.js';
import type { DatabasePageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getTableStats } from '$lib/server/clients/supabaseClient.js';
import { mapToTableSizes, mapToDbKpis } from '$lib/server/mappers/supabaseMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

export const load: PageServerLoad = async ({ setHeaders, depends }) => {
	depends('app:databaze');
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
		const raw = tableStatsSettled.value;
		if (!Array.isArray(raw)) throw new Error('Unexpected response from get_table_stats RPC');
		return mapToDbKpis(raw);
	});

	const tableSizes = await callSection(async () => {
		if (tableStatsSettled.status === 'rejected') throw tableStatsSettled.reason;
		const raw = tableStatsSettled.value;
		if (!Array.isArray(raw)) throw new Error('Unexpected response from get_table_stats RPC');
		// Deduplicate by table_name to prevent each_key_duplicate errors
		const seen = new Set<string>();
		const deduped = raw.filter((row) => {
			if (seen.has(row.table_name)) return false;
			seen.add(row.table_name);
			return true;
		});
		return mapToTableSizes(deduped);
	});

	return { kpis, tableSizes } satisfies DatabasePageData;
};
