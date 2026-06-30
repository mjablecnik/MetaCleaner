import { describe, it, expect } from 'vitest';
import type { CfAnalyticsRaw, CfFirewallEventRaw } from '../../clients/cloudflareClient.js';
import {
	mapToEdgeKpiStats,
	mapToWafLog,
	mapToHttpStatusDistribution
} from '../cloudflareMapper.js';

function makeAnalyticsGroup(overrides: Partial<CfAnalyticsRaw['httpRequests1dGroups'][0]> = {}): CfAnalyticsRaw['httpRequests1dGroups'][0] {
	return {
		sum: { requests: 1000, cachedRequests: 900, bytes: 1024 ** 3, cachedBytes: 900 * 1024 ** 3 / 1000, threats: 0 },
		dimensions: { date: '2024-01-15' },
		...overrides
	};
}

function makeAnalytics(groups: CfAnalyticsRaw['httpRequests1dGroups'] = []): CfAnalyticsRaw {
	return { httpRequests1dGroups: groups };
}

function makeFirewallEvent(overrides: Partial<CfFirewallEventRaw> = {}): CfFirewallEventRaw {
	return {
		action: 'block',
		clientIP: '1.2.3.4',
		clientCountry: 'US',
		datetime: '2024-01-15T12:30:45Z',
		ruleId: 'rule-1',
		source: 'waf',
		userAgent: 'Mozilla/5.0',
		...overrides
	};
}

describe('mapToEdgeKpiStats — structure', () => {
	it('returns 4 KPIs for empty groups', () => {
		const result = mapToEdgeKpiStats(makeAnalytics([]));
		expect(result).toHaveLength(4);
	});

	it('returns KPIs with expected keys', () => {
		const result = mapToEdgeKpiStats(makeAnalytics([]));
		const keys = result.map((k) => k.key);
		expect(keys).toContain('cacheHitRate');
		expect(keys).toContain('totalRequests');
		expect(keys).toContain('savedBandwidth');
		expect(keys).toContain('blockedThreats');
	});
});

describe('mapToEdgeKpiStats — aggregation across groups', () => {
	it('sums requests across multiple groups', () => {
		const raw = makeAnalytics([
			{ ...makeAnalyticsGroup(), sum: { requests: 300, cachedRequests: 270, bytes: 0, cachedBytes: 0, threats: 0 } },
			{ ...makeAnalyticsGroup(), sum: { requests: 700, cachedRequests: 630, bytes: 0, cachedBytes: 0, threats: 0 } }
		]);
		const result = mapToEdgeKpiStats(raw);
		const totalReq = result.find((k) => k.key === 'totalRequests')!;
		// 300 + 700 = 1000
		expect(totalReq.value).toBe('1,000');
	});

	it('sums threats across multiple groups', () => {
		const raw = makeAnalytics([
			{ ...makeAnalyticsGroup(), sum: { requests: 100, cachedRequests: 90, bytes: 0, cachedBytes: 0, threats: 5 } },
			{ ...makeAnalyticsGroup(), sum: { requests: 100, cachedRequests: 90, bytes: 0, cachedBytes: 0, threats: 3 } }
		]);
		const result = mapToEdgeKpiStats(raw);
		const threats = result.find((k) => k.key === 'blockedThreats')!;
		expect(threats.value).toBe('8');
	});
});

describe('mapToEdgeKpiStats — cache hit rate and badge thresholds', () => {
	it('cacheHitRate is 0.0% for empty groups (no requests)', () => {
		const result = mapToEdgeKpiStats(makeAnalytics([]));
		const kpi = result.find((k) => k.key === 'cacheHitRate')!;
		expect(kpi.value).toBe('0.0');
	});

	it('cacheHitRate ≥ 90%: badgeKey=common_status_excellent, barClass=bg-success', () => {
		const raw = makeAnalytics([
			{ ...makeAnalyticsGroup(), sum: { requests: 100, cachedRequests: 95, bytes: 0, cachedBytes: 0, threats: 0 } }
		]);
		const result = mapToEdgeKpiStats(raw);
		const kpi = result.find((k) => k.key === 'cacheHitRate')!;
		expect(kpi.badgeKey).toBe('common_status_excellent');
		expect(kpi.barClass).toBe('bg-success');
	});

	it('cacheHitRate ≥ 70% but < 90%: badgeKey=common_status_ok, barClass=bg-secondary', () => {
		const raw = makeAnalytics([
			{ ...makeAnalyticsGroup(), sum: { requests: 100, cachedRequests: 75, bytes: 0, cachedBytes: 0, threats: 0 } }
		]);
		const result = mapToEdgeKpiStats(raw);
		const kpi = result.find((k) => k.key === 'cacheHitRate')!;
		expect(kpi.badgeKey).toBe('common_status_ok');
		expect(kpi.barClass).toBe('bg-secondary');
	});

	it('cacheHitRate < 70%: badgeKey=common_status_warning, barClass=bg-error', () => {
		const raw = makeAnalytics([
			{ ...makeAnalyticsGroup(), sum: { requests: 100, cachedRequests: 50, bytes: 0, cachedBytes: 0, threats: 0 } }
		]);
		const result = mapToEdgeKpiStats(raw);
		const kpi = result.find((k) => k.key === 'cacheHitRate')!;
		expect(kpi.badgeKey).toBe('common_status_warning');
		expect(kpi.barClass).toBe('bg-error');
	});
});

describe('mapToEdgeKpiStats — blockedThreats badge', () => {
	it('blockedThreats > 0: badgeKey=common_status_caution', () => {
		const raw = makeAnalytics([
			{ ...makeAnalyticsGroup(), sum: { requests: 100, cachedRequests: 90, bytes: 0, cachedBytes: 0, threats: 1 } }
		]);
		const result = mapToEdgeKpiStats(raw);
		const kpi = result.find((k) => k.key === 'blockedThreats')!;
		expect(kpi.badgeKey).toBe('common_status_caution');
		expect(kpi.badgeClass).toBe('bg-secondary/10 text-secondary');
	});

	it('blockedThreats = 0: badgeKey=common_status_ok', () => {
		const raw = makeAnalytics([
			{ ...makeAnalyticsGroup(), sum: { requests: 100, cachedRequests: 90, bytes: 0, cachedBytes: 0, threats: 0 } }
		]);
		const result = mapToEdgeKpiStats(raw);
		const kpi = result.find((k) => k.key === 'blockedThreats')!;
		expect(kpi.badgeKey).toBe('common_status_ok');
		expect(kpi.badgeClass).toBe('bg-success/10 text-success');
	});
});

describe('mapToWafLog — structure', () => {
	it('returns empty array for empty input', () => {
		expect(mapToWafLog([])).toEqual([]);
	});

	it('returns one entry per firewall event', () => {
		const result = mapToWafLog([makeFirewallEvent(), makeFirewallEvent(), makeFirewallEvent()]);
		expect(result).toHaveLength(3);
	});

	it('entry id is sequential waf-N', () => {
		const result = mapToWafLog([makeFirewallEvent(), makeFirewallEvent()]);
		expect(result[0].id).toBe('waf-1');
		expect(result[1].id).toBe('waf-2');
	});
});

describe('mapToWafLog — time format', () => {
	it('time field has HH:MM:SS format (two digits each, colon-separated)', () => {
		const result = mapToWafLog([makeFirewallEvent({ datetime: '2024-01-15T03:05:07Z' })]);
		expect(result[0].time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
	});

	it('time segments are each exactly 2 characters', () => {
		const result = mapToWafLog([makeFirewallEvent({ datetime: '2024-01-15T00:00:00Z' })]);
		const parts = result[0].time.split(':');
		expect(parts).toHaveLength(3);
		for (const part of parts) {
			expect(part).toHaveLength(2);
		}
	});
});

describe('mapToWafLog — action mapping', () => {
	it('action "block" → actionKey=common_status_blocked, actionClass=bg-error/15 text-error', () => {
		const result = mapToWafLog([makeFirewallEvent({ action: 'block' })]);
		expect(result[0].actionKey).toBe('common_status_blocked');
		expect(result[0].actionClass).toBe('bg-error/15 text-error');
	});

	it('action "challenge" → actionKey=edge_status_challenge, actionClass=bg-secondary/15 text-secondary', () => {
		const result = mapToWafLog([makeFirewallEvent({ action: 'challenge' })]);
		expect(result[0].actionKey).toBe('edge_status_challenge');
		expect(result[0].actionClass).toBe('bg-secondary/15 text-secondary');
	});

	it('action "jschallenge" → actionKey=edge_status_challenge', () => {
		const result = mapToWafLog([makeFirewallEvent({ action: 'jschallenge' })]);
		expect(result[0].actionKey).toBe('edge_status_challenge');
	});

	it('action "managedchallenge" → actionKey=edge_status_challenge', () => {
		const result = mapToWafLog([makeFirewallEvent({ action: 'managedchallenge' })]);
		expect(result[0].actionKey).toBe('edge_status_challenge');
	});

	it('action "log" → actionKey=common_status_ok, actionClass=bg-success/15 text-success', () => {
		const result = mapToWafLog([makeFirewallEvent({ action: 'log' })]);
		expect(result[0].actionKey).toBe('common_status_ok');
		expect(result[0].actionClass).toBe('bg-success/15 text-success');
	});

	it('unknown action → actionKey=edge_status_throttle, actionClass=bg-secondary/15 text-secondary', () => {
		const result = mapToWafLog([makeFirewallEvent({ action: 'unknown_action' })]);
		expect(result[0].actionKey).toBe('edge_status_throttle');
		expect(result[0].actionClass).toBe('bg-secondary/15 text-secondary');
	});

	it('action matching is case-insensitive (BLOCK → blocked)', () => {
		const result = mapToWafLog([makeFirewallEvent({ action: 'BLOCK' })]);
		expect(result[0].actionKey).toBe('common_status_blocked');
	});
});

describe('mapToWafLog — source classification', () => {
	it('source containing "ddos" → type=DDoS, typeClass=bg-error/15 text-error', () => {
		const result = mapToWafLog([makeFirewallEvent({ source: 'ddos_protection' })]);
		expect(result[0].type).toBe('DDoS');
		expect(result[0].typeClass).toBe('bg-error/15 text-error');
	});

	it('source containing "flood" → type=DDoS', () => {
		const result = mapToWafLog([makeFirewallEvent({ source: 'l7_flood' })]);
		expect(result[0].type).toBe('DDoS');
	});

	it('source containing "l7" → type=DDoS', () => {
		const result = mapToWafLog([makeFirewallEvent({ source: 'l7-mitigation' })]);
		expect(result[0].type).toBe('DDoS');
	});

	it('source containing "ratelimit" → type=Rate Limit, typeClass=bg-[#3b82f6]/15 text-[#3b82f6]', () => {
		const result = mapToWafLog([makeFirewallEvent({ source: 'ratelimit' })]);
		expect(result[0].type).toBe('Rate Limit');
		expect(result[0].typeClass).toBe('bg-[#3b82f6]/15 text-[#3b82f6]');
	});

	it('source containing "rate_limit" → type=Rate Limit', () => {
		const result = mapToWafLog([makeFirewallEvent({ source: 'rate_limit_rule' })]);
		expect(result[0].type).toBe('Rate Limit');
	});

	it('source containing "bot" → type=Bot, typeClass=bg-[#f97316]/15 text-[#f97316]', () => {
		const result = mapToWafLog([makeFirewallEvent({ source: 'botmanagement' })]);
		expect(result[0].type).toBe('Bot');
		expect(result[0].typeClass).toBe('bg-[#f97316]/15 text-[#f97316]');
	});

	it('source containing "ua_block" → type=Bot', () => {
		const result = mapToWafLog([makeFirewallEvent({ source: 'ua_block_rule' })]);
		expect(result[0].type).toBe('Bot');
	});

	it('unrecognized source → type=WAF, typeClass=bg-[#8b5cf6]/15 text-[#8b5cf6]', () => {
		const result = mapToWafLog([makeFirewallEvent({ source: 'waf' })]);
		expect(result[0].type).toBe('WAF');
		expect(result[0].typeClass).toBe('bg-[#8b5cf6]/15 text-[#8b5cf6]');
	});
});

describe('mapToWafLog — country flag and status', () => {
	it('country code "US" produces US flag emoji', () => {
		const result = mapToWafLog([makeFirewallEvent({ clientCountry: 'US' })]);
		// US flag is two regional indicator symbols for U and S
		expect(result[0].countryFlag).toBe('🇺🇸');
		expect(result[0].country).toBe('US');
	});

	it('country code "XX" (unknown) → globe emoji 🌍', () => {
		const result = mapToWafLog([makeFirewallEvent({ clientCountry: 'XX' })]);
		expect(result[0].countryFlag).toBe('🌍');
	});

	it('statusKey is always common_status_resolved', () => {
		const result = mapToWafLog([makeFirewallEvent()]);
		expect(result[0].statusKey).toBe('common_status_resolved');
	});

	it('statusClass is always bg-success/10 text-success', () => {
		const result = mapToWafLog([makeFirewallEvent()]);
		expect(result[0].statusClass).toBe('bg-success/10 text-success');
	});

	it('ip field matches clientIP from event', () => {
		const result = mapToWafLog([makeFirewallEvent({ clientIP: '192.168.1.100' })]);
		expect(result[0].ip).toBe('192.168.1.100');
	});

	it('userAgent is truncated to 60 characters', () => {
		const longUA = 'Mozilla/5.0 (very long user agent string that exceeds sixty characters limit for sure)';
		const result = mapToWafLog([makeFirewallEvent({ userAgent: longUA })]);
		expect(result[0].message).toContain(longUA.slice(0, 60));
		expect(result[0].message.length).toBeLessThan(longUA.length + 50); // message has prefix
	});
});

describe('mapToHttpStatusDistribution', () => {
	it('returns exactly 4 buckets', () => {
		const result = mapToHttpStatusDistribution(makeAnalytics([]));
		expect(result).toHaveLength(4);
	});

	it('buckets have codes 2xx, 3xx, 4xx, 5xx', () => {
		const result = mapToHttpStatusDistribution(makeAnalytics([]));
		const codes = result.map((b) => b.code);
		expect(codes).toEqual(['2xx', '3xx', '4xx', '5xx']);
	});

	it('all percent values are "—" (data not available from Cloudflare analytics)', () => {
		const result = mapToHttpStatusDistribution(makeAnalytics([]));
		for (const bucket of result) {
			expect(bucket.percent).toBe('—');
		}
	});

	it('each bucket has a non-empty labelKey and color', () => {
		const result = mapToHttpStatusDistribution(makeAnalytics([]));
		for (const bucket of result) {
			expect(bucket.labelKey).toBeTruthy();
			expect(bucket.color).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});
});
