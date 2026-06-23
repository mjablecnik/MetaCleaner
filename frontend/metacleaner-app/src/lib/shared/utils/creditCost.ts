export function computeTotalCost(files: Array<{ type: string }>): number {
	return files.filter((f) => f.type !== 'unknown').length;
}

export function computeProgressRatio(remaining: number, allowance: number): number {
	if (allowance === 0) return 0;
	return Math.min(1, Math.max(0, remaining / allowance));
}

export function isInsufficientCredits(totalCost: number, creditBalance: number): boolean {
	return totalCost > creditBalance;
}
