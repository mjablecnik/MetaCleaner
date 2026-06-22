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
