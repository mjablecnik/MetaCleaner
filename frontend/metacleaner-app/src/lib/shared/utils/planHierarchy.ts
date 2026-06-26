export const PLAN_HIERARCHY: Record<string, number> = {
	free: 0,
	pro: 1,
	proplus: 2
};

export function isUpgrade(current: string, target: string): boolean {
	return (PLAN_HIERARCHY[target] ?? -1) > (PLAN_HIERARCHY[current] ?? -1);
}

export function isDowngrade(current: string, target: string): boolean {
	return (PLAN_HIERARCHY[target] ?? -1) < (PLAN_HIERARCHY[current] ?? -1);
}

export function formatCurrency(amount: number, locale: 'en' | 'cs'): string {
	const formatted = amount.toFixed(2);
	if (locale === 'cs') {
		return `${formatted.replace('.', ',')} €`;
	}
	return `€${formatted}`;
}

export function formatDate(date: Date | string, locale: 'en' | 'cs'): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const day = String(d.getUTCDate()).padStart(2, '0');
	const month = String(d.getUTCMonth() + 1).padStart(2, '0');
	const year = d.getUTCFullYear();
	if (locale === 'cs') {
		return `${day}.${month}.${year}`;
	}
	return `${month}/${day}/${year}`;
}
