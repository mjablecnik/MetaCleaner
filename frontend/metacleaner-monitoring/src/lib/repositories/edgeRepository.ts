export interface EdgeKpiStat {
	key: string;
	labelKey: string;
	value: string;
	unit?: string;
	trend?: string;
	trendPositive?: boolean;
	badgeKey: string;
	badgeClass: string;
	subtext: string;
	barWidth?: string;
	barClass?: string;
}

export interface EdgeSecondaryKpi {
	key: string;
	labelKey: string;
	value: string;
	unit?: string;
	subtext: string;
	subtextIsKey?: boolean;
	icon: string;
	iconColor: string;
	iconBg: string;
}

export interface CacheRule {
	id: string;
	pattern: string;
	ttlLabel: string;
	description: string;
	hitRate: string;
	hitRateColor: string;
	icon: string;
	iconBg: string;
	iconColor: string;
}

export interface ThreatType {
	id: string;
	label: string;
	percent: number;
	color: string;
}

export interface HttpStatusDistribution {
	code: string;
	labelKey: string;
	percent: string;
	color: string;
}

export interface WafLogEntry {
	id: string;
	time: string;
	type: string;
	typeClass: string;
	ip: string;
	country: string;
	countryFlag: string;
	message: string;
	actionKey: string;
	actionClass: string;
	statusKey: string;
	statusClass: string;
}

export interface GeoDistribution {
	country: string;
	code: string;
	flag: string;
	percent: number;
	color: string;
}

export function getGeoDistribution(): GeoDistribution[] {
	return [
		{ country: 'Česká republika', code: 'CZ', flag: '🇨🇿', percent: 62, color: '#3b82f6' },
		{ country: 'Slovensko', code: 'SK', flag: '🇸🇰', percent: 8, color: '#22c55e' },
		{ country: 'Německo', code: 'DE', flag: '🇩🇪', percent: 7, color: '#8b5cf6' },
		{ country: 'USA', code: 'US', flag: '🇺🇸', percent: 5, color: '#f97316' },
		{ country: 'Ostatní', code: 'XX', flag: '🌍', percent: 18, color: '#475569' }
	];
}

export function getEdgeKpiStats(): EdgeKpiStat[] {
	return [
		{
			key: 'cacheHitRate',
			labelKey: 'edge_kpi_cacheHitRate',
			value: '94.2',
			unit: '%',
			trend: '+1.4%',
			trendPositive: true,
			badgeKey: 'common_status_excellent',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'Cíl: ≥ 90% · Splněno',
			barWidth: '94.2%',
			barClass: 'bg-success'
		},
		{
			key: 'totalRequests',
			labelKey: 'edge_kpi_totalRequests',
			value: '48 200',
			badgeKey: '',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: 'Peak: 5 800/h v 10:00 · CZ 62%'
		},
		{
			key: 'savedBandwidth',
			labelKey: 'edge_kpi_savedBandwidth',
			value: '12.4',
			unit: 'GB',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: '13.2 GB celkem · 94% z cache',
			barWidth: '94%',
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'blockedThreats',
			labelKey: 'edge_kpi_blockedThreats',
			value: '83',
			trend: '+12',
			trendPositive: false,
			badgeKey: 'common_status_caution',
			badgeClass: 'bg-secondary/10 text-secondary',
			subtext: 'DDoS, bots, bad IPs'
		}
	];
}

export function getEdgeSecondaryKpis(): EdgeSecondaryKpi[] {
	return [
		{
			key: 'activePop',
			labelKey: 'edge_kpi_activePop',
			value: '275',
			subtext: 'edge_kpi_popSubtext',
			subtextIsKey: true,
			icon: 'fa-globe',
			iconColor: 'text-[#f6821f]',
			iconBg: 'bg-[#f6821f]/15'
		},
		{
			key: 'avgTtfb',
			labelKey: 'edge_kpi_avgTtfb',
			value: '38',
			unit: 'ms',
			subtext: 'Z edge cache · -12ms vs. origin',
			icon: 'fa-bolt',
			iconColor: 'text-[#3ecf8e]',
			iconBg: 'bg-[#3ecf8e]/15'
		},
		{
			key: 'wafRules',
			labelKey: 'edge_kpi_wafRules',
			value: '48',
			subtext: 'Aktivních · 3 nová dnes',
			icon: 'fa-shield-halved',
			iconColor: 'text-[#8b5cf6]',
			iconBg: 'bg-[#8b5cf6]/15'
		},
		{
			key: 'sslStatus',
			labelKey: 'edge_kpi_sslStatus',
			value: 'TLS 1.3',
			subtext: 'Certifikát platný · exp. 89 dní',
			icon: 'fa-rotate',
			iconColor: 'text-[#3b82f6]',
			iconBg: 'bg-[#3b82f6]/15'
		}
	];
}

export function getCacheRules(): CacheRule[] {
	return [
		{
			id: 'landing',
			pattern: '/*.html',
			ttlLabel: 'TTL: 1 den',
			description: 'TTL: 1 den · Landing page HTML',
			hitRate: '98.7%',
			hitRateColor: 'text-success',
			icon: 'fa-globe',
			iconBg: 'bg-[#3ecf8e]/15',
			iconColor: 'text-[#3ecf8e]'
		},
		{
			id: 'assets',
			pattern: '/_app/immutable/*',
			ttlLabel: 'TTL: 1 rok',
			description: 'TTL: 1 rok · SPA assets (hashed)',
			hitRate: '99.4%',
			hitRateColor: 'text-[#3b82f6]',
			icon: 'fa-code',
			iconBg: 'bg-[#3b82f6]/15',
			iconColor: 'text-[#3b82f6]'
		},
		{
			id: 'docs',
			pattern: '/api/v1/docs*',
			ttlLabel: 'TTL: 30 min',
			description: 'TTL: 30 min · API docs',
			hitRate: '88.2%',
			hitRateColor: 'text-[#8b5cf6]',
			icon: 'fa-database',
			iconBg: 'bg-[#8b5cf6]/15',
			iconColor: 'text-[#8b5cf6]'
		},
		{
			id: 'upload',
			pattern: '/api/v1/upload*',
			ttlLabel: 'TTL: Bypass',
			description: 'TTL: Bypass · Auth required',
			hitRate: '0%',
			hitRateColor: 'text-secondary',
			icon: 'fa-file',
			iconBg: 'bg-[#f6821f]/15',
			iconColor: 'text-[#f6821f]'
		},
		{
			id: 'sitemap',
			pattern: '/sitemap.xml',
			ttlLabel: 'TTL: 1 den',
			description: 'TTL: 1 den · SEO',
			hitRate: '97.8%',
			hitRateColor: 'text-success',
			icon: 'fa-sitemap',
			iconBg: 'bg-[#3ecf8e]/15',
			iconColor: 'text-[#3ecf8e]'
		}
	];
}

export function getThreatTypes(): ThreatType[] {
	return [
		{ id: 'ddos', label: 'DDoS', percent: 54, color: '#ef4444' },
		{ id: 'bad-bots', label: 'Bad Bots', percent: 28, color: '#f97316' },
		{ id: 'waf-block', label: 'WAF Block', percent: 13, color: '#8b5cf6' },
		{ id: 'ip-block', label: 'IP Block', percent: 5, color: '#3b82f6' }
	];
}

export function getHttpStatusDistribution(): HttpStatusDistribution[] {
	return [
		{ code: '2xx', labelKey: 'edge_http_2xx', percent: '96.1%', color: '#3ecf8e' },
		{ code: '3xx', labelKey: 'edge_http_3xx', percent: '2.4%', color: '#3b82f6' },
		{ code: '4xx', labelKey: 'edge_http_4xx', percent: '1.1%', color: '#f97316' },
		{ code: '5xx', labelKey: 'edge_http_5xx', percent: '0.4%', color: '#ef4444' }
	];
}

export function getWafLog(): WafLogEntry[] {
	return [
		{
			id: 'waf-1',
			time: '14:51:22',
			type: 'DDoS',
			typeClass: 'bg-error/15 text-error',
			ip: '185.220.101.47',
			country: 'RU',
			countryFlag: '🇷🇺',
			message: 'L7 HTTP flood – 420 req/s na /api/v1/upload',
			actionKey: 'common_status_blocked',
			actionClass: 'bg-error/15 text-error',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'waf-2',
			time: '14:38:04',
			type: 'WAF',
			typeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			ip: '92.118.160.22',
			country: 'CN',
			countryFlag: '🇨🇳',
			message: 'SQL Injection pokus – pravidlo CF-WAF-SQLi-001',
			actionKey: 'common_status_blocked',
			actionClass: 'bg-error/15 text-error',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'waf-3',
			time: '13:55:18',
			type: 'Bot',
			typeClass: 'bg-[#f97316]/15 text-[#f97316]',
			ip: '45.33.32.156',
			country: 'DE',
			countryFlag: '🇩🇪',
			message: 'Scraping bot – User-Agent: Scrapy/2.11 na /sitemap.xml',
			actionKey: 'edge_status_challenge',
			actionClass: 'bg-secondary/15 text-secondary',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'waf-4',
			time: '12:44:17',
			type: 'Rate Limit',
			typeClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			ip: '77.48.220.14',
			country: 'CZ',
			countryFlag: '🇨🇿',
			message: 'Rate limit překročen – /api/v1/jobs (100 req/min)',
			actionKey: 'edge_status_throttle',
			actionClass: 'bg-secondary/15 text-secondary',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'waf-5',
			time: '11:20:04',
			type: 'WAF',
			typeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			ip: '103.21.244.0',
			country: 'US',
			countryFlag: '🇺🇸',
			message: 'XSS pokus na /api/v1/auth/login – pravidlo CF-WAF-XSS-012',
			actionKey: 'common_status_blocked',
			actionClass: 'bg-error/15 text-error',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'waf-6',
			time: '09:38:30',
			type: 'Rate Limit',
			typeClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			ip: '89.173.45.22',
			country: 'SK',
			countryFlag: '🇸🇰',
			message: 'Rate limit překročen – /api/v1/upload (10 req/min)',
			actionKey: 'edge_status_throttle',
			actionClass: 'bg-secondary/15 text-secondary',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		}
	];
}
