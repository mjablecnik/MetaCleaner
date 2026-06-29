export interface PlanStyle {
	dotColor: string;
	glowColor: string;
	borderColor: string;
	bgGradient: string;
	textColor: string;
	icon: 'lock' | 'star';
	label: string;
}

export const PLAN_CONFIG: Record<string, { monthlyAllowance: number }> = {
	free: { monthlyAllowance: 3 },
	pro: { monthlyAllowance: 100 },
	proplus: { monthlyAllowance: 100 }
};

const FREE_STYLE: PlanStyle = {
	dotColor: 'bg-gray-500',
	glowColor: 'shadow-gray-500/30',
	borderColor: 'border-gray-600',
	bgGradient: 'from-navy-darker to-navy-dark',
	textColor: 'text-text-muted',
	icon: 'lock',
	label: 'Free'
};

const PRO_STYLE: PlanStyle = {
	dotColor: 'bg-blue-500',
	glowColor: 'shadow-blue-500/30',
	borderColor: 'border-blue-600',
	bgGradient: 'from-blue-950 to-navy-dark',
	textColor: 'text-blue-400',
	icon: 'star',
	label: 'Pro'
};

const PROPLUS_STYLE: PlanStyle = {
	dotColor: 'bg-orange-500',
	glowColor: 'shadow-orange-500/30',
	borderColor: 'border-orange-600',
	bgGradient: 'from-orange-950 to-navy-dark',
	textColor: 'text-orange-400',
	icon: 'star',
	label: 'Pro+'
};

const PRO_CANCELLING_STYLE: PlanStyle = {
	dotColor: 'bg-orange-400',
	glowColor: 'shadow-orange-400/30',
	borderColor: 'border-orange-400/60',
	bgGradient: 'from-orange-950/40 to-navy-dark',
	textColor: 'text-orange-300',
	icon: 'star',
	label: 'Pro'
};

const PROPLUS_CANCELLING_STYLE: PlanStyle = {
	dotColor: 'bg-orange-400',
	glowColor: 'shadow-orange-400/30',
	borderColor: 'border-orange-400/60',
	bgGradient: 'from-orange-950/40 to-navy-dark',
	textColor: 'text-orange-300',
	icon: 'star',
	label: 'Pro+'
};

export function getPlanStyle(planId: string | null, status: string | null): PlanStyle {
	if (!planId || planId === 'free' || status === 'cancelled') {
		return FREE_STYLE;
	}
	if (status === 'cancelling') {
		return planId === 'proplus' ? PROPLUS_CANCELLING_STYLE : PRO_CANCELLING_STYLE;
	}
	if (planId === 'pro' && (status === 'active' || status === 'trialing')) {
		return PRO_STYLE;
	}
	if (planId === 'proplus' && (status === 'active' || status === 'trialing')) {
		return PROPLUS_STYLE;
	}
	return FREE_STYLE;
}
