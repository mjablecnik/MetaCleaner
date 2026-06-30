import type {
	MachineInstance,
	DeployEntry,
	ServiceCard,
	RuntimeStat,
	RuntimeErrorEntry,
	HealthCheck,
	Incident,
	SlaGoal
} from '$lib/repositories/index.js';
import type { FlyMachineRaw } from '../clients/flyClient.js';

const REGION_NAMES: Record<string, string> = {
	ams: 'Amsterdam',
	arn: 'Stockholm',
	atl: 'Atlanta',
	bog: 'Bogotá',
	bom: 'Mumbai',
	bos: 'Boston',
	cdg: 'Paris',
	den: 'Denver',
	dfw: 'Dallas',
	ewr: 'Secaucus NJ',
	eze: 'Ezeiza',
	fra: 'Frankfurt',
	gdl: 'Guadalajara',
	gig: 'Rio de Janeiro',
	gru: 'São Paulo',
	hkg: 'Hong Kong',
	iad: 'Ashburn',
	jnb: 'Johannesburg',
	lax: 'Los Angeles',
	lhr: 'London',
	mad: 'Madrid',
	mia: 'Miami',
	nrt: 'Tokyo',
	ord: 'Chicago',
	otp: 'Bucharest',
	phx: 'Phoenix',
	qro: 'Querétaro',
	scl: 'Santiago',
	sea: 'Seattle',
	sin: 'Singapore',
	sjc: 'San Jose',
	syd: 'Sydney',
	waw: 'Warsaw',
	yul: 'Montréal',
	yyz: 'Toronto'
};

// Fly.io machine event timestamps are in nanoseconds
function flyTimestampToMs(ts: number): number {
	if (ts > 1e15) return ts / 1_000_000;
	if (ts > 1e12) return ts / 1_000;
	return ts * 1_000;
}

function formatUptime(startMs: number): string {
	const nowMs = Date.now();
	const diffMs = nowMs - startMs;
	if (diffMs < 0) return '—';

	const seconds = Math.floor(diffMs / 1000);
	if (seconds < 60) return `${seconds}s`;

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m`;

	const hours = Math.floor(minutes / 60);
	const remMin = minutes % 60;
	if (hours < 24) return `${hours}h ${remMin}m`;

	const days = Math.floor(hours / 24);
	const remHours = hours % 24;
	return `${days}d ${remHours}h`;
}

function formatTimestamp(dateMs: number): string {
	const date = new Date(dateMs);
	const now = new Date();
	const diffDays = Math.floor((now.getTime() - dateMs) / (1000 * 60 * 60 * 24));
	const hh = String(date.getHours()).padStart(2, '0');
	const mm = String(date.getMinutes()).padStart(2, '0');

	if (diffDays === 0) return `Today ${hh}:${mm}`;
	if (diffDays === 1) return `Yesterday ${hh}:${mm}`;
	return `${diffDays} days ago ${hh}:${mm}`;
}

function getMachineStatus(machine: FlyMachineRaw): 'running' | 'stopped' | 'error' {
	if (machine.state === 'started') return 'running';
	if (machine.state === 'stopped') return 'stopped';
	return 'error';
}

function getAppStatus(machines: FlyMachineRaw[]): 'online' | 'degraded' | 'offline' {
	if (machines.length === 0) return 'offline';
	const hasStarted = machines.some((m) => m.state === 'started');
	if (!hasStarted) return 'offline';
	const hasFailingChecks = machines.some((m) => m.checks?.some((c) => c.status !== 'passing'));
	return hasFailingChecks ? 'degraded' : 'online';
}

export function mapToMachineInstances(raw: Map<string, FlyMachineRaw[]>): MachineInstance[] {
	const result: MachineInstance[] = [];

	for (const [app, machines] of raw) {
		for (const machine of machines) {
			const status = getMachineStatus(machine);
			const memoryMb = machine.config?.guest?.memory_mb ?? 256;

			// Find last start event for uptime; fall back to created_at
			const startEvents = (machine.events ?? [])
				.filter((e) => e.type === 'start')
				.sort((a, b) => b.timestamp - a.timestamp);
			const lastStartMs =
				startEvents.length > 0
					? flyTimestampToMs(startEvents[0].timestamp)
					: new Date(machine.created_at).getTime();
			const uptime = status === 'running' ? formatUptime(lastStartMs) : '—';

			const regionCode = machine.region ?? '';
			const city = REGION_NAMES[regionCode];
			const regionDisplay = city ? `${regionCode} (${city})` : regionCode;

			const ramTotalGb = memoryMb / 1024;
			const ramTotalDisplay =
				ramTotalGb < 1 ? ramTotalGb.toFixed(2) : String(Math.round(ramTotalGb * 10) / 10);

			// Fly Machines API does not expose real-time CPU metrics
			const cpuPercent = 0;
			const cpuClass = status === 'running' ? 'bg-[#a78bfa]' : 'bg-[#334155]';

			result.push({
				id: machine.id,
				name: machine.name,
				displayId: machine.id.slice(0, 8),
				app,
				region: regionDisplay,
				status,
				cpuPercent,
				cpuClass,
				cpuDisplay: `${cpuPercent}%`,
				cpuWarning: false,
				ramDisplay: `${memoryMb} MB`,
				ramTotalDisplay,
				ramBarWidth: '0%',
				uptime
			});
		}
	}

	return result;
}

export function mapToDeployEntries(machines: FlyMachineRaw[]): DeployEntry[] {
	type WithTs = DeployEntry & { _sortMs: number };
	const entries: WithTs[] = [];

	for (const machine of machines) {
		const launchEvents = (machine.events ?? []).filter(
			(e) => e.type === 'launch' || e.type === 'start'
		);

		for (const event of launchEvents) {
			const tsMs = flyTimestampToMs(event.timestamp);
			const succeeded = !event.status || event.status === 'success';
			const deployStatus: 'success' | 'failed' | 'rollback' = succeeded ? 'success' : 'failed';

			entries.push({
				_sortMs: tsMs,
				id: `${machine.id}-${event.timestamp}`,
				version: '—',
				app: machine.name,
				author: '—',
				commitMessage: `Machine ${machine.name} ${event.type}`,
				timestamp: formatTimestamp(tsMs),
				duration: '—',
				status: deployStatus,
				statusClass:
					deployStatus === 'success' ? 'bg-success/15 text-success' : 'bg-error/15 text-error',
				statusKey: deployStatus === 'success' ? 'common_status_ok' : 'runtime_deploy_failed',
				icon: deployStatus === 'success' ? 'fa-check' : 'fa-xmark',
				iconClass:
					deployStatus === 'success' ? 'bg-success/15 text-success' : 'bg-error/15 text-error',
				subtext: `${machine.region} · ${machine.name}`
			});
		}
	}

	entries.sort((a, b) => b._sortMs - a._sortMs);

	return entries.slice(0, 20).map(({ _sortMs: _ts, ...entry }) => entry);
}

export function mapToServiceCards(raw: Map<string, FlyMachineRaw[]>): ServiceCard[] {
	const cards: ServiceCard[] = [];

	for (const [app, machines] of raw) {
		const status = getAppStatus(machines);
		const totalMachines = machines.length;
		const onlineMachines = machines.filter((m) => m.state === 'started').length;
		const uptimePercent =
			totalMachines > 0 ? Math.round((onlineMachines / totalMachines) * 10000) / 100 : 0;
		const barClass =
			status === 'online' ? 'bg-success' : status === 'degraded' ? 'bg-secondary' : 'bg-error';

		cards.push({
			key: app,
			name: app,
			icon: 'fa-server',
			provider: 'Fly.io',
			status,
			uptimePercent,
			uptimeDisplay: uptimePercent.toFixed(2),
			outageCount: 0,
			outageLabel: '0 outages',
			trend: '—',
			trendPositive: true,
			barClass,
			downDays: [],
			degradedDays: []
		});
	}

	return cards;
}

function formatTimeHms(ms: number): string {
	const date = new Date(ms);
	const hh = String(date.getHours()).padStart(2, '0');
	const mm = String(date.getMinutes()).padStart(2, '0');
	const ss = String(date.getSeconds()).padStart(2, '0');
	return `${hh}:${mm}:${ss}`;
}

type ErrorEventConfig = {
	level: string;
	levelClass: string;
	borderClass: string;
	statusKey: string;
	statusClass: string;
	message: (machine: FlyMachineRaw, eventType: string) => string;
};

function classifyEvent(type: string, status: string): ErrorEventConfig | null {
	if (type === 'kill') {
		return {
			level: 'OOM Kill',
			levelClass: 'bg-error/15 text-error',
			borderClass: 'border-error/20',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success',
			message: (m) => `Machine ${m.name} killed in ${m.region}`
		};
	}
	if (type === 'crash') {
		return {
			level: 'Crash',
			levelClass: 'bg-secondary/15 text-secondary',
			borderClass: 'border-secondary/20',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success',
			message: (m) => `Machine ${m.name} crashed in ${m.region}`
		};
	}
	if (type === 'exit' && status !== 'success') {
		return {
			level: 'Crash',
			levelClass: 'bg-secondary/15 text-secondary',
			borderClass: 'border-secondary/20',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success',
			message: (m) => `Machine ${m.name} exited with status: ${status}`
		};
	}
	if (type === 'restart') {
		return {
			level: 'Restart',
			levelClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			borderClass: 'border-[#8b5cf6]/20',
			statusKey: 'common_status_restarted',
			statusClass: 'bg-success/10 text-success',
			message: (m) => `Machine ${m.name} restarted in ${m.region}`
		};
	}
	return null;
}

export function mapToRuntimeErrors(machines: FlyMachineRaw[]): RuntimeErrorEntry[] {
	type WithMs = RuntimeErrorEntry & { _sortMs: number };
	const entries: WithMs[] = [];

	for (const machine of machines) {
		// Collect health check failures as error entries
		const failingChecks = (machine.checks ?? []).filter((c) => c.status !== 'passing');
		if (failingChecks.length > 0) {
			const tsMs = new Date(machine.updated_at).getTime();
			entries.push({
				_sortMs: tsMs,
				id: `health-${machine.id}`,
				time: formatTimeHms(tsMs),
				level: 'Health',
				levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
				borderClass: 'border-[#334155]/40',
				message: `Health checks failing on ${machine.name}: ${failingChecks.map((c) => c.name).join(', ')}`,
				machine: machine.name,
				statusKey: 'common_status_resolved',
				statusClass: 'bg-success/10 text-success'
			});
		}

		// Collect error events
		for (const event of machine.events ?? []) {
			const cfg = classifyEvent(event.type, event.status);
			if (!cfg) continue;

			const tsMs = flyTimestampToMs(event.timestamp);
			entries.push({
				_sortMs: tsMs,
				id: `${event.type}-${machine.id}-${event.timestamp}`,
				time: formatTimeHms(tsMs),
				level: cfg.level,
				levelClass: cfg.levelClass,
				borderClass: cfg.borderClass,
				message: cfg.message(machine, event.type),
				machine: machine.name,
				statusKey: cfg.statusKey,
				statusClass: cfg.statusClass
			});
		}
	}

	entries.sort((a, b) => b._sortMs - a._sortMs);

	return entries.slice(0, 20).map(({ _sortMs: _ts, ...entry }) => entry);
}

export function mapToHealthChecks(raw: Map<string, FlyMachineRaw[]>): HealthCheck[] {
	const checks: HealthCheck[] = [];

	for (const [app, machines] of raw) {
		for (const machine of machines) {
			if (machine.checks && machine.checks.length > 0) {
				for (const check of machine.checks) {
					const isPassing = check.status === 'passing';
					checks.push({
						endpoint: check.name || `check:${machine.id.slice(0, 8)}`,
						service: app,
						status: isPassing ? 'online' : 'degraded',
						statusCode: isPassing ? '200 OK' : '—',
						latencyMs: 0
					});
				}
			} else {
				const isRunning = machine.state === 'started';
				checks.push({
					endpoint: `machine:${machine.id.slice(0, 8)}`,
					service: app,
					status: isRunning ? 'online' : 'offline',
					statusCode: isRunning ? '200 OK' : '—',
					latencyMs: 0
				});
			}
		}
	}

	return checks;
}

export function mapToIncidents(raw: Map<string, FlyMachineRaw[]>): Incident[] {
	type WithMs = Incident & { _sortMs: number };
	const incidents: WithMs[] = [];

	for (const [app, machines] of raw) {
		for (const machine of machines) {
			for (const event of machine.events ?? []) {
				const cfg = classifyEvent(event.type, event.status);
				if (!cfg) continue;

				const tsMs = flyTimestampToMs(event.timestamp);
				const date = new Date(tsMs);
				const diffDays = Math.floor((Date.now() - tsMs) / (1000 * 60 * 60 * 24));
				const hh = String(date.getHours()).padStart(2, '0');
				const mm = String(date.getMinutes()).padStart(2, '0');

				let timestampDisplay: string;
				if (diffDays === 0) timestampDisplay = `Today, ${hh}:${mm}`;
				else if (diffDays === 1) timestampDisplay = `Yesterday, ${hh}:${mm}`;
				else timestampDisplay = `${diffDays} days ago, ${hh}:${mm}`;

				incidents.push({
					_sortMs: tsMs,
					id: `fly-${machine.id}-${event.timestamp}`,
					status: 'resolved',
					title: `${cfg.level} on ${machine.name}`,
					descriptionDesktop: cfg.message(machine, event.type),
					descriptionMobile: cfg.message(machine, event.type),
					service: app,
					serviceIcon: 'fa-server',
					timestamp: timestampDisplay,
					duration: '—'
				});
			}
		}
	}

	incidents.sort((a, b) => b._sortMs - a._sortMs);
	return incidents.slice(0, 10).map(({ _sortMs: _, ...inc }) => inc);
}

export function mapToSlaGoals(raw: Map<string, FlyMachineRaw[]>): SlaGoal[] {
	const goals: SlaGoal[] = [];

	for (const [app, machines] of raw) {
		const status = getAppStatus(machines);
		const totalMachines = machines.length;
		const onlineMachines = machines.filter((m) => m.state === 'started').length;
		const uptimePercent =
			totalMachines > 0 ? Math.round((onlineMachines / totalMachines) * 10000) / 100 : 0;

		const target = 99.9;
		const met = uptimePercent >= target;
		const barClass = met ? 'bg-success' : status === 'degraded' ? 'bg-secondary' : 'bg-error';

		goals.push({
			service: app,
			actual: uptimePercent,
			target,
			met,
			barClass
		});
	}

	return goals;
}

export function mapToRuntimeStats(raw: Map<string, FlyMachineRaw[]>): RuntimeStat[] {
	let totalMachines = 0;
	let onlineMachines = 0;
	let totalCpus = 0;
	let totalMemoryMb = 0;
	let restartCount = 0;

	for (const machines of raw.values()) {
		for (const machine of machines) {
			totalMachines++;
			if (machine.state === 'started') onlineMachines++;
			totalCpus += machine.config?.guest?.cpus ?? 1;
			totalMemoryMb += machine.config?.guest?.memory_mb ?? 256;

			const restartEvents = (machine.events ?? []).filter(
				(e) => e.type === 'restart' || e.type === 'start'
			);
			if (restartEvents.length > 1) restartCount++;
		}
	}

	const uptimePercent =
		totalMachines > 0 ? Math.round((onlineMachines / totalMachines) * 10000) / 100 : 0;
	const totalMemoryGb = Math.round((totalMemoryMb / 1024) * 10) / 10;

	const uptimeClass =
		uptimePercent >= 99 ? 'text-success' : uptimePercent >= 95 ? 'text-secondary' : 'text-error';
	const uptimeBadgeKey = uptimePercent >= 99 ? 'common_status_ok' : 'common_status_warning';
	const uptimeBadgeClass =
		uptimePercent >= 99 ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary';

	return [
		{
			key: 'cpuUsage',
			labelKey: 'runtime_kpi_cpuUsage',
			value: '—',
			unit: '%',
			icon: 'fa-microchip',
			iconClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			barWidth: '0%',
			barClass: 'bg-secondary',
			subtext: `${totalCpus} CPU${totalCpus !== 1 ? 's' : ''} total · ${totalMachines} machines`,
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success'
		},
		{
			key: 'ramUsage',
			labelKey: 'runtime_kpi_ramUsage',
			value: '—',
			unit: `/ ${totalMemoryGb} GB`,
			icon: 'fa-memory',
			iconClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			barWidth: '0%',
			barClass: 'bg-[#3b82f6]',
			subtext: `${totalMemoryGb} GB total allocated`,
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success'
		},
		{
			key: 'uptime30d',
			labelKey: 'runtime_kpi_uptime30d',
			value: uptimePercent.toFixed(2),
			unit: '%',
			valueClass: uptimeClass,
			icon: 'fa-check-circle',
			iconClass: `bg-${uptimePercent >= 99 ? 'success' : 'secondary'}/15 text-${uptimePercent >= 99 ? 'success' : 'secondary'}`,
			subtext: `${onlineMachines} / ${totalMachines} machines online`,
			badgeKey: uptimeBadgeKey,
			badgeClass: uptimeBadgeClass
		},
		{
			key: 'restarts24h',
			labelKey: 'runtime_kpi_restarts24h',
			value: String(restartCount),
			valueClass: restartCount > 0 ? 'text-error' : undefined,
			icon: 'fa-rotate-right',
			iconClass: restartCount > 0 ? 'bg-secondary/15 text-secondary' : 'bg-success/15 text-success',
			subtext: `${totalMachines} machines total`,
			badgeKey: restartCount > 0 ? 'common_status_warning' : 'common_status_ok',
			badgeClass: restartCount > 0 ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success'
		}
	];
}
