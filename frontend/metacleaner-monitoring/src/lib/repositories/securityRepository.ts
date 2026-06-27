export interface SecurityKpiStat {
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
	valueClass?: string;
	borderClass?: string;
}

export interface SecuritySecondaryKpi {
	key: string;
	labelKey: string;
	value: string;
	subtext: string;
	icon: string;
	iconColor: string;
	iconBg: string;
	valueClass?: string;
	subtextExtra?: string;
	subtextExtraClass?: string;
}

export interface AttackType {
	id: string;
	label: string;
	percent: number;
	color: string;
}

export interface ActiveThreat {
	id: string;
	titleKey: string;
	severityKey: string;
	severityClass: string;
	borderClass: string;
	bgClass: string;
	icon: string;
	iconClass: string;
	iconBg: string;
	ip: string;
	origin: string;
	detail: string;
	endpoint: string;
	agentOrNote: string;
	time: string;
	actionKey: string;
	actionClass: string;
	actionHoverClass: string;
}

export interface BlockedIp {
	id: string;
	ip: string;
	country: string;
	reason: string;
	attempts?: string;
	blockTypeKey: string;
	blockTypeClass: string;
	blockedAt: string;
	iconClass: string;
}

export interface SecurityEvent {
	id: string;
	time: string;
	levelKey: string;
	levelClass: string;
	message: string;
	ip?: string;
	statusKey: string;
	statusClass: string;
}

export interface SecuritySummary {
	activeThreats: number;
}

export function getSecuritySummary(): SecuritySummary {
	return { activeThreats: 3 };
}

export function getSecurityKpiStats(): SecurityKpiStat[] {
	return [
		{
			key: 'threatScore',
			labelKey: 'security_kpi_threatScore',
			value: '74',
			unit: '/ 100',
			trend: '+12',
			trendPositive: false,
			badgeKey: 'security_kpi_critical',
			badgeClass: 'bg-error/10 text-error',
			subtext: 'security_kpi_threatScoreSubtext',
			barWidth: '74%',
			barClass: 'bg-error',
			valueClass: 'text-error',
			borderClass: 'border-error/30'
		},
		{
			key: 'failedLogins',
			labelKey: 'security_kpi_failedLogins',
			value: '1,284',
			trend: '+340',
			trendPositive: false,
			badgeKey: 'common_status_warning',
			badgeClass: 'bg-secondary/10 text-secondary',
			subtext: 'security_kpi_failedLoginsSubtext'
		},
		{
			key: 'blockedIps',
			labelKey: 'security_kpi_blockedIps',
			value: '38',
			trend: '+6',
			trendPositive: true,
			badgeKey: 'security_kpi_active',
			badgeClass: 'bg-success/10 text-success',
			subtext: 'security_kpi_blockedIpsSubtext'
		},
		{
			key: 'anomalies24h',
			labelKey: 'security_kpi_anomalies24h',
			value: '7',
			trend: '+3',
			trendPositive: false,
			badgeKey: 'security_kpi_critical',
			badgeClass: 'bg-error/10 text-error',
			subtext: 'security_kpi_anomaliesSubtext',
			valueClass: 'text-error'
		}
	];
}

export function getSecuritySecondaryKpis(): SecuritySecondaryKpi[] {
	return [
		{
			key: 'portScans',
			labelKey: 'security_kpi_portScans',
			value: '12',
			subtext: 'security_kpi_portScansSubtext',
			icon: 'fa-eye',
			iconColor: 'text-[#3b82f6]',
			iconBg: 'bg-[#3b82f6]/15'
		},
		{
			key: 'sqlInjection',
			labelKey: 'security_kpi_sqlInjection',
			value: '23',
			subtext: 'security_kpi_sqlInjectionSubtext',
			icon: 'fa-bug',
			iconColor: 'text-error',
			iconBg: 'bg-error/15'
		},
		{
			key: 'suspiciousApiKeys',
			labelKey: 'security_kpi_suspiciousApiKeys',
			value: '2',
			subtext: 'security_kpi_suspiciousApiKeysSubtext',
			icon: 'fa-key',
			iconColor: 'text-[#8b5cf6]',
			iconBg: 'bg-[#8b5cf6]/15'
		},
		{
			key: 'sslCerts',
			labelKey: 'security_kpi_sslCerts',
			value: 'Platné',
			subtext: 'security_kpi_sslCertsSubtext',
			subtextExtra: '18 dní',
			subtextExtraClass: 'text-secondary font-medium',
			icon: 'fa-certificate',
			iconColor: 'text-success',
			iconBg: 'bg-success/15',
			valueClass: 'text-success'
		}
	];
}

export function getAttackTypes(): AttackType[] {
	return [
		{ id: 'brute-force', label: 'Brute Force', percent: 42, color: '#ef4444' },
		{ id: 'sql-injection', label: 'SQL Injection', percent: 28, color: '#8b5cf6' },
		{ id: 'xss', label: 'XSS', percent: 18, color: '#f97316' },
		{ id: 'rate-abuse', label: 'Rate Abuse', percent: 12, color: '#3b82f6' }
	];
}

export function getActiveThreats(): ActiveThreat[] {
	return [
		{
			id: 'threat-1',
			titleKey: 'security_threat_bruteForceTitle',
			severityKey: 'security_threat_critical',
			severityClass: 'bg-error/20 text-error',
			borderClass: 'border-error/20',
			bgClass: 'bg-error/5',
			icon: 'fa-user-ninja',
			iconClass: 'text-error',
			iconBg: 'bg-error/15',
			ip: '185.234.219.14',
			origin: 'RU',
			detail: 'security_threat_bruteForceDetail',
			endpoint: '/api/auth/login',
			agentOrNote: 'python-requests/2.28',
			time: '14:32',
			actionKey: 'security_action_blockIp',
			actionClass: 'bg-error text-white hover:bg-error/90',
			actionHoverClass: 'hover:bg-error/90'
		},
		{
			id: 'threat-2',
			titleKey: 'security_threat_sqlInjectionTitle',
			severityKey: 'security_threat_high',
			severityClass: 'bg-[#8b5cf6]/20 text-[#8b5cf6]',
			borderClass: 'border-[#8b5cf6]/20',
			bgClass: 'bg-[#8b5cf6]/5',
			icon: 'fa-bug',
			iconClass: 'text-[#8b5cf6]',
			iconBg: 'bg-[#8b5cf6]/15',
			ip: '92.118.160.47',
			origin: 'CN',
			detail: 'security_threat_sqlInjectionDetail',
			endpoint: '/api/products/search',
			agentOrNote: "1' OR '1'='1",
			time: '13:58',
			actionKey: 'security_action_blockIp',
			actionClass: 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]',
			actionHoverClass: 'hover:bg-[#7c3aed]'
		},
		{
			id: 'threat-3',
			titleKey: 'security_threat_suspiciousApiKeyTitle',
			severityKey: 'security_threat_medium',
			severityClass: 'bg-secondary/20 text-secondary',
			borderClass: 'border-secondary/20',
			bgClass: 'bg-secondary/5',
			icon: 'fa-key',
			iconClass: 'text-secondary',
			iconBg: 'bg-secondary/15',
			ip: 'sk_live_***8f2a',
			origin: 'NG',
			detail: 'security_threat_suspiciousApiKeyDetail',
			endpoint: '/api/export',
			agentOrNote: 'u_4821',
			time: '12:15',
			actionKey: 'security_action_revokeKey',
			actionClass: 'bg-secondary text-white hover:bg-orange-600',
			actionHoverClass: 'hover:bg-orange-600'
		}
	];
}

export function getBlockedIps(): BlockedIp[] {
	return [
		{
			id: 'ip-1',
			ip: '185.234.219.14',
			country: 'RU',
			reason: 'Brute force · 1,084 pokusů',
			blockTypeKey: 'security_block_auto',
			blockTypeClass: 'bg-error/15 text-error',
			blockedAt: 'dnes 14:32',
			iconClass: 'text-error'
		},
		{
			id: 'ip-2',
			ip: '92.118.160.47',
			country: 'CN',
			reason: 'SQL Injection · WAF blok',
			blockTypeKey: 'security_block_waf',
			blockTypeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			blockedAt: 'dnes 13:58',
			iconClass: 'text-[#8b5cf6]'
		},
		{
			id: 'ip-3',
			ip: '45.142.212.100',
			country: 'UA',
			reason: 'Rate abuse · 8,200 req/h',
			blockTypeKey: 'security_block_auto',
			blockTypeClass: 'bg-secondary/15 text-secondary',
			blockedAt: 'dnes 11:14',
			iconClass: 'text-secondary'
		},
		{
			id: 'ip-4',
			ip: '103.21.244.18',
			country: 'IN',
			reason: 'XSS pokus · WAF CF-XSS-012',
			blockTypeKey: 'security_block_waf',
			blockTypeClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			blockedAt: 'dnes 10:04',
			iconClass: 'text-[#3b82f6]'
		},
		{
			id: 'ip-5',
			ip: '77.88.55.66',
			country: 'RU',
			reason: 'Scraping · 50k req za 10 min',
			blockTypeKey: 'security_block_manual',
			blockTypeClass: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
			blockedAt: 'včera 22:17',
			iconClass: 'text-[#8b5cf6]'
		}
	];
}

export function getSecurityEvents(): SecurityEvent[] {
	return [
		{
			id: 'sec-evt-1',
			time: '14:51',
			levelKey: 'common_level_critical',
			levelClass: 'bg-error/15 text-error',
			message: 'Brute force útok na /api/auth/login – 1,084 pokusů za 2h z 185.234.219.14',
			ip: '185.234.219.14',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'sec-evt-2',
			time: '14:38',
			levelKey: 'common_level_critical',
			levelClass: 'bg-error/15 text-error',
			message: "SQL Injection payload detekován – pravidlo WAF CF-SQLi-001, payload: 1' OR '1'='1",
			ip: '92.118.160.47',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'sec-evt-3',
			time: '13:55',
			levelKey: 'common_level_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			message: 'Podezřelý API klíč sk_live_***8f2a – přístup z neznámé lokace (NG)',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		{
			id: 'sec-evt-4',
			time: '11:14',
			levelKey: 'common_level_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			message: 'Rate abuse detekován z 45.142.212.100 – 8,200 req/h (limit: 500)',
			ip: '45.142.212.100',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'sec-evt-5',
			time: '10:04',
			levelKey: 'common_level_warning',
			levelClass: 'bg-secondary/15 text-secondary',
			message: 'XSS pokus blokován WAF – pravidlo CF-XSS-012, IP: 103.21.244.18',
			ip: '103.21.244.18',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		{
			id: 'sec-evt-6',
			time: '09:12',
			levelKey: 'common_level_info',
			levelClass: 'bg-[#3b82f6]/15 text-[#3b82f6]',
			message: 'SSL certifikát obnovení naplánováno – vyprší za 18 dní',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		}
	];
}
