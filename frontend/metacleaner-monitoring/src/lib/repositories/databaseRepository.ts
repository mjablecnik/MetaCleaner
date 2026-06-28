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
			value: '42',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'Pool utilization: 42%',
			unit: '',
			max: '/ 100',
			barWidth: '42%',
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'queryLatency',
			labelKey: 'database_kpi_queryLatency',
			value: '12',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'P95: 68ms · P99: 180ms',
			unit: 'ms',
			trend: '-4ms',
			trendClass: 'text-success'
		},
		{
			key: 'storageUsed',
			labelKey: 'database_kpi_storage',
			value: '2.4',
			badgeKey: 'common_status_ok',
			badgeClass: 'bg-success/10 text-success',
			subtext: '30% kapacity využito',
			unit: '',
			max: '/ 8 GB',
			barWidth: '30%',
			barClass: 'bg-[#3b82f6]'
		},
		{
			key: 'dbErrors',
			labelKey: 'database_kpi_errors',
			value: '3',
			valueClass: 'text-error',
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			subtext: 'Timeout, conn reset',
			trend: '+1',
			trendClass: 'text-secondary'
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
			sql: 'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
			table: 'reports',
			calls: '640x',
			avgMs: 180,
			avgClass: 'text-error',
			meta: 'Tabulka: reports · Volání: 640x'
		},
		{
			type: 'SELECT',
			typeClass: 'bg-secondary/20 text-secondary',
			sql: 'SELECT f.* FROM files f JOIN jobs j ON f.job_id = j.id WHERE j.user_id = $1',
			table: 'files',
			calls: '1,420x',
			avgMs: 95,
			avgClass: 'text-secondary',
			meta: 'Tabulka: files · Volání: 1,420x'
		},
		{
			type: 'INSERT',
			typeClass: 'bg-[#3ecf8e]/20 text-[#3ecf8e]',
			sql: 'INSERT INTO jobs (user_id, status, created_at) VALUES ($1, $2, NOW())',
			table: 'jobs',
			calls: '1,380x',
			avgMs: 42,
			avgClass: 'text-[#3b82f6]',
			meta: 'Tabulka: jobs · Volání: 1,380x'
		},
		{
			type: 'UPDATE',
			typeClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			sql: 'UPDATE credits SET balance = balance - $1 WHERE user_id = $2',
			table: 'credits',
			calls: '1,380x',
			avgMs: 28,
			avgClass: 'text-textMain',
			meta: 'Tabulka: credits · Volání: 1,380x'
		},
		{
			type: 'SELECT',
			typeClass: 'bg-[#3b82f6]/20 text-[#3b82f6]',
			sql: 'SELECT status FROM jobs WHERE id = $1',
			table: 'jobs',
			calls: '8,400x',
			avgMs: 8,
			avgClass: 'text-textMain',
			meta: 'Tabulka: jobs · Volání: 8,400x'
		}
	];
}

export function getTableSizes(): TableSize[] {
	return [
		{ name: 'reports', sizeLabel: '15 MB', barWidth: '95%', barClass: 'bg-[#3b82f6]' },
		{ name: 'jobs', sizeLabel: '8 MB', barWidth: '53%', barClass: 'bg-[#3ecf8e]' },
		{ name: 'files', sizeLabel: '5 MB', barWidth: '35%', barClass: 'bg-[#8b5cf6]' },
		{ name: 'users', sizeLabel: '1 MB', barWidth: '10%', barClass: 'bg-secondary' },
		{ name: 'subscriptions', sizeLabel: '400 KB', barWidth: '6%', barClass: 'bg-[#3b82f6]/60' },
		{ name: 'credits', sizeLabel: '300 KB', barWidth: '5%', barClass: 'bg-[#3b82f6]/40' },
		{ name: 'api_keys', sizeLabel: '200 KB', barWidth: '5%', barClass: 'bg-[#f59e0b]/40' }
	];
}

export function getDbErrorLog(): DbErrorEntry[] {
	return [
		{
			id: 'dberr-1',
			time: '14:32:11',
			type: 'Timeout',
			typeClass: 'bg-error/15 text-error',
			message: 'Query timeout on reports JOIN – missing index on user_id',
			table: 'reports',
			duration: '30,000 ms',
			durationClass: 'text-error',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'dberr-2',
			time: '13:58:04',
			type: 'Conn',
			typeClass: 'bg-secondary/15 text-secondary',
			message: 'Connection reset by peer during large SELECT on files',
			table: 'files',
			duration: '8,200 ms',
			durationClass: 'text-secondary',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'dberr-3',
			time: '12:44:17',
			type: 'Timeout',
			typeClass: 'bg-error/15 text-error',
			message: 'INSERT timeout – jobs table write under high load',
			table: 'jobs',
			duration: '15,000 ms',
			durationClass: 'text-error',
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
		totalStorage: '2.4 GB',
		maxStorage: '8 GB',
		storagePercent: 30,
		estimatedFillDays: '~120 dní'
	};
}
