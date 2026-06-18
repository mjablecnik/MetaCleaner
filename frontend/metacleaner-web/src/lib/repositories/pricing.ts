export interface Plan {
	id: string;
	nameKey: string | null;
	nameText: string | null;
	priceMonthly: string;
	priceYearly: string;
	originalYearly: string | null;
	saveAmountYearly: string | null;
	subtitleKey: string;
	perKey: string | null;
	featureKeys: string[];
	ctaKey: string;
	featured: boolean;
	disabled: boolean;
}

export interface EnterprisePlan {
	titleKey: string;
	descKey: string;
	ctaKey: string;
}

export function pricingRepository(): Plan[] {
	return [
		{
			id: 'free',
			nameKey: 'pricing_plan_free_name',
			nameText: null,
			priceMonthly: '€0',
			priceYearly: '€0',
			originalYearly: null,
			saveAmountYearly: null,
			subtitleKey: 'pricing_plan_free_subtitle',
			perKey: null,
			featureKeys: [
				'pricing_feat_free_1',
				'pricing_feat_free_2',
				'pricing_feat_free_3',
				'pricing_feat_free_4'
			],
			ctaKey: 'pricing_cta_start_free',
			featured: false,
			disabled: false
		},
		{
			id: 'pack',
			nameKey: 'pricing_plan_pack_name',
			nameText: null,
			priceMonthly: '€4',
			priceYearly: '€4',
			originalYearly: null,
			saveAmountYearly: null,
			subtitleKey: 'pricing_plan_pack_subtitle',
			perKey: 'pricing_per_50',
			featureKeys: [
				'pricing_feat_pack_1',
				'pricing_feat_pack_2',
				'pricing_feat_pack_3',
				'pricing_feat_pack_4',
				'pricing_feat_pack_5'
			],
			ctaKey: 'pricing_cta_buy',
			featured: false,
			disabled: false
		},
		{
			id: 'pro',
			nameKey: null,
			nameText: 'Pro',
			priceMonthly: '€5,99',
			priceYearly: '€57,51',
			originalYearly: '€71,88',
			saveAmountYearly: '€14,37',
			subtitleKey: 'pricing_plan_pro_subtitle',
			perKey: 'pricing_per_month_short',
			featureKeys: [
				'pricing_feat_pro_1',
				'pricing_feat_pro_2',
				'pricing_feat_pro_3',
				'pricing_feat_pro_4',
				'pricing_feat_pro_5',
				'pricing_feat_pro_6'
			],
			ctaKey: 'pricing_cta_activate_pro',
			featured: true,
			disabled: false
		},
		{
			id: 'proplus',
			nameKey: null,
			nameText: 'Pro+',
			priceMonthly: '€12,99',
			priceYearly: '€124,71',
			originalYearly: '€155,88',
			saveAmountYearly: '€31,17',
			subtitleKey: 'pricing_plan_proplus_subtitle',
			perKey: 'pricing_per_month_short',
			featureKeys: [
				'pricing_feat_proplus_1',
				'pricing_feat_proplus_2',
				'pricing_feat_proplus_3',
				'pricing_feat_proplus_4'
			],
			ctaKey: 'pricing_cta_coming_soon',
			featured: false,
			disabled: true
		}
	];
}

export function getEnterprise(): EnterprisePlan {
	return {
		titleKey: 'pricing_enterprise_title',
		descKey: 'pricing_enterprise_desc',
		ctaKey: 'pricing_cta_contact'
	};
}

export function getPlanPrice(plan: Plan, yearly: boolean): string {
	return yearly ? plan.priceYearly : plan.priceMonthly;
}
