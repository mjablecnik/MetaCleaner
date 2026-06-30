import type { PageServerLoad } from './$types.js';
import type { AvailabilityPageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getMachinesForAllApps } from '$lib/server/clients/flyClient.js';
import {
	mapToServiceCards,
	mapToHealthChecks,
	mapToIncidents,
	mapToSlaGoals
} from '$lib/server/mappers/flyMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

export const load: PageServerLoad = async ({ setHeaders, depends }) => {
	depends('app:dostupnost');
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	if (!configs.fly.configured) {
		const nc = notConfigured(configs.fly.missingVars);
		return {
			services: nc,
			healthChecks: nc,
			incidents: nc,
			slaGoals: nc
		} satisfies AvailabilityPageData;
	}

	const flyConfig = configs.fly.config;

	const [machinesSettled] = await Promise.allSettled([getMachinesForAllApps(flyConfig)]);

	const services = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		return mapToServiceCards(machinesSettled.value);
	});

	const healthChecks = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		return mapToHealthChecks(machinesSettled.value);
	});

	const incidents = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		return mapToIncidents(machinesSettled.value);
	});

	const slaGoals = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		return mapToSlaGoals(machinesSettled.value);
	});

	return { services, healthChecks, incidents, slaGoals } satisfies AvailabilityPageData;
};
