import type { SeverityLevel } from '$lib/scanner/types';

export type RingColor = 'red' | 'orange' | 'green' | 'blue';
export type BarSeverity = 'critical' | 'high' | 'medium' | 'low';

export const ringColorMap: Record<SeverityLevel, RingColor> = {
	critical: 'red',
	high: 'orange',
	medium: 'orange',
	low: 'green'
};

export const severityBadgeClass: Record<SeverityLevel, string> = {
	critical: 'border-brand-red/20 bg-brand-red/10 text-brand-red',
	high: 'border-brand-orange/20 bg-brand-orange/10 text-brand-orange',
	medium: 'border-brand-orange/20 bg-brand-orange/10 text-brand-orange',
	low: 'border-gray-700 bg-navy-lighter text-text-muted'
};

export const dotColorClass: Record<SeverityLevel, string> = {
	critical: 'bg-brand-red',
	high: 'bg-brand-orange',
	medium: 'bg-brand-orange',
	low: 'bg-gray-500'
};

export const severityTextClass: Record<SeverityLevel, string> = {
	critical: 'text-brand-red',
	high: 'text-brand-orange',
	medium: 'text-brand-orange',
	low: 'text-text-muted'
};

export const severityLabelKey: Record<SeverityLevel, string> = {
	critical: 'step2.risk.critical',
	high: 'step2.risk.high',
	medium: 'step2.risk.medium',
	low: 'step2.risk.low'
};

export function barSeverity(value: number): BarSeverity {
	if (value >= 75) return 'critical';
	if (value >= 50) return 'high';
	if (value >= 25) return 'medium';
	return 'low';
}
