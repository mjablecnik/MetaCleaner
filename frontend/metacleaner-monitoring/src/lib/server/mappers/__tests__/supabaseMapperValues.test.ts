import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	formatBytes,
	mapToTableSizes,
	mapToDbKpis,
	mapToUserStats,
	mapToUsers
} from '../supabaseMapper.js';
import type { SupabaseTableStatsRaw, SupabaseUserRaw } from '../../clients/supabaseClient.js';

// 8 GiB cap matches STORAGE_CAP_BYTES in the source
const STORAGE_CAP_BYTES = 8 * 1024 * 1024 * 1024;

function makeTableStat(overrides: Partial<SupabaseTableStatsRaw> = {}): SupabaseTableStatsRaw {
	return {
		table_name: 'test_table',
		row_count: 100,
		total_bytes: 1024,
		...overrides
	};
}

// Fixed time: 2024-01-15T12:00:00.000Z
const FIXED_NOW = new Date('2024-01-15T12:00:00.000Z');
const FIXED_NOW_MS = FIXED_NOW.getTime();

function makeUser(overrides: Partial<SupabaseUserRaw> = {}): SupabaseUserRaw {
	return {
		id: 'user-1',
		email: 'john.doe@example.com',
		created_at: '2023-12-01T00:00:00Z',
		last_sign_in_at: new Date(FIXED_NOW_MS - 10 * 60 * 1000).toISOString(), // 10 min ago (online)
		app_metadata: { provider: 'email' },
		...overrides
	};
}

describe('formatBytes', () => {
	it('formats 0 as "0 B"', () => {
		expect(formatBytes(0)).toBe('0 B');
	});

	it('formats values below 1 KiB as "N B"', () => {
		expect(formatBytes(1)).toBe('1 B');
		expect(formatBytes(500)).toBe('500 B');
		expect(formatBytes(1023)).toBe('1023 B');
	});

	it('formats values 1 KiB–1 MiB as rounded "N KB"', () => {
		expect(formatBytes(1024)).toBe('1 KB');
		expect(formatBytes(1536)).toBe('2 KB'); // 1.5 KB → round → 2
		expect(formatBytes(1024 * 1023)).toBe('1023 KB');
	});

	it('formats values 1 MiB–1 GiB as "N.N MB"', () => {
		expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
		expect(formatBytes(1024 * 1024 * 512)).toBe('512.0 MB');
	});

	it('formats values 1 GiB and above as "N.NN GB"', () => {
		expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
		expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe('2.00 GB');
	});
});

describe('mapToTableSizes', () => {
	it('returns empty array for empty input', () => {
		expect(mapToTableSizes([])).toEqual([]);
	});

	it('sorts tables by total_bytes descending', () => {
		const raw = [
			makeTableStat({ table_name: 'small', total_bytes: 100 }),
			makeTableStat({ table_name: 'large', total_bytes: 10_000 }),
			makeTableStat({ table_name: 'medium', total_bytes: 1_000 })
		];
		const result = mapToTableSizes(raw);
		expect(result[0].name).toBe('large');
		expect(result[1].name).toBe('medium');
		expect(result[2].name).toBe('small');
	});

	it('does not mutate the input array order', () => {
		const raw = [
			makeTableStat({ table_name: 'small', total_bytes: 100 }),
			makeTableStat({ table_name: 'large', total_bytes: 10_000 })
		];
		mapToTableSizes(raw);
		expect(raw[0].table_name).toBe('small'); // original order preserved
	});

	it('largest table has barWidth of 100%', () => {
		const raw = [
			makeTableStat({ table_name: 'a', total_bytes: 2000 }),
			makeTableStat({ table_name: 'b', total_bytes: 1000 })
		];
		const result = mapToTableSizes(raw);
		expect(result[0].barWidth).toBe('100%');
	});

	it('other tables barWidth is round(bytes/max*100)%, with floor of 1%', () => {
		const raw = [
			makeTableStat({ table_name: 'a', total_bytes: 10_000 }),
			makeTableStat({ table_name: 'b', total_bytes: 1 }) // 1/10000 = 0.01% → max(1, 0) = 1%
		];
		const result = mapToTableSizes(raw);
		expect(result[1].barWidth).toBe('1%');
	});

	it('cycles barClass palette colors by index (7 colors then wraps)', () => {
		// Create 8 entries with strictly decreasing bytes so order is deterministic
		const raw = Array.from({ length: 8 }, (_, i) =>
			makeTableStat({ table_name: `t${i}`, total_bytes: 1000 - i })
		);
		const result = mapToTableSizes(raw);
		// 8th entry (index 7) should cycle back to color at index 0
		expect(result[7].barClass).toBe(result[0].barClass);
	});

	it('includes correct sizeLabel from formatBytes', () => {
		const raw = [makeTableStat({ total_bytes: 2048 })];
		const result = mapToTableSizes(raw);
		expect(result[0].sizeLabel).toBe('2 KB');
	});
});

describe('mapToDbKpis', () => {
	it('returns 4 KPIs', () => {
		expect(mapToDbKpis([])).toHaveLength(4);
	});

	it('storageUsed KPI is ok badge when usage < 70%', () => {
		// Use 0 bytes — 0% usage
		const kpis = mapToDbKpis([]);
		const kpi = kpis.find((k) => k.key === 'storageUsed')!;
		expect(kpi.badgeKey).toBe('common_status_ok');
		expect(kpi.badgeClass).toBe('bg-success/10 text-success');
	});

	it('storageUsed KPI is warning badge when usage >= 70% and < 90%', () => {
		// 70% of 8 GiB
		const bytes = Math.round(0.7 * STORAGE_CAP_BYTES);
		const kpis = mapToDbKpis([makeTableStat({ total_bytes: bytes, row_count: 0 })]);
		const kpi = kpis.find((k) => k.key === 'storageUsed')!;
		expect(kpi.badgeKey).toBe('common_status_warning');
	});

	it('storageUsed KPI is error badge when usage >= 90%', () => {
		// 90% of 8 GiB
		const bytes = Math.round(0.9 * STORAGE_CAP_BYTES);
		const kpis = mapToDbKpis([makeTableStat({ total_bytes: bytes, row_count: 0 })]);
		const kpi = kpis.find((k) => k.key === 'storageUsed')!;
		expect(kpi.badgeKey).toBe('common_status_error');
	});

	it('storageUsed barWidth reflects storage percentage', () => {
		const bytes = Math.round(0.5 * STORAGE_CAP_BYTES); // ~50%
		const kpis = mapToDbKpis([makeTableStat({ total_bytes: bytes, row_count: 0 })]);
		const kpi = kpis.find((k) => k.key === 'storageUsed')!;
		expect(kpi.barWidth).toBe('50%');
	});

	it('tableCount KPI value is the number of tables', () => {
		const raw = [
			makeTableStat({ table_name: 'a' }),
			makeTableStat({ table_name: 'b' }),
			makeTableStat({ table_name: 'c' })
		];
		const kpis = mapToDbKpis(raw);
		const kpi = kpis.find((k) => k.key === 'tableCount')!;
		expect(kpi.value).toBe('3');
	});

	it('tableCount KPI subtext shows total rows formatted', () => {
		const raw = [
			makeTableStat({ row_count: 500, total_bytes: 0 }),
			makeTableStat({ row_count: 1500, total_bytes: 0 })
		];
		const kpis = mapToDbKpis(raw);
		const kpi = kpis.find((k) => k.key === 'tableCount')!;
		expect(kpi.subtext).toContain('2,000'); // 2000 total rows formatted with locale
	});

	it('activeConnections and queryLatency KPIs have value "—"', () => {
		const kpis = mapToDbKpis([]);
		const conn = kpis.find((k) => k.key === 'activeConnections')!;
		const latency = kpis.find((k) => k.key === 'queryLatency')!;
		expect(conn.value).toBe('—');
		expect(latency.value).toBe('—');
	});

	it('storage value is shown in MB when below 0.1 GiB', () => {
		// 50 MiB = 52_428_800 bytes → storageGb ≈ 0.049 < 0.1
		const bytes = 50 * 1024 * 1024;
		const kpis = mapToDbKpis([makeTableStat({ total_bytes: bytes, row_count: 0 })]);
		const kpi = kpis.find((k) => k.key === 'storageUsed')!;
		expect(kpi.unit).toBe('MB');
		expect(kpi.value).toBe('50');
	});

	it('storage value is shown in GB when >= 0.1 GiB', () => {
		// 1 GiB = 1_073_741_824 bytes → storageGb = 1 >= 0.1
		const bytes = 1024 * 1024 * 1024;
		const kpis = mapToDbKpis([makeTableStat({ total_bytes: bytes, row_count: 0 })]);
		const kpi = kpis.find((k) => k.key === 'storageUsed')!;
		expect(kpi.unit).toBe('GB');
		expect(kpi.value).toBe('1.0');
	});
});

describe('mapToUsers — maskEmail (security)', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(FIXED_NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('masks local part longer than 2 chars: first + stars + last', () => {
		const result = mapToUsers([makeUser({ email: 'john@example.com' })]);
		// 'john' → 'j' + '**' + 'n' + '@example.com'
		expect(result[0].email).toBe('j**n@example.com');
	});

	it('masks local part of length 2: first + one star', () => {
		const result = mapToUsers([makeUser({ email: 'ab@example.com' })]);
		expect(result[0].email).toBe('a*@example.com');
	});

	it('masks local part of length 1: first + one star', () => {
		const result = mapToUsers([makeUser({ email: 'a@example.com' })]);
		expect(result[0].email).toBe('a*@example.com');
	});

	it('masks email with no @ as "***"', () => {
		const result = mapToUsers([makeUser({ email: 'invalidemail' })]);
		expect(result[0].email).toBe('***');
	});

	it('masks longer local part with correct star count', () => {
		// 'customer' (8 chars) → 'c' + '******' (6 stars) + 'r' + '@domain'
		const result = mapToUsers([makeUser({ email: 'customer@domain.com' })]);
		expect(result[0].email).toBe('c******r@domain.com');
	});
});

describe('mapToUsers — nameFromEmail', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(FIXED_NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('converts "john.doe" to "John Doe"', () => {
		const result = mapToUsers([makeUser({ email: 'john.doe@x.com' })]);
		expect(result[0].name).toBe('John Doe');
	});

	it('converts "jane_smith" to "Jane Smith"', () => {
		const result = mapToUsers([makeUser({ email: 'jane_smith@x.com' })]);
		expect(result[0].name).toBe('Jane Smith');
	});

	it('converts "first-last" to "First Last"', () => {
		const result = mapToUsers([makeUser({ email: 'first-last@x.com' })]);
		expect(result[0].name).toBe('First Last');
	});
});

describe('mapToUsers — getUserStatus', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(FIXED_NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns "online" when last sign in was within 15 minutes', () => {
		const signInAt = new Date(FIXED_NOW_MS - 10 * 60 * 1000).toISOString(); // 10 min ago
		const result = mapToUsers([makeUser({ last_sign_in_at: signInAt })]);
		expect(result[0].status).toBe('online');
	});

	it('returns "idle" when last sign in was 15–60 minutes ago', () => {
		const signInAt = new Date(FIXED_NOW_MS - 30 * 60 * 1000).toISOString(); // 30 min ago
		const result = mapToUsers([makeUser({ last_sign_in_at: signInAt })]);
		expect(result[0].status).toBe('idle');
	});

	it('returns "offline" when last sign in was more than 60 minutes ago', () => {
		const signInAt = new Date(FIXED_NOW_MS - 2 * 60 * 60 * 1000).toISOString(); // 2 h ago
		const result = mapToUsers([makeUser({ last_sign_in_at: signInAt })]);
		expect(result[0].status).toBe('offline');
	});

	it('returns "offline" when last_sign_in_at is null', () => {
		const result = mapToUsers([makeUser({ last_sign_in_at: null })]);
		expect(result[0].status).toBe('offline');
	});
});

describe('mapToUsers — formatLastLogin', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(FIXED_NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns "Just now" for sign in less than 2 minutes ago', () => {
		const signInAt = new Date(FIXED_NOW_MS - 60 * 1000).toISOString(); // 1 min ago
		const result = mapToUsers([makeUser({ last_sign_in_at: signInAt })]);
		expect(result[0].lastLogin).toBe('Just now');
	});

	it('returns "N min ago" for 2–59 minutes ago', () => {
		const signInAt = new Date(FIXED_NOW_MS - 15 * 60 * 1000).toISOString(); // 15 min ago
		const result = mapToUsers([makeUser({ last_sign_in_at: signInAt })]);
		expect(result[0].lastLogin).toBe('15 min ago');
	});

	it('returns "Nh ago" for 1–23 hours ago', () => {
		const signInAt = new Date(FIXED_NOW_MS - 3 * 60 * 60 * 1000).toISOString(); // 3 h ago
		const result = mapToUsers([makeUser({ last_sign_in_at: signInAt })]);
		expect(result[0].lastLogin).toBe('3h ago');
	});

	it('returns "N days ago" for 24+ hours ago', () => {
		const signInAt = new Date(FIXED_NOW_MS - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
		const result = mapToUsers([makeUser({ last_sign_in_at: signInAt })]);
		expect(result[0].lastLogin).toBe('3 days ago');
	});

	it('returns "—" when last_sign_in_at is null', () => {
		const result = mapToUsers([makeUser({ last_sign_in_at: null })]);
		expect(result[0].lastLogin).toBe('—');
	});
});

describe('mapToUserStats', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(FIXED_NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns 4 stat entries', () => {
		expect(mapToUserStats([])).toHaveLength(4);
	});

	it('totalUsers uses provided total param, not users.length', () => {
		const stats = mapToUserStats([makeUser()], 999);
		const totalKpi = stats.find((s) => s.key === 'totalUsers')!;
		expect(totalKpi.value).toBe('999');
	});

	it('totalUsers falls back to users.length when total is not provided', () => {
		const stats = mapToUserStats([makeUser(), makeUser()]);
		const totalKpi = stats.find((s) => s.key === 'totalUsers')!;
		expect(totalKpi.value).toBe('2');
	});

	it('loggedIn counts users with last_sign_in_at within 15 minutes', () => {
		const onlineSignIn = new Date(FIXED_NOW_MS - 10 * 60 * 1000).toISOString();
		const offlineSignIn = new Date(FIXED_NOW_MS - 30 * 60 * 1000).toISOString();
		const users = [
			makeUser({ last_sign_in_at: onlineSignIn }),
			makeUser({ last_sign_in_at: onlineSignIn }),
			makeUser({ last_sign_in_at: offlineSignIn })
		];
		const stats = mapToUserStats(users);
		const loggedIn = stats.find((s) => s.key === 'loggedIn')!;
		expect(loggedIn.value).toBe('2');
	});

	it('newRegistrations counts users created in the last 30 days', () => {
		const recentCreated = new Date(FIXED_NOW_MS - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
		const oldCreated = new Date(FIXED_NOW_MS - 40 * 24 * 60 * 60 * 1000).toISOString(); // 40 days ago
		const users = [
			makeUser({ created_at: recentCreated }),
			makeUser({ created_at: recentCreated }),
			makeUser({ created_at: oldCreated })
		];
		const stats = mapToUserStats(users);
		const newReg = stats.find((s) => s.key === 'newRegistrations')!;
		expect(newReg.value).toBe('2');
	});
});
