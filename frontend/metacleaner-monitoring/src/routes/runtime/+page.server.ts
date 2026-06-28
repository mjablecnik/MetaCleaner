import type { PageServerLoad } from './$types.js';
import type { RuntimePageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getMachinesForAllApps } from '$lib/server/clients/flyClient.js';
import {
	mapToMachineInstances,
	mapToDeployEntries,
	mapToRuntimeStats,
	mapToRuntimeErrors
} from '$lib/server/mappers/flyMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	if (!configs.fly.configured) {
		const nc = notConfigured(configs.fly.missingVars);
		return {
			stats: nc,
			machines: nc,
			deploys: nc,
			errors: nc
		} satisfies RuntimePageData;
	}

	const flyConfig = configs.fly.config;

	const [machinesSettled] = await Promise.allSettled([getMachinesForAllApps(flyConfig)]);

	const stats = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		return mapToRuntimeStats(machinesSettled.value);
	});

	const machines = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		return mapToMachineInstances(machinesSettled.value);
	});

	const deploys = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		const allMachines = Array.from(machinesSettled.value.values()).flat();
		return mapToDeployEntries(allMachines);
	});

	const errors = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		const allMachines = Array.from(machinesSettled.value.values()).flat();
		return mapToRuntimeErrors(allMachines);
	});

	return { stats, machines, deploys, errors } satisfies RuntimePageData;
};
