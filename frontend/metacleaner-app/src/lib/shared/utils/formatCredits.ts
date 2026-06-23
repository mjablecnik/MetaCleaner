export function formatCreditCount(n: number): string {
	if (n > 99999) return '99,999+';
	return String(n);
}

export function getCreditColorScheme(balance: number): 'warning' | 'success' {
	return balance === 0 ? 'warning' : 'success';
}
