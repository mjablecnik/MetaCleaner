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
			value: '$48,320',
			badgeLabel: '+12.4%',
			badgeClass: 'bg-[#22c55e]/10 text-[#22c55e]',
			subtext: 'business_kpi_mrrSubtext'
		},
		{
			key: 'activeUsers',
			labelKey: 'business_kpi_activeUsers',
			value: '12,842',
			badgeLabel: '+8.1%',
			badgeClass: 'bg-[#22c55e]/10 text-[#22c55e]',
			subtext: 'business_kpi_activeUsersSubtext'
		},
		{
			key: 'churnRate',
			labelKey: 'business_kpi_churnRate',
			value: '2.1%',
			badgeLabel: '-0.3%',
			badgeClass: 'bg-[#22c55e]/10 text-[#22c55e]',
			subtext: 'business_kpi_churnRateSubtext',
			valueClass: 'text-[#ef4444]',
			borderClass: 'border-[#ef4444]/20'
		},
		{
			key: 'newSubscriptions',
			labelKey: 'business_kpi_newSubscriptions',
			value: '1,204',
			badgeLabel: '+142',
			badgeClass: 'bg-[#22c55e]/10 text-[#22c55e]',
			subtext: 'business_kpi_newSubscriptionsSubtext'
		}
	];
}

export function getBusinessSecondaryKpis(): BusinessSecondaryKpi[] {
	return [
		{
			key: 'newOrders',
			labelKey: 'business_kpi_newOrders',
			value: '1,204',
			subtextKey: 'business_kpi_newOrdersSubtext',
			subtextHighlight: '+142',
			subtextHighlightClass: 'text-[#22c55e] font-medium',
			icon: 'fa-bag-shopping',
			iconColor: 'text-[#22c55e]',
			iconBg: 'bg-[#22c55e]/15'
		},
		{
			key: 'newCustomers',
			labelKey: 'business_kpi_newCustomers',
			value: '318',
			subtextKey: 'business_kpi_newCustomersSubtext',
			subtextHighlight: '+42',
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
			current: 48320,
			target: 60000,
			unit: '$',
			progressPercent: 80.5,
			progressClass: 'bg-[#22c55e]',
			statusKey: 'business_okr_onTrack',
			statusClass: 'bg-[#22c55e]/10 text-[#22c55e]'
		},
		{
			id: 'okr-2',
			titleKey: 'business_okr_churnTarget',
			current: 2.1,
			target: 2.0,
			unit: '%',
			progressPercent: 95,
			progressClass: 'bg-secondary',
			statusKey: 'business_okr_nearTarget',
			statusClass: 'bg-secondary/10 text-secondary'
		},
		{
			id: 'okr-3',
			titleKey: 'business_okr_userTarget',
			current: 12842,
			target: 15000,
			unit: '',
			progressPercent: 85.6,
			progressClass: 'bg-[#3b82f6]',
			statusKey: 'business_okr_onTrack',
			statusClass: 'bg-[#22c55e]/10 text-[#22c55e]'
		}
	];
}

export function getPlanRevenue(): PlanRevenue[] {
	return [
		{ id: 'starter', label: 'Starter', value: 6840, color: '#3b82f6', percent: '14.1%' },
		{ id: 'pro', label: 'Pro', value: 18200, color: '#22c55e', percent: '37.7%' },
		{ id: 'business', label: 'Business', value: 14880, color: '#8b5cf6', percent: '30.8%' },
		{ id: 'enterprise', label: 'Enterprise', value: 8400, color: '#f97316', percent: '17.4%' }
	];
}

export function getConversionFunnel(): ConversionFunnelStep[] {
	return [
		{ id: 'visitors', labelKey: 'business_funnel_visitors', value: 84210, color: '#3b82f6' },
		{
			id: 'registrations',
			labelKey: 'business_funnel_registrations',
			value: 12318,
			conversionPercent: '14.6%',
			color: '#8b5cf6'
		},
		{
			id: 'trialActivation',
			labelKey: 'business_funnel_trialActivation',
			value: 6840,
			conversionPercent: '55.5%',
			color: '#22c55e'
		},
		{
			id: 'trialConversion',
			labelKey: 'business_funnel_trialConversion',
			value: 2104,
			conversionPercent: '30.8%',
			color: '#3ecf8e'
		},
		{
			id: 'activePaying',
			labelKey: 'business_funnel_activePaying',
			value: 1840,
			conversionPercent: '87.5%',
			color: '#f97316'
		}
	];
}
