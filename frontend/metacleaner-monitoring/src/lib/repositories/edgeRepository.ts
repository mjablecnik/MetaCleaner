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

export interface TtfbRegion {
	id: string;
	name: string;
	shortName: string;
	ttfbMs: number;
	barWidth: string;
	barColor: string;
	barOpacity?: number;
	dotColor: string;
	statusKey: string;
	statusClass: string;
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
			value: '48.3M',
			badgeKey: '',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: 'Peak: 2.4M/h v 10:00'
		},
		{
			key: 'savedBandwidth',
			labelKey: 'edge_kpi_savedBandwidth',
			value: '2.8',
			unit: 'TB',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: '3.9 TB celkem · 72% z cache',
			barWidth: '72%',
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'blockedThreats',
			labelKey: 'edge_kpi_blockedThreats',
			value: '1,247',
			trend: '+312',
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

export function getTtfbRegions(): TtfbRegion[] {
	return [
		{
			id: 'eu-west',
			name: 'EU West',
			shortName: 'EU West',
			ttfbMs: 38,
			barWidth: '19%',
			barColor: '#3ecf8e',
			dotColor: 'text-[#3ecf8e]',
			statusKey: 'common_status_ok',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'us-east',
			name: 'US East',
			shortName: 'US East',
			ttfbMs: 61,
			barWidth: '30%',
			barColor: '#3b82f6',
			dotColor: 'text-[#3b82f6]',
			statusKey: 'common_status_ok',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'us-west',
			name: 'US West',
			shortName: 'US West',
			ttfbMs: 78,
			barWidth: '38%',
			barColor: '#f6821f',
			dotColor: 'text-[#f6821f]',
			statusKey: 'common_status_ok',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'asia-pac',
			name: 'Asia Pacific',
			shortName: 'Asia Pac.',
			ttfbMs: 114,
			barWidth: '56%',
			barColor: '#8b5cf6',
			dotColor: 'text-[#8b5cf6]',
			statusKey: 'common_status_warning',
			statusClass: 'bg-secondary/10 text-secondary'
		},
		{
			id: 's-america',
			name: 'South America',
			shortName: 'S. America',
			ttfbMs: 152,
			barWidth: '74%',
			barColor: '#ef4444',
			dotColor: 'text-[#ef4444]',
			statusKey: 'common_status_slow',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'mid-east',
			name: 'Middle East',
			shortName: 'Mid. East',
			ttfbMs: 98,
			barWidth: '48%',
			barColor: '#3b82f6',
			barOpacity: 0.6,
			dotColor: 'text-[#3b82f6]',
			statusKey: 'common_status_ok',
			statusClass: 'bg-success/10 text-success'
		}
	];
}

export function getCacheRules(): CacheRule[] {
	return [
		{
			id: 'images',
			pattern: '/assets/images/*',
			ttlLabel: 'TTL: 30 dní',
			description: 'TTL: 30 dní · Statické soubory',
			hitRate: '99.1%',
			hitRateColor: 'text-success',
			icon: 'fa-image',
			iconBg: 'bg-[#3ecf8e]/15',
			iconColor: 'text-[#3ecf8e]'
		},
		{
			id: 'js-bundles',
			pattern: '/static/js/*.bundle.js',
			ttlLabel: 'TTL: 7 dní',
			description: 'TTL: 7 dní · JS bundly',
			hitRate: '98.4%',
			hitRateColor: 'text-[#3b82f6]',
			icon: 'fa-code',
			iconBg: 'bg-[#3b82f6]/15',
			iconColor: 'text-[#3b82f6]'
		},
		{
			id: 'api-products',
			pattern: '/api/v1/products*',
			ttlLabel: 'TTL: 5 min',
			description: 'TTL: 5 min · API cache',
			hitRate: '72.3%',
			hitRateColor: 'text-[#8b5cf6]',
			icon: 'fa-database',
			iconBg: 'bg-[#8b5cf6]/15',
			iconColor: 'text-[#8b5cf6]'
		},
		{
			id: 'user-profile',
			pattern: '/api/v1/user/profile',
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
			icon: 'fa-globe',
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
			message: 'L7 HTTP flood – 8,400 req/s z jedné IP',
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
			country: 'US',
			countryFlag: '🇺🇸',
			message: 'Scraping bot – User-Agent: Scrapy/2.11',
			actionKey: 'edge_status_challenge',
			actionClass: 'bg-secondary/15 text-secondary',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'waf-4',
			time: '13:12:40',
			type: 'WAF',
			typeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			ip: '103.21.244.0',
			country: 'IN',
			countryFlag: '🇮🇳',
			message: 'XSS pokus – pravidlo CF-WAF-XSS-012',
			actionKey: 'common_status_blocked',
			actionClass: 'bg-error/15 text-error',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'waf-5',
			time: '12:04:09',
			type: 'DDoS',
			typeClass: 'bg-error/15 text-error',
			ip: '195.178.110.33',
			country: 'DE',
			countryFlag: '🇩🇪',
			message: 'SYN flood útok – 12,000 req/s z botnet sítě',
			actionKey: 'common_status_blocked',
			actionClass: 'bg-error/15 text-error',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'waf-6',
			time: '10:28:55',
			type: 'Rate Limit',
			typeClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			ip: '82.102.17.84',
			country: 'GB',
			countryFlag: '🇬🇧',
			message: 'Rate limit překročen – /api/v1/login (200 req/min)',
			actionKey: 'edge_status_throttle',
			actionClass: 'bg-secondary/15 text-secondary',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		}
	];
}
