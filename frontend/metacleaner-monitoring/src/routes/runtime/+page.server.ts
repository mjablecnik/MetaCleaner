import type { PageServerLoad } from './$types.js';
import type { RuntimePageData } from '$lib/types/pageData.js';
import { getServiceConfigs } from '$lib/server/config.js';
import { getMachinesForAllApps } from '$lib/server/clients/flyClient.js';
import {
	getCurrentCpuPercent,
	getCurrentRamUsage,
	getCpuOverTime,
	getRamOverTime
} from '$lib/server/clients/flyPrometheusClient.js';
import {
	mapToMachineInstances,
	mapToDeployEntries,
	mapToRuntimeStats,
	mapToRuntimeErrors
} from '$lib/server/mappers/flyMapper.js';
import {
	mapToCurrentCpu,
	mapToCurrentRam,
	mapToTimeSeries
} from '$lib/server/mappers/flyPrometheusMapper.js';
import { callSection, notConfigured } from '$lib/server/clients/types.js';

const TWENTY_FOUR_HOURS_SECONDS = 24 * 60 * 60;
const TIME_SERIES_STEP_SECONDS = 300;

export const load: PageServerLoad = async ({ setHeaders, depends }) => {
	depends('app:runtime');
	setHeaders({ 'Cache-Control': 'no-store' });
	const configs = getServiceConfigs();

	if (!configs.fly.configured) {
		const nc = notConfigured(configs.fly.missingVars);
		return {
			stats: nc,
			machines: nc,
			deploys: nc,
			errors: nc,
			cpuCurrent: nc,
			ramCurrent: nc,
			cpuTimeSeries: nc,
			ramTimeSeries: nc
		} satisfies RuntimePageData;
	}

	const flyConfig = configs.fly.config;
	const end = Math.floor(Date.now() / 1000);
	const start = end - TWENTY_FOUR_HOURS_SECONDS;

	const [machinesSettled, cpuCurrentSettled, ramCurrentSettled, cpuRangeSettled, ramRangeSettled] =
		await Promise.allSettled([
			getMachinesForAllApps(flyConfig),
			getCurrentCpuPercent(flyConfig),
			getCurrentRamUsage(flyConfig),
			getCpuOverTime(flyConfig, start, end, TIME_SERIES_STEP_SECONDS),
			getRamOverTime(flyConfig, start, end, TIME_SERIES_STEP_SECONDS)
		]);

	const cpuCurrent = await callSection(async () => {
		if (cpuCurrentSettled.status === 'rejected') throw cpuCurrentSettled.reason;
		return mapToCurrentCpu(cpuCurrentSettled.value);
	});

	const ramCurrent = await callSection(async () => {
		if (ramCurrentSettled.status === 'rejected') throw ramCurrentSettled.reason;
		return mapToCurrentRam(ramCurrentSettled.value);
	});

	const stats = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		const cpuUsage = cpuCurrent.status === 'ok' ? cpuCurrent.data : undefined;
		const ramUsage = ramCurrent.status === 'ok' ? ramCurrent.data : undefined;
		return mapToRuntimeStats(machinesSettled.value, cpuUsage, ramUsage);
	});

	const machines = await callSection(async () => {
		if (machinesSettled.status === 'rejected') throw machinesSettled.reason;
		const cpuData = cpuCurrent.status === 'ok' ? cpuCurrent.data : undefined;
		const ramData = ramCurrent.status === 'ok' ? ramCurrent.data : undefined;
		return mapToMachineInstances(machinesSettled.value, cpuData, ramData);
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

	const cpuTimeSeries = await callSection(async () => {
		if (cpuRangeSettled.status === 'rejected') throw cpuRangeSettled.reason;
		return mapToTimeSeries(cpuRangeSettled.value);
	});

	const ramTimeSeries = await callSection(async () => {
		if (ramRangeSettled.status === 'rejected') throw ramRangeSettled.reason;
		return mapToTimeSeries(ramRangeSettled.value);
	});

	return {
		stats,
		machines,
		deploys,
		errors,
		cpuCurrent,
		ramCurrent,
		cpuTimeSeries,
		ramTimeSeries
	} satisfies RuntimePageData;
};
