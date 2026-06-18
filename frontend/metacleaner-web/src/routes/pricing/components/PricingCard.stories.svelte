<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PricingCard from './PricingCard.svelte';

	const freePlan = {
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
	};

	const packPlan = {
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
	};

	const proPlan = {
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
	};

	const proplusPlan = {
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
	};

	const { Story } = defineMeta({
		title: 'Pricing/PricingCard',
		component: PricingCard,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['desktop', 'mobile'] },
			isYearly: { control: 'boolean' }
		},
		args: {
			plan: freePlan,
			isYearly: false,
			size: 'desktop'
		}
	});
</script>

<!-- Free — desktop, monthly -->
<Story name="Free" args={{ plan: freePlan, isYearly: false, size: 'desktop' }} />

<!-- Pack — desktop, monthly -->
<Story name="Pack" args={{ plan: packPlan, isYearly: false, size: 'desktop' }} />

<!-- Featured (Pro) — desktop, yearly -->
<Story name="Featured (Pro)" args={{ plan: proPlan, isYearly: true, size: 'desktop' }} />

<!-- Disabled (Pro+) — desktop, monthly -->
<Story name="Disabled (Pro+)" args={{ plan: proplusPlan, isYearly: false, size: 'desktop' }} />

<!-- Free — mobile -->
<Story name="Free / Mobile" args={{ plan: freePlan, isYearly: false, size: 'mobile' }} />

<!-- Featured (Pro) — mobile, yearly -->
<Story name="Featured (Pro) / Mobile" args={{ plan: proPlan, isYearly: true, size: 'mobile' }} />
