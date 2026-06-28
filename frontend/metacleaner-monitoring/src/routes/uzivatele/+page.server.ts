import type { PageServerLoad } from './$types.js';
import type { UsersPageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getUsers } from '$lib/server/clients/supabaseClient.js';
import { mapToUserStats, mapToUsers } from '$lib/server/mappers/supabaseMapper.js';
import { callSection } from '$lib/server/clients/types.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	const supabase = configs.supabase;
	if (!supabase.configured) throw new Error('Supabase is required but not configured');
	const supabaseConfig = supabase.config;

	const [usersSettled] = await Promise.allSettled([getUsers(supabaseConfig, 1, 100)]);

	const stats = await callSection(async () => {
		if (usersSettled.status === 'rejected') throw usersSettled.reason;
		const { users, total } = usersSettled.value;
		return mapToUserStats(users, total);
	});

	const users = await callSection(async () => {
		if (usersSettled.status === 'rejected') throw usersSettled.reason;
		return mapToUsers(usersSettled.value.users);
	});

	return { stats, users } satisfies UsersPageData;
};
