export interface AuthStat {
	value: string;
	labelKey: string;
}

export interface AuthPlan {
	id: 'free' | 'pro';
	nameKey: string;
	badgeKey: string;
	descriptionKey: string;
	icon: string;
	color: 'green' | 'orange';
}

export function getAuthStats(): AuthStat[] {
	return [
		{ value: '50K+', labelKey: 'auth.common.stats.usersLabel' },
		{ value: '2M+', labelKey: 'auth.common.stats.filesCleanedLabel' },
		{ value: '100%', labelKey: 'auth.common.stats.securityLabel' }
	];
}

export function getAuthPlans(): AuthPlan[] {
	return [
		{
			id: 'free',
			nameKey: 'auth.register.plan.freeName',
			badgeKey: 'auth.register.plan.freeBadge',
			descriptionKey: 'auth.register.plan.freeDesc',
			icon: '🌱',
			color: 'green'
		},
		{
			id: 'pro',
			nameKey: 'auth.register.plan.proName',
			badgeKey: 'auth.register.plan.proBadge',
			descriptionKey: 'auth.register.plan.proDesc',
			icon: '⚡',
			color: 'orange'
		}
	];
}
