export interface DbKpi {
	key: string;
	labelKey: string;
	value: string;
	valueClass?: string;
	badgeKey: string;
	badgeClass: string;
	subtext: string;
	trend?: string;
	trendClass?: string;
	unit?: string;
	max?: string;
	barWidth?: string;
	barClass?: string;
}

export interface SlowQuery {
	type: string;
	typeClass: string;
	sql: string;
	table: string;
	calls: string;
	avgMs: number;
	avgClass: string;
	meta: string;
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
			subtext: 'Pool utilization: 87%',
			unit: '',
			max: '/ 100',
			barWidth: '87%',
			barClass: 'bg-secondary'
		},
		{
			key: 'queryLatency',
			labelKey: 'database_kpi_queryLatency',
			value: '24',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'P95: 142ms · P99: 380ms',
			unit: 'ms',
			trend: '-3ms',
			trendClass: 'text-success'
		},
		{
			key: 'storageUsed',
			labelKey: 'database_kpi_storage',
			value: '6.2',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: '77.5% kapacity využito',
			unit: '',
			max: '/ 8 GB',
			barWidth: '77%',
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'dbErrors',
			labelKey: 'database_kpi_errors',
			value: '12',
			valueClass: 'text-error',
			badgeKey: 'common_status_critical',
			badgeClass: 'bg-error/10 text-error',
			subtext: 'Timeout, deadlock, conn reset',
			trend: '+7',
			trendClass: 'text-error'
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
			avgClass: 'text-error',
			meta: 'Tabulka: orders · Volání: 842x'
		},
		{
			type: 'UPDATE',
			typeClass: 'bg-secondary/20 text-secondary',
			sql: 'UPDATE products SET stock = stock - 1 WHERE...',
			table: 'products',
			calls: '1,203x',
			avgMs: 620,
			avgClass: 'text-secondary',
			meta: 'Tabulka: products · Volání: 1,203x'
		},
		{
			type: 'SELECT',
			typeClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			sql: 'SELECT COUNT(*) FROM analytics WHERE date >',
			table: 'analytics',
			calls: '312x',
			avgMs: 390,
			avgClass: 'text-[#3b82f6]',
			meta: 'Tabulka: analytics · Volání: 312x'
		},
		{
			type: 'INSERT',
			typeClass: 'bg-[#3ecf8e]/20 text-[#3ecf8e]',
			sql: 'INSERT INTO events (user_id, type, meta) VALUES...',
			table: 'events',
			calls: '5,841x',
			avgMs: 84,
			avgClass: 'text-textMain',
			meta: 'Tabulka: events · Volání: 5,841x'
		},
		{
			type: 'SELECT',
			typeClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			sql: 'SELECT * FROM sessions WHERE expires_at > NOW()',
			table: 'sessions',
			calls: '22,100x',
			avgMs: 31,
			avgClass: 'text-textMain',
			meta: 'Tabulka: sessions · Volání: 22,100x'
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
		},
		{
			id: 'dberr-4',
			time: '12:44:17',
			type: 'Timeout',
			typeClass: 'bg-error/15 text-error',
			message: 'Query timeout on full table scan – missing index on user_id',
			table: 'events',
			duration: '30,000 ms',
			durationClass: 'text-error',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'dberr-5',
			time: '11:05:52',
			type: 'Lock',
			typeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			message: 'Row-level lock wait exceeded 10s on UPDATE statement',
			table: 'orders',
			duration: '10,140 ms',
			durationClass: 'text-textSec',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'dberr-6',
			time: '09:30:08',
			type: 'Repl',
			typeClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			message: 'Replication lag spike to 480ms detected on standby replica',
			table: '—',
			duration: '480 ms lag',
			durationClass: 'text-textSec',
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
