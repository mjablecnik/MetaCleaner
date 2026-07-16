import type {
	DbKpi,
	TableSize,
	UserStat,
	User,
	UserRole,
	UserStatus
} from '$lib/repositories/index.js';
import type { SupabaseTableStatsRaw, SupabaseUserRaw } from '../clients/supabaseClient.js';
import * as m from '$lib/paraglide/messages.js';

const TABLE_BAR_COLORS = [
	'bg-[#3b82f6]',
	'bg-[#3ecf8e]',
	'bg-[#8b5cf6]',
	'bg-secondary',
	'bg-[#3b82f6]/60',
	'bg-[#3b82f6]/40',
	'bg-[#f59e0b]/40'
];

// Supabase free tier is 500 MB; pro is 8 GB; assume 8 GB as cap for bar computation
const STORAGE_CAP_BYTES = 8 * 1024 * 1024 * 1024;

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${Math.round(kb)} KB`;
	const mb = kb / 1024;
	if (mb < 1024) return `${mb.toFixed(1)} MB`;
	const gb = mb / 1024;
	return `${gb.toFixed(2)} GB`;
}

export function mapToTableSizes(raw: SupabaseTableStatsRaw[]): TableSize[] {
	if (raw.length === 0) return [];

	const sorted = [...raw].sort((a, b) => b.total_bytes - a.total_bytes);
	const maxBytes = Math.max(sorted[0].total_bytes, 1);

	return sorted.map((row, idx) => {
		const pct = Math.max(1, Math.round((row.total_bytes / maxBytes) * 100));
		return {
			name: row.table_name,
			sizeLabel: formatBytes(row.total_bytes),
			barWidth: `${pct}%`,
			barClass: TABLE_BAR_COLORS[idx % TABLE_BAR_COLORS.length]
		};
	});
}

export function mapToDbKpis(raw: SupabaseTableStatsRaw[]): DbKpi[] {
	const totalBytes = raw.reduce((sum, t) => sum + t.total_bytes, 0);
	const totalRows = raw.reduce((sum, t) => sum + t.row_count, 0);
	const tableCount = raw.length;

	const storagePct = Math.min(100, Math.round((totalBytes / STORAGE_CAP_BYTES) * 100));
	const storageMb = totalBytes / (1024 * 1024);
	const storageGb = storageMb / 1024;
	const storageValue = storageGb >= 0.1 ? storageGb.toFixed(1) : storageMb.toFixed(0);
	const storageUnit = storageGb >= 0.1 ? 'GB' : 'MB';
	const storageBadgeKey =
		storagePct < 70
			? 'common_status_ok'
			: storagePct < 90
				? 'common_status_warning'
				: 'common_status_error';
	const storageBadgeClass =
		storagePct < 70
			? 'bg-success/10 text-success'
			: storagePct < 90
				? 'bg-secondary/10 text-secondary'
				: 'bg-error/10 text-error';

	return [
		{
			key: 'storageUsed',
			labelKey: 'database_kpi_storage',
			value: storageValue,
			badgeKey: storageBadgeKey,
			badgeClass: storageBadgeClass,
			subtext: m.database_kpi_storageUsed({ pct: storagePct }),
			unit: storageUnit,
			max: '/ 8 GB',
			barWidth: `${storagePct}%`,
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'tableCount',
			labelKey: 'database_kpi_tableCount',
			value: String(tableCount),
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: m.database_kpi_totalRows({ count: totalRows.toLocaleString() })
		}
	];
}

function getUserStatus(lastSignInAt: string | null): UserStatus {
	if (!lastSignInAt) return 'offline';
	const diff = Date.now() - new Date(lastSignInAt).getTime();
	if (diff < 15 * 60 * 1000) return 'online';
	if (diff < 60 * 60 * 1000) return 'idle';
	return 'offline';
}

function nameFromEmail(email: string): string {
	const local = email.split('@')[0];
	return local.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function maskEmail(email: string): string {
	const atIdx = email.indexOf('@');
	if (atIdx < 0) return '***';
	const local = email.slice(0, atIdx);
	const domain = email.slice(atIdx);
	if (local.length <= 2) return `${local[0]}*${domain}`;
	return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}${domain}`;
}

function formatRegistered(isoDate: string): string {
	const d = new Date(isoDate);
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

function formatLastLogin(lastSignInAt: string | null): string {
	if (!lastSignInAt) return '—';
	const diff = Date.now() - new Date(lastSignInAt).getTime();
	const minutes = Math.floor(diff / (60 * 1000));
	if (minutes < 2) return m.users_lastLogin_justNow();
	if (minutes < 60) return m.users_lastLogin_minAgo({ count: minutes });
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return m.users_lastLogin_hoursAgo({ count: hours });
	const days = Math.floor(hours / 24);
	return m.users_lastLogin_daysAgo({ count: days });
}

export function mapToUserStats(users: SupabaseUserRaw[], total?: number | null): UserStat[] {
	const now = Date.now();
	const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

	// GoTrue /auth/v1/admin/users does not always return a total field.
	// Fall back to the fetched page length so "Total users" never shows 0.
	const totalCount = total != null ? total : users.length;
	const onlineCount = users.filter((u) => {
		if (!u.last_sign_in_at) return false;
		return now - new Date(u.last_sign_in_at).getTime() < 15 * 60 * 1000;
	}).length;
	const newCount = users.filter((u) => new Date(u.created_at).getTime() > sevenDaysAgo).length;

	// Auth provider distribution from app_metadata.provider
	const providerCounts = new Map<string, number>();
	for (const u of users) {
		const provider = u.app_metadata?.provider ?? 'unknown';
		providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
	}
	const sortedProviders = [...providerCounts.entries()].sort((a, b) => b[1] - a[1]);
	const topProvider = sortedProviders[0]?.[0] ?? '—';
	const topProviderPct =
		users.length > 0 && sortedProviders.length > 0
			? Math.round((sortedProviders[0][1] / users.length) * 100)
			: 0;
	const authProviderValue = users.length > 0 ? topProvider : '—';
	const authProviderTrend = users.length > 0 ? `${topProviderPct}%` : '';

	return [
		{
			key: 'totalUsers',
			labelKey: 'users_stats_totalUsers',
			value: totalCount.toLocaleString(),
			trendKey: 'users_stats_vsLastMonth',
			trendValue: '',
			trendPositive: true,
			icon: 'fa-users',
			iconColor: 'text-primary',
			iconBg: 'bg-primary/10'
		},
		{
			key: 'loggedIn',
			labelKey: 'users_stats_currentlyLoggedIn',
			value: String(onlineCount),
			trendKey: 'users_stats_activeSessionsNow',
			trendValue: '',
			trendPositive: true,
			icon: 'fa-circle-dot',
			iconColor: 'text-blue-400',
			iconBg: 'bg-blue-500/10',
			pulse: true,
			pulseColor: 'bg-blue-400'
		},
		{
			key: 'newRegistrations',
			labelKey: 'users_stats_newRegistrations7d',
			value: String(newCount),
			trendKey: 'users_stats_vsPreviousPeriod',
			trendValue: '',
			trendPositive: true,
			icon: 'fa-user-plus',
			iconColor: 'text-secondary',
			iconBg: 'bg-secondary/10'
		},
		{
			key: 'authProvider',
			labelKey: 'users_stats_authProvider',
			value: authProviderValue,
			trendKey: 'users_stats_vsPreviousPeriod',
			trendValue: authProviderTrend,
			trendPositive: true,
			icon: 'fa-shield-halved',
			iconColor: 'text-[#f97316]',
			iconBg: 'bg-[#f97316]/10'
		}
	];
}

export function mapToUsers(raw: SupabaseUserRaw[]): User[] {
	return raw.map((user, idx) => ({
		id: idx + 1,
		name: nameFromEmail(user.email),
		email: maskEmail(user.email),
		avatar: '',
		status: getUserStatus(user.last_sign_in_at),
		registered: formatRegistered(user.created_at),
		lastLogin: formatLastLogin(user.last_sign_in_at),
		// GoTrue admin API exposes no session count, location, or role data.
		// These columns have no real source; components should treat them as placeholders.
		sessions: 0,
		location: '—',
		role: 'Viewer' as UserRole
	}));
}
