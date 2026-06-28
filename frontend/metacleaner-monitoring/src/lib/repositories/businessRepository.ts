export interface BusinessKpiStat {
	key: string;
	labelKey: string;
	value: string;
	badgeLabel: string;
	badgeClass: string;
	subtext: string;
	valueClass?: string;
	borderClass?: string;
}

export interface BusinessSecondaryKpi {
	key: string;
	labelKey: string;
	value: string;
	subtextKey: string;
	subtextHighlight?: string;
	subtextHighlightClass?: string;
	icon: string;
	iconColor: string;
	iconBg: string;
}

export interface OkrGoal {
	id: string;
	titleKey: string;
	current: number;
	target: number;
	unit: string;
	progressPercent: number;
	progressClass: string;
	statusKey: string;
	statusClass: string;
}

export interface PlanRevenue {
	id: string;
	label: string;
	value: number;
	color: string;
	percent: string;
}

export interface ConversionFunnelStep {
	id: string;
	labelKey: string;
	value: number;
	conversionPercent?: string;
	color: string;
}

export function getBusinessKpiStats(): BusinessKpiStat[] {
	return [
		{
			key: 'mrr',
			labelKey: 'business_kpi_mrr',
			value: '$1,240',
			badgeLabel: '+5.2%',
			badgeClass: 'bg-[#22c55e]/10 text-[#22c55e]',
			subtext: 'business_kpi_mrrSubtext'
		},
		{
			key: 'activeUsers',
			labelKey: 'business_kpi_activeUsers',
			value: '89',
			badgeLabel: '+3.4%',
			badgeClass: 'bg-[#22c55e]/10 text-[#22c55e]',
			subtext: 'business_kpi_activeUsersSubtext'
		},
		{
			key: 'churnRate',
			labelKey: 'business_kpi_churnRate',
			value: '3.2%',
			badgeLabel: '+0.2%',
			badgeClass: 'bg-[#ef4444]/10 text-[#ef4444]',
			subtext: 'business_kpi_churnRateSubtext',
			valueClass: 'text-[#ef4444]',
			borderClass: 'border-[#ef4444]/20'
		},
		{
			key: 'newSubscriptions',
			labelKey: 'business_kpi_newSubscriptions',
			value: '$13.93',
			badgeLabel: 'ARPU',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: 'business_kpi_newSubscriptionsSubtext'
		}
	];
}

export function getBusinessSecondaryKpis(): BusinessSecondaryKpi[] {
	return [
		{
			key: 'newOrders',
			labelKey: 'business_kpi_newOrders',
			value: '7',
			subtextKey: 'business_kpi_newOrdersSubtext',
			subtextHighlight: '+3',
			subtextHighlightClass: 'text-[#22c55e] font-medium',
			icon: 'fa-bag-shopping',
			iconColor: 'text-[#22c55e]',
			iconBg: 'bg-[#22c55e]/15'
		},
		{
			key: 'newCustomers',
			labelKey: 'business_kpi_newCustomers',
			value: '34',
			subtextKey: 'business_kpi_newCustomersSubtext',
			subtextHighlight: '+8',
			subtextHighlightClass: 'text-[#22c55e] font-medium',
			icon: 'fa-user-plus',
			iconColor: 'text-[#8b5cf6]',
			iconBg: 'bg-[#8b5cf6]/15'
		}
	];
}

export function getOkrGoals(): OkrGoal[] {
	return [
		{
			id: 'okr-1',
			titleKey: 'business_okr_mrrTarget',
			current: 1240,
			target: 2000,
			unit: '$',
			progressPercent: 62,
			progressClass: 'bg-[#22c55e]',
			statusKey: 'business_okr_onTrack',
			statusClass: 'bg-[#22c55e]/10 text-[#22c55e]'
		},
		{
			id: 'okr-2',
			titleKey: 'business_okr_churnTarget',
			current: 3.2,
			target: 2.5,
			unit: '%',
			progressPercent: 72,
			progressClass: 'bg-secondary',
			statusKey: 'business_okr_nearTarget',
			statusClass: 'bg-secondary/10 text-secondary'
		},
		{
			id: 'okr-3',
			titleKey: 'business_okr_userTarget',
			current: 2100,
			target: 3000,
			unit: '',
			progressPercent: 70,
			progressClass: 'bg-[#3b82f6]',
			statusKey: 'business_okr_onTrack',
			statusClass: 'bg-[#22c55e]/10 text-[#22c55e]'
		}
	];
}

export function getPlanRevenue(): PlanRevenue[] {
	return [
		{ id: 'free', label: 'Free (1,840)', value: 0, color: '#475569', percent: '0%' },
		{ id: 'pro', label: 'Pro (62)', value: 558, color: '#22c55e', percent: '41.6%' },
		{ id: 'business', label: 'Business (27)', value: 783, color: '#8b5cf6', percent: '58.4%' }
	];
}

export function getConversionFunnel(): ConversionFunnelStep[] {
	return [
		{ id: 'visitors', labelKey: 'business_funnel_visitors', value: 12400, color: '#3b82f6' },
		{
			id: 'registrations',
			labelKey: 'business_funnel_registrations',
			value: 2100,
			conversionPercent: '16.9%',
			color: '#8b5cf6'
		},
		{
			id: 'trialActivation',
			labelKey: 'business_funnel_trialActivation',
			value: 1840,
			conversionPercent: '87.6%',
			color: '#22c55e'
		},
		{
			id: 'trialConversion',
			labelKey: 'business_funnel_trialConversion',
			value: 89,
			conversionPercent: '4.8%',
			color: '#3ecf8e'
		},
		{
			id: 'activePaying',
			labelKey: 'business_funnel_activePaying',
			value: 89,
			conversionPercent: '100%',
			color: '#f97316'
		}
	];
}
