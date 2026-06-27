export type ServiceStatus = 'online' | 'degraded' | 'offline';

export interface ServiceCard {
	key: string;
	name: string;
	icon: string;
	provider: string;
	status: ServiceStatus;
	uptimePercent: number;
	uptimeDisplay: string;
	outageCount: number;
	outageLabel: string;
	trend: string;
	trendPositive: boolean;
	barClass: string;
	downDays: number[];
	degradedDays: number[];
}

export interface HealthCheck {
	endpoint: string;
	service: string;
	status: ServiceStatus;
	statusCode: string;
	latencyMs: number;
}

export interface Incident {
	id: string;
	status: 'active' | 'resolved';
	title: string;
	descriptionDesktop: string;
	descriptionMobile: string;
	service: string;
	serviceIcon: string;
	timestamp: string;
	duration: string;
}

export interface SlaGoal {
	service: string;
	actual: number;
	target: number;
	met: boolean;
	barClass: string;
}

export interface QuickStat {
	labelKey: string;
	value: string;
	valueClass?: string;
}

export function getServiceCards(): ServiceCard[] {
	return [
		{
			key: 'frontend',
			name: 'Frontend',
			icon: 'fa-desktop',
			provider: 'Vercel / CDN',
			status: 'online',
			uptimePercent: 99.99,
			uptimeDisplay: '99.99',
			outageCount: 0,
			outageLabel: '0 výpadků',
			trend: '+0.01%',
			trendPositive: true,
			barClass: 'bg-success',
			downDays: [],
			degradedDays: [45]
		},
		{
			key: 'backend',
			name: 'Backend API',
			icon: 'fa-server',
			provider: 'Fly.io',
			status: 'online',
			uptimePercent: 99.95,
			uptimeDisplay: '99.95',
			outageCount: 2,
			outageLabel: '2 výpadky',
			trend: '-0.03%',
			trendPositive: false,
			barClass: 'bg-success',
			downDays: [12, 67],
			degradedDays: [23, 55]
		},
		{
			key: 'database',
			name: 'Databáze',
			icon: 'fa-database',
			provider: 'Supabase',
			status: 'online',
			uptimePercent: 99.97,
			uptimeDisplay: '99.97',
			outageCount: 1,
			outageLabel: '1 výpadek',
			trend: '+0.02%',
			trendPositive: true,
			barClass: 'bg-success',
			downDays: [34],
			degradedDays: [20, 60]
		},
		{
			key: 'edge',
			name: 'Edge / CDN',
			icon: 'fa-cloud',
			provider: 'Cloudflare',
			status: 'degraded',
			uptimePercent: 99.82,
			uptimeDisplay: '99.82',
			outageCount: 5,
			outageLabel: '5 výpadků',
			trend: '-0.08%',
			trendPositive: false,
			barClass: 'bg-secondary',
			downDays: [5, 18, 42, 71, 83],
			degradedDays: [0, 10, 25, 50, 65, 78]
		}
	];
}

export function getHealthChecks(): HealthCheck[] {
	return [
		{ endpoint: '/health', service: 'Backend API', status: 'online', statusCode: '200 OK', latencyMs: 42 },
		{ endpoint: '/api/ping', service: 'Backend API', status: 'online', statusCode: '200 OK', latencyMs: 18 },
		{ endpoint: '/ (root)', service: 'Frontend', status: 'online', statusCode: '200 OK', latencyMs: 91 },
		{ endpoint: '/api/db-health', service: 'Supabase', status: 'degraded', statusCode: '200 OK', latencyMs: 412 },
		{ endpoint: 'CF Edge Check', service: 'Cloudflare', status: 'online', statusCode: '200 OK', latencyMs: 8 }
	];
}

export function getIncidents(): Incident[] {
	return [
		{
			id: 'inc-1',
			status: 'active',
			title: 'Zvýšená latence Edge CDN',
			descriptionDesktop: 'Cloudflare edge uzly v regionu EU reportují zvýšenou latenci. Tým zkoumá příčinu.',
			descriptionMobile: 'Cloudflare edge uzly v regionu EU reportují zvýšenou latenci.',
			service: 'Cloudflare Edge',
			serviceIcon: 'fa-cloud',
			timestamp: 'Dnes, 08:14',
			duration: '2h 18m'
		},
		{
			id: 'inc-2',
			status: 'resolved',
			title: 'Backend API restart (500 errors)',
			descriptionDesktop: 'Instance crashla kvůli OOM. Automatický restart obnovil provoz za 43s.',
			descriptionMobile: 'OOM crash. Automatický restart za 43s.',
			service: 'Fly.io Backend',
			serviceIcon: 'fa-server',
			timestamp: 'Včera, 22:45',
			duration: '43s'
		},
		{
			id: 'inc-3',
			status: 'resolved',
			title: 'Supabase DB connection pool exhausted',
			descriptionDesktop: 'Pool připojení dosáhl limitu 100. Zvýšen limit a přidána queue pro čekající spojení.',
			descriptionMobile: 'Pool dosáhl limitu 100. Zvýšen limit + queue.',
			service: 'Supabase DB',
			serviceIcon: 'fa-database',
			timestamp: '20. 5., 16:02',
			duration: '7m 12s'
		},
		{
			id: 'inc-4',
			status: 'resolved',
			title: 'Frontend deployment timeout',
			descriptionDesktop: 'CI/CD pipeline se zasekla. Vyřešeno ručním triggernutím deploymentu.',
			descriptionMobile: 'CI/CD pipeline se zasekla. Ruční deploy.',
			service: 'Vercel Frontend',
			serviceIcon: 'fa-desktop',
			timestamp: '15. 5., 11:30',
			duration: '18m 5s'
		}
	];
}

export function getSlaGoals(): SlaGoal[] {
	return [
		{ service: 'Frontend', actual: 99.99, target: 99.9, met: true, barClass: 'bg-success' },
		{ service: 'Backend API', actual: 99.95, target: 99.9, met: true, barClass: 'bg-success' },
		{ service: 'Databáze', actual: 99.97, target: 99.5, met: true, barClass: 'bg-success' },
		{ service: 'Edge CDN', actual: 99.82, target: 99.9, met: false, barClass: 'bg-secondary' }
	];
}

export interface AvailabilityQuickStats {
	totalOutages30d: number;
	mttr: string;
	mtbf: string;
	longestOutage: string;
	checkInterval: string;
	alertsSent: number;
}

export function getAvailabilityQuickStats(): AvailabilityQuickStats {
	return {
		totalOutages30d: 8,
		mttr: '6m 34s',
		mtbf: '8.4 dní',
		longestOutage: '18m 5s',
		checkInterval: '60s',
		alertsSent: 12
	};
}
