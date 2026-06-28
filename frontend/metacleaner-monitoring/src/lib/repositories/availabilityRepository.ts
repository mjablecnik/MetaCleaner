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
			key: 'server',
			name: 'MetaCleaner Server',
			icon: 'fa-server',
			provider: 'Fly.io',
			status: 'online',
			uptimePercent: 99.92,
			uptimeDisplay: '99.92',
			outageCount: 3,
			outageLabel: '3 outages',
			trend: '-0.02%',
			trendPositive: false,
			barClass: 'bg-success',
			downDays: [8, 45],
			degradedDays: [12, 23, 67]
		},
		{
			key: 'web',
			name: 'MetaCleaner Web',
			icon: 'fa-globe',
			provider: 'Fly.io',
			status: 'online',
			uptimePercent: 99.99,
			uptimeDisplay: '99.99',
			outageCount: 0,
			outageLabel: '0 outages',
			trend: '+0.00%',
			trendPositive: true,
			barClass: 'bg-success',
			downDays: [],
			degradedDays: [34]
		},
		{
			key: 'app',
			name: 'MetaCleaner App',
			icon: 'fa-desktop',
			provider: 'Fly.io',
			status: 'online',
			uptimePercent: 99.99,
			uptimeDisplay: '99.99',
			outageCount: 0,
			outageLabel: '0 outages',
			trend: '+0.00%',
			trendPositive: true,
			barClass: 'bg-success',
			downDays: [],
			degradedDays: [34]
		},
		{
			key: 'monitoring',
			name: 'Monitoring',
			icon: 'fa-chart-line',
			provider: 'Fly.io',
			status: 'online',
			uptimePercent: 99.95,
			uptimeDisplay: '99.95',
			outageCount: 1,
			outageLabel: '1 outage',
			trend: '+0.02%',
			trendPositive: true,
			barClass: 'bg-success',
			downDays: [],
			degradedDays: [5, 28, 56]
		},
		{
			key: 'database',
			name: 'Supabase DB',
			icon: 'fa-database',
			provider: 'Supabase',
			status: 'online',
			uptimePercent: 99.97,
			uptimeDisplay: '99.97',
			outageCount: 1,
			outageLabel: '1 outage',
			trend: '+0.01%',
			trendPositive: true,
			barClass: 'bg-success',
			downDays: [23],
			degradedDays: [44, 71]
		},
		{
			key: 'auth',
			name: 'Supabase Auth',
			icon: 'fa-shield-halved',
			provider: 'Supabase',
			status: 'online',
			uptimePercent: 99.98,
			uptimeDisplay: '99.98',
			outageCount: 0,
			outageLabel: '0 outages',
			trend: '+0.01%',
			trendPositive: true,
			barClass: 'bg-success',
			downDays: [],
			degradedDays: [15]
		},
		{
			key: 'edge',
			name: 'Cloudflare CDN',
			icon: 'fa-cloud',
			provider: 'Cloudflare',
			status: 'online',
			uptimePercent: 99.94,
			uptimeDisplay: '99.94',
			outageCount: 1,
			outageLabel: '1 outage',
			trend: '-0.01%',
			trendPositive: false,
			barClass: 'bg-success',
			downDays: [62],
			degradedDays: [8, 33, 57]
		}
	];
}

export function getHealthChecks(): HealthCheck[] {
	return [
		{
			endpoint: 'GET /api/health',
			service: 'MetaCleaner Server',
			status: 'online',
			statusCode: '200 OK',
			latencyMs: 28
		},
		{
			endpoint: 'GET / (200 check)',
			service: 'MetaCleaner Web',
			status: 'online',
			statusCode: '200 OK',
			latencyMs: 12
		},
		{
			endpoint: 'GET / (200 check)',
			service: 'MetaCleaner App',
			status: 'online',
			statusCode: '200 OK',
			latencyMs: 9
		},
		{
			endpoint: 'GET / (200 check)',
			service: 'Monitoring',
			status: 'online',
			statusCode: '200 OK',
			latencyMs: 47
		},
		{
			endpoint: 'Supabase REST ping',
			service: 'Supabase DB',
			status: 'online',
			statusCode: '200 OK',
			latencyMs: 68
		},
		{
			endpoint: 'CF edge check',
			service: 'Cloudflare CDN',
			status: 'online',
			statusCode: '200 OK',
			latencyMs: 5
		}
	];
}

export function getIncidents(): Incident[] {
	return [
		{
			id: 'inc-1',
			status: 'active',
			title: 'Backend OOM during video cleaning',
			descriptionDesktop:
				'metacleaner-server machine exceeded 1GB RAM limit processing a 4K MOV file. Auto-restarted in 12s.',
			descriptionMobile: 'Server exceeded 1GB RAM on 4K MOV file. Auto-restarted in 12s.',
			service: 'Fly.io Backend',
			serviceIcon: 'fa-server',
			timestamp: 'Today, 08:14',
			duration: '12s'
		},
		{
			id: 'inc-2',
			status: 'resolved',
			title: 'Supabase connection pool exhausted',
			descriptionDesktop:
				'PostgREST connection pool hit 100 limit during evening traffic spike. Resolved after scaling pool to 150.',
			descriptionMobile: 'PostgREST pool hit 100 during traffic spike. Scaled to 150.',
			service: 'Supabase DB',
			serviceIcon: 'fa-database',
			timestamp: 'Yesterday, 19:42',
			duration: '7m 12s'
		},
		{
			id: 'inc-3',
			status: 'resolved',
			title: 'Stripe webhook delivery timeout',
			descriptionDesktop:
				'Billing webhook endpoint returned 504 during Stripe event flood. Events delivered on retry.',
			descriptionMobile: 'Billing webhook returned 504 during Stripe event flood. Delivered on retry.',
			service: 'Fly.io Backend',
			serviceIcon: 'fa-server',
			timestamp: '20 May, 16:02',
			duration: '2m 45s'
		},
		{
			id: 'inc-4',
			status: 'resolved',
			title: 'Cloudflare certificate renewal hiccup',
			descriptionDesktop:
				'Brief edge degradation during automated SSL cert rotation. All regions recovered automatically.',
			descriptionMobile: 'Brief edge degradation during SSL cert rotation. Auto-recovered.',
			service: 'Cloudflare',
			serviceIcon: 'fa-cloud',
			timestamp: '15 May, 11:30',
			duration: '48s'
		}
	];
}

export function getSlaGoals(): SlaGoal[] {
	return [
		{
			service: 'MetaCleaner Server',
			actual: 99.92,
			target: 99.9,
			met: true,
			barClass: 'bg-success'
		},
		{ service: 'MetaCleaner Web', actual: 99.99, target: 99.9, met: true, barClass: 'bg-success' },
		{ service: 'MetaCleaner App', actual: 99.99, target: 99.9, met: true, barClass: 'bg-success' },
		{ service: 'Supabase DB', actual: 99.97, target: 99.5, met: true, barClass: 'bg-success' },
		{ service: 'Cloudflare CDN', actual: 99.94, target: 99.9, met: true, barClass: 'bg-success' }
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
