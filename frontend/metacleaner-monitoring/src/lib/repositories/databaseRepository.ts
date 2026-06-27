export interface DbKpi {
	key: string;
	labelKey: string;
	value: string;
	valueClass?: string;
	badgeKey: string;
	badgeClass: string;
	subtextKey: string;
	subtextValue?: string;
	barWidth?: string;
	barClass?: string;
}

export interface DbSecondaryKpi {
	key: string;
	labelKey: string;
	value: string;
	iconClass: string;
	icon: string;
	subtextKey: string;
	subtextValue?: string;
}

export interface SlowQuery {
	type: string;
	typeClass: string;
	sql: string;
	table: string;
	calls: string;
	avgMs: number;
	avgClass: string;
}

export interface TableSize {
	name: string;
	sizeLabel: string;
	barWidth: string;
	barClass: string;
}

export interface DbErrorEntry {
	id: string;
	time: string;
	type: string;
	typeClass: string;
	message: string;
	table: string;
	duration: string;
	durationClass: string;
	statusKey: string;
	statusClass: string;
}

export interface QueryTypeDistribution {
	label: string;
	percent: number;
	color: string;
}

export function getDbKpis(): DbKpi[] {
	return [
		{
			key: 'activeConnections',
			labelKey: 'database_kpi_activeConnections',
			value: '87',
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			subtextKey: 'database_kpi_activeConnectionsSubtext',
			subtextValue: '87%',
			barWidth: '87%',
			barClass: 'bg-secondary'
		},
		{
			key: 'queryLatency',
			labelKey: 'database_kpi_queryLatency',
			value: '24',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtextKey: 'database_kpi_queryLatencySubtext'
		},
		{
			key: 'storageUsed',
			labelKey: 'database_kpi_storageUsed',
			value: '6.2',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtextKey: 'database_kpi_storageSubtext',
			subtextValue: '77.5%',
			barWidth: '77%',
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'dbErrors',
			labelKey: 'database_kpi_dbErrors',
			value: '12',
			valueClass: 'text-error',
			badgeKey: 'common_status_critical',
			badgeClass: 'bg-error/10 text-error',
			subtextKey: 'database_kpi_dbErrorsSubtext'
		}
	];
}

export function getDbSecondaryKpis(): DbSecondaryKpi[] {
	return [
		{
			key: 'queriesPerMin',
			labelKey: 'database_kpi_queriesPerMin',
			value: '1,842',
			icon: 'fa-arrow-right-to-bracket',
			iconClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			subtextKey: 'database_kpi_queriesPerMinSubtext'
		},
		{
			key: 'replicationLag',
			labelKey: 'database_kpi_replicationLag',
			value: '18 ms',
			icon: 'fa-copy',
			iconClass: 'bg-[#3ecf8e]/15 text-[#3ecf8e]',
			subtextKey: 'database_kpi_replicationLagSubtext'
		},
		{
			key: 'locks',
			labelKey: 'database_kpi_locks',
			value: '3',
			icon: 'fa-lock',
			iconClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			subtextKey: 'database_kpi_locksSubtext'
		},
		{
			key: 'backups',
			labelKey: 'database_kpi_backups',
			value: 'Aktuální',
			icon: 'fa-shield-halved',
			iconClass: 'bg-success/15 text-success',
			subtextKey: 'database_kpi_backupsSubtext'
		}
	];
}

export function getQueryTypeDistribution(): QueryTypeDistribution[] {
	return [
		{ label: 'SELECT', percent: 68, color: 'bg-[#3b82f6]' },
		{ label: 'INSERT', percent: 18, color: 'bg-[#3ecf8e]' },
		{ label: 'UPDATE', percent: 11, color: 'bg-secondary' },
		{ label: 'DELETE', percent: 3, color: 'bg-error' }
	];
}

export function getSlowestQueries(): SlowQuery[] {
	return [
		{
			type: 'SELECT',
			typeClass: 'bg-error/20 text-error',
			sql: 'SELECT * FROM orders JOIN users ON...',
			table: 'orders',
			calls: '842x',
			avgMs: 1240,
			avgClass: 'text-error'
		},
		{
			type: 'UPDATE',
			typeClass: 'bg-secondary/20 text-secondary',
			sql: 'UPDATE products SET stock = stock - 1 WHERE...',
			table: 'products',
			calls: '1,203x',
			avgMs: 620,
			avgClass: 'text-secondary'
		},
		{
			type: 'SELECT',
			typeClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			sql: 'SELECT COUNT(*) FROM analytics WHERE date >',
			table: 'analytics',
			calls: '312x',
			avgMs: 390,
			avgClass: 'text-[#3b82f6]'
		},
		{
			type: 'INSERT',
			typeClass: 'bg-[#3ecf8e]/20 text-[#3ecf8e]',
			sql: 'INSERT INTO events (user_id, type, meta) VALUES...',
			table: 'events',
			calls: '5,841x',
			avgMs: 84,
			avgClass: 'text-textMain'
		},
		{
			type: 'SELECT',
			typeClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			sql: "SELECT * FROM sessions WHERE expires_at > NOW()",
			table: 'sessions',
			calls: '22,100x',
			avgMs: 31,
			avgClass: 'text-textMain'
		}
	];
}

export function getTableSizes(): TableSize[] {
	return [
		{ name: 'events', sizeLabel: '2.1 GB', barWidth: '82%', barClass: 'bg-[#3b82f6]' },
		{ name: 'orders', sizeLabel: '1.5 GB', barWidth: '60%', barClass: 'bg-[#3ecf8e]' },
		{ name: 'analytics', sizeLabel: '1.2 GB', barWidth: '48%', barClass: 'bg-[#8b5cf6]' },
		{ name: 'users', sizeLabel: '780 MB', barWidth: '30%', barClass: 'bg-secondary' },
		{ name: 'sessions', sizeLabel: '460 MB', barWidth: '18%', barClass: 'bg-[#3b82f6]/60' },
		{ name: 'products', sizeLabel: '210 MB', barWidth: '8%', barClass: 'bg-[#3b82f6]/40' }
	];
}

export function getDbErrorLog(): DbErrorEntry[] {
	return [
		{
			id: 'dberr-1',
			time: '14:32:11',
			type: 'Timeout',
			typeClass: 'bg-error/15 text-error',
			message: 'Connection pool exhausted – max 100 connections reached',
			table: 'orders',
			duration: '30,000 ms',
			durationClass: 'text-error',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'dberr-2',
			time: '13:58:04',
			type: 'Deadlock',
			typeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			message: 'Deadlock detected between transactions T1 and T2',
			table: 'products',
			duration: '—',
			durationClass: 'text-textSec',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'dberr-3',
			time: '13:21:39',
			type: 'Conn',
			typeClass: 'bg-secondary/15 text-secondary',
			message: 'Connection reset by peer during large SELECT query',
			table: 'analytics',
			duration: '8,200 ms',
			durationClass: 'text-secondary',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		}
	];
}

export interface DatabaseStats {
	totalStorage: string;
	maxStorage: string;
	storagePercent: number;
	estimatedFillDays: string;
}

export function getDatabaseStats(): DatabaseStats {
	return {
		totalStorage: '6.2 GB',
		maxStorage: '8 GB',
		storagePercent: 77,
		estimatedFillDays: '~14 dní'
	};
}
