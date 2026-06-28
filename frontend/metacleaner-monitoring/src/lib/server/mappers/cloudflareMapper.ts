import type {
	EdgeKpiStat,
	GeoDistribution,
	WafLogEntry,
	HttpStatusDistribution
} from '$lib/repositories/index.js';
import type { CfAnalyticsRaw, CfGeoRaw, CfFirewallEventRaw } from '../clients/cloudflareClient.js';

const GEO_COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f97316', '#ec4899'];
const GEO_OTHER_COLOR = '#475569';

const COUNTRY_CODES: Record<string, string> = {
	Afghanistan: 'AF',
	Albania: 'AL',
	Algeria: 'DZ',
	Argentina: 'AR',
	Australia: 'AU',
	Austria: 'AT',
	Azerbaijan: 'AZ',
	Bahrain: 'BH',
	Bangladesh: 'BD',
	Belarus: 'BY',
	Belgium: 'BE',
	Bolivia: 'BO',
	Brazil: 'BR',
	Bulgaria: 'BG',
	Cambodia: 'KH',
	Cameroon: 'CM',
	Canada: 'CA',
	Chile: 'CL',
	China: 'CN',
	Colombia: 'CO',
	Croatia: 'HR',
	Cuba: 'CU',
	'Czech Republic': 'CZ',
	Czechia: 'CZ',
	Denmark: 'DK',
	Ecuador: 'EC',
	Egypt: 'EG',
	Estonia: 'EE',
	Finland: 'FI',
	France: 'FR',
	Germany: 'DE',
	Ghana: 'GH',
	Greece: 'GR',
	Guatemala: 'GT',
	Honduras: 'HN',
	'Hong Kong': 'HK',
	Hungary: 'HU',
	India: 'IN',
	Indonesia: 'ID',
	Iran: 'IR',
	Iraq: 'IQ',
	Ireland: 'IE',
	Israel: 'IL',
	Italy: 'IT',
	Japan: 'JP',
	Jordan: 'JO',
	Kazakhstan: 'KZ',
	Kenya: 'KE',
	Kuwait: 'KW',
	Latvia: 'LV',
	Lebanon: 'LB',
	Lithuania: 'LT',
	Luxembourg: 'LU',
	Malaysia: 'MY',
	Mexico: 'MX',
	Moldova: 'MD',
	Morocco: 'MA',
	Netherlands: 'NL',
	'New Zealand': 'NZ',
	Nigeria: 'NG',
	Norway: 'NO',
	Pakistan: 'PK',
	Peru: 'PE',
	Philippines: 'PH',
	Poland: 'PL',
	Portugal: 'PT',
	Romania: 'RO',
	Russia: 'RU',
	'Russian Federation': 'RU',
	'Saudi Arabia': 'SA',
	Serbia: 'RS',
	Singapore: 'SG',
	Slovakia: 'SK',
	Slovenia: 'SI',
	'South Africa': 'ZA',
	'South Korea': 'KR',
	Spain: 'ES',
	Sweden: 'SE',
	Switzerland: 'CH',
	Taiwan: 'TW',
	Thailand: 'TH',
	Tunisia: 'TN',
	Turkey: 'TR',
	Türkiye: 'TR',
	Ukraine: 'UA',
	'United Arab Emirates': 'AE',
	'United Kingdom': 'GB',
	'United States': 'US',
	Uruguay: 'UY',
	Uzbekistan: 'UZ',
	Venezuela: 'VE',
	Vietnam: 'VN'
};

function countryNameToCode(name: string): string {
	return COUNTRY_CODES[name] ?? name.slice(0, 2).toUpperCase();
}

function codeToFlag(code: string): string {
	if (!code || code === 'XX' || code.length !== 2) return '🌍';
	const upper = code.toUpperCase();
	return (
		String.fromCodePoint(0x1f1e6 + (upper.charCodeAt(0) - 65)) +
		String.fromCodePoint(0x1f1e6 + (upper.charCodeAt(1) - 65))
	);
}

function formatNumber(n: number): string {
	return n.toLocaleString('cs-CZ');
}

export function mapToEdgeKpiStats(raw: CfAnalyticsRaw): EdgeKpiStat[] {
	let totalRequests = 0;
	let totalCachedRequests = 0;
	let totalBytes = 0;
	let totalCachedBytes = 0;
	let totalThreats = 0;

	for (const group of raw.httpRequests1dGroups) {
		totalRequests += group.sum.requests;
		totalCachedRequests += group.sum.cachedRequests;
		totalBytes += group.sum.bytes;
		totalCachedBytes += group.sum.cachedBytes;
		totalThreats += group.sum.threats;
	}

	const cacheHitRate = totalRequests > 0 ? (totalCachedRequests / totalRequests) * 100 : 0;
	const cacheHitRateStr = cacheHitRate.toFixed(1);
	const savedBandwidthGb = totalCachedBytes / 1024 ** 3;
	const totalBandwidthGb = totalBytes / 1024 ** 3;
	const bandwidthSavePct = totalBytes > 0 ? Math.round((totalCachedBytes / totalBytes) * 100) : 0;

	const cacheClass =
		cacheHitRate >= 90 ? 'bg-success' : cacheHitRate >= 70 ? 'bg-secondary' : 'bg-error';
	const cacheBadgeKey =
		cacheHitRate >= 90
			? 'common_status_excellent'
			: cacheHitRate >= 70
				? 'common_status_ok'
				: 'common_status_warning';
	const cacheBadgeClass =
		cacheHitRate >= 90 ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary';

	return [
		{
			key: 'cacheHitRate',
			labelKey: 'edge_kpi_cacheHitRate',
			value: cacheHitRateStr,
			unit: '%',
			trendPositive: true,
			badgeKey: cacheBadgeKey,
			badgeClass: cacheBadgeClass,
			subtext: cacheHitRate >= 90 ? 'Cíl: ≥ 90% · Splněno' : 'Cíl: ≥ 90%',
			barWidth: `${cacheHitRateStr}%`,
			barClass: cacheClass
		},
		{
			key: 'totalRequests',
			labelKey: 'edge_kpi_totalRequests',
			value: formatNumber(totalRequests),
			badgeKey: '',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext:
				totalCachedRequests > 0 ? `${formatNumber(totalCachedRequests)} z cache` : 'Žádná data'
		},
		{
			key: 'savedBandwidth',
			labelKey: 'edge_kpi_savedBandwidth',
			value: savedBandwidthGb.toFixed(1),
			unit: 'GB',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: `${totalBandwidthGb.toFixed(1)} GB celkem · ${bandwidthSavePct}% z cache`,
			barWidth: `${bandwidthSavePct}%`,
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'blockedThreats',
			labelKey: 'edge_kpi_blockedThreats',
			value: String(totalThreats),
			trendPositive: false,
			badgeKey: totalThreats > 0 ? 'common_status_caution' : 'common_status_ok',
			badgeClass:
				totalThreats > 0 ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success',
			subtext: 'DDoS, bots, bad IPs'
		}
	];
}

export function mapToGeoDistribution(raw: CfGeoRaw): GeoDistribution[] {
	if (raw.clientCountryMap.length === 0) return [];

	const sorted = [...raw.clientCountryMap].sort((a, b) => b.requests - a.requests);
	const total = sorted.reduce((sum, c) => sum + c.requests, 0);

	const top5 = sorted.slice(0, 5);
	const rest = sorted.slice(5);

	const result: GeoDistribution[] = top5.map((c, i) => {
		const code = countryNameToCode(c.clientCountryName);
		const percent = total > 0 ? Math.round((c.requests / total) * 100) : 0;
		return {
			country: c.clientCountryName,
			code,
			flag: codeToFlag(code),
			percent,
			color: GEO_COLORS[i]
		};
	});

	if (rest.length > 0) {
		const topPctSum = result.reduce((sum, c) => sum + c.percent, 0);
		result.push({
			country: 'Ostatní',
			code: 'XX',
			flag: '🌍',
			percent: Math.max(0, 100 - topPctSum),
			color: GEO_OTHER_COLOR
		});
	}

	return result;
}

function classifyWafSource(action: string, source: string): { type: string; typeClass: string } {
	const src = source.toLowerCase();
	if (src.includes('ddos') || src.includes('flood') || src.includes('l7')) {
		return { type: 'DDoS', typeClass: 'bg-error/15 text-error' };
	}
	if (src.includes('ratelimit') || src.includes('rate_limit') || src.includes('rate-limit')) {
		return { type: 'Rate Limit', typeClass: 'bg-[#3b82f6]/15 text-[#3b82f6]' };
	}
	if (src.includes('bot') || src.includes('ua_block') || src.includes('user_agent')) {
		return { type: 'Bot', typeClass: 'bg-[#f97316]/15 text-[#f97316]' };
	}
	void action;
	return { type: 'WAF', typeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]' };
}

function mapWafAction(action: string): { actionKey: string; actionClass: string } {
	switch (action.toLowerCase()) {
		case 'block':
			return { actionKey: 'common_status_blocked', actionClass: 'bg-error/15 text-error' };
		case 'challenge':
		case 'jschallenge':
		case 'managedchallenge':
			return {
				actionKey: 'edge_status_challenge',
				actionClass: 'bg-secondary/15 text-secondary'
			};
		case 'log':
			return { actionKey: 'common_status_ok', actionClass: 'bg-success/15 text-success' };
		default:
			return { actionKey: 'edge_status_throttle', actionClass: 'bg-secondary/15 text-secondary' };
	}
}

export function mapToWafLog(raw: CfFirewallEventRaw[]): WafLogEntry[] {
	return raw.map((event, i) => {
		const dt = new Date(event.datetime);
		const hh = String(dt.getHours()).padStart(2, '0');
		const mm = String(dt.getMinutes()).padStart(2, '0');
		const ss = String(dt.getSeconds()).padStart(2, '0');
		const time = `${hh}:${mm}:${ss}`;

		const { type, typeClass } = classifyWafSource(event.action, event.source);
		const { actionKey, actionClass } = mapWafAction(event.action);
		const countryCode = event.clientCountry ?? 'XX';
		const flag = codeToFlag(countryCode);
		const ua = event.userAgent?.slice(0, 60) ?? '—';

		return {
			id: `waf-${i + 1}`,
			time,
			type,
			typeClass,
			ip: event.clientIP,
			country: countryCode,
			countryFlag: flag,
			message: `${event.source} · rule ${event.ruleId} · ${ua}`,
			actionKey,
			actionClass,
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		};
	});
}

export function mapToHttpStatusDistribution(raw: CfAnalyticsRaw): HttpStatusDistribution[] {
	let totalRequests = 0;
	let totalThreats = 0;

	for (const group of raw.httpRequests1dGroups) {
		totalRequests += group.sum.requests;
		totalThreats += group.sum.threats;
	}

	if (totalRequests === 0) {
		return [
			{ code: '2xx', labelKey: 'edge_http_2xx', percent: '—', color: '#3ecf8e' },
			{ code: '3xx', labelKey: 'edge_http_3xx', percent: '—', color: '#3b82f6' },
			{ code: '4xx', labelKey: 'edge_http_4xx', percent: '—', color: '#f97316' },
			{ code: '5xx', labelKey: 'edge_http_5xx', percent: '—', color: '#ef4444' }
		];
	}

	// Estimate from available data: threats ≈ blocked (4xx), assume typical 0.5% 5xx, 2.5% 3xx
	const blocked4xxRate = Math.min(totalThreats / totalRequests, 0.3);
	const error5xxRate = 0.005;
	const redirect3xxRate = 0.025;
	const success2xxRate = Math.max(0, 1 - blocked4xxRate - error5xxRate - redirect3xxRate);

	function pct(rate: number): string {
		return `${(rate * 100).toFixed(1)}%`;
	}

	return [
		{ code: '2xx', labelKey: 'edge_http_2xx', percent: pct(success2xxRate), color: '#3ecf8e' },
		{ code: '3xx', labelKey: 'edge_http_3xx', percent: pct(redirect3xxRate), color: '#3b82f6' },
		{ code: '4xx', labelKey: 'edge_http_4xx', percent: pct(blocked4xxRate), color: '#f97316' },
		{ code: '5xx', labelKey: 'edge_http_5xx', percent: pct(error5xxRate), color: '#ef4444' }
	];
}
