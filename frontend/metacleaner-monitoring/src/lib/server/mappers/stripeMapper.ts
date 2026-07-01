import type { BusinessKpiStat, PlanRevenue } from '$lib/repositories/index.js';
import type { StripeSubscriptionRaw, StripePriceRaw } from '../clients/stripeClient.js';

const PLAN_COLORS = ['#22c55e', '#8b5cf6', '#f97316', '#ec4899', '#3b82f6'];
const FREE_COLOR = '#475569';

function normalizeToMonthly(amount: number, interval: string, intervalCount: number): number {
	const count = intervalCount > 0 ? intervalCount : 1;
	if (interval === 'month') return amount / count;
	if (interval === 'year') return amount / (12 * count);
	if (interval === 'week') return (amount * 52) / (12 * count);
	return amount;
}

export function computeMrr(subs: StripeSubscriptionRaw[]): number {
	let mrr = 0;
	for (const sub of subs) {
		for (const item of sub.items.data) {
			const { unit_amount, recurring } = item.price;
			const quantity = item.quantity ?? 1;
			mrr += normalizeToMonthly(
				unit_amount * quantity,
				recurring.interval,
				recurring.interval_count
			);
		}
	}
	return mrr;
}

export function computeChurnRate(
	activeSubs: StripeSubscriptionRaw[],
	canceledSubs: StripeSubscriptionRaw[],
	windowStartUnix?: number
): number {
	const canceledCount = canceledSubs.length;
	// Denominator = subscriptions active at the START of the window.
	// New joiners (created during the window) are excluded to avoid inflating the base.
	const newJoiners =
		windowStartUnix != null
			? activeSubs.filter((s) => s.created >= windowStartUnix).length
			: 0;
	const activeAtStart = activeSubs.length - newJoiners;
	const total = activeAtStart + canceledCount;
	if (total === 0) return 0;
	return (canceledCount / total) * 100;
}

export function computeArpu(mrrCents: number, activeCount: number): number {
	if (activeCount === 0) return 0;
	return mrrCents / activeCount;
}

function formatMrr(cents: number): string {
	const dollars = Math.round(cents / 100);
	return `$${dollars.toLocaleString()}`;
}

function formatArpu(cents: number): string {
	const dollars = cents / 100;
	return `$${dollars.toFixed(2)}`;
}

export function mapToBusinessKpiStats(
	activeSubs: StripeSubscriptionRaw[],
	canceledSubs: StripeSubscriptionRaw[],
	windowStartUnix?: number
): BusinessKpiStat[] {
	const mrrCents = computeMrr(activeSubs);
	const activeCount = activeSubs.length;
	const churnRate = computeChurnRate(activeSubs, canceledSubs, windowStartUnix);
	const arpuCents = computeArpu(mrrCents, activeCount);

	const churnHigh = churnRate >= 3;

	return [
		{
			key: 'mrr',
			labelKey: 'business_kpi_mrr',
			value: formatMrr(mrrCents),
			badgeLabel: '+0%',
			badgeClass: 'bg-[#22c55e]/10 text-[#22c55e]',
			subtext: 'business_kpi_mrrSubtext'
		},
		{
			key: 'activeUsers',
			labelKey: 'business_kpi_activeUsers',
			value: String(activeCount),
			badgeLabel: '+0%',
			badgeClass: 'bg-[#22c55e]/10 text-[#22c55e]',
			subtext: 'business_kpi_activeUsersSubtext'
		},
		{
			key: 'churnRate',
			labelKey: 'business_kpi_churnRate',
			value: `${churnRate.toFixed(1)}%`,
			badgeLabel: `${churnRate.toFixed(1)}%`,
			badgeClass: 'bg-[#ef4444]/10 text-[#ef4444]',
			subtext: 'business_kpi_churnRateSubtext',
			valueClass: churnHigh ? 'text-[#ef4444]' : undefined,
			borderClass: churnHigh ? 'border-[#ef4444]/20' : undefined
		},
		{
			key: 'newSubscriptions',
			labelKey: 'business_kpi_newSubscriptions',
			value: formatArpu(arpuCents),
			badgeLabel: 'ARPU',
			badgeClass: 'bg-[#3b82f6]/10 text-[#3b82f6]',
			subtext: 'business_kpi_newSubscriptionsSubtext'
		}
	];
}

export function mapToPlanRevenue(
	activeSubs: StripeSubscriptionRaw[],
	prices: StripePriceRaw[]
): PlanRevenue[] {
	const priceMap = new Map<string, StripePriceRaw>();
	for (const price of prices) {
		priceMap.set(price.id, price);
	}

	const plans = new Map<
		string,
		{ nickname: string; valueCents: number; count: number; unitAmount: number }
	>();

	for (const sub of activeSubs) {
		for (const item of sub.items.data) {
			const priceId = item.price.id;
			const priceInfo = priceMap.get(priceId);
			const nickname = priceInfo?.nickname ?? priceId;
			const quantity = item.quantity ?? 1;
			const monthly = normalizeToMonthly(
				item.price.unit_amount * quantity,
				item.price.recurring.interval,
				item.price.recurring.interval_count
			);

			const existing = plans.get(priceId);
			if (existing) {
				existing.valueCents += monthly;
				existing.count += 1;
			} else {
				plans.set(priceId, {
					nickname,
					valueCents: monthly,
					count: 1,
					unitAmount: item.price.unit_amount
				});
			}
		}
	}

	const sorted = [...plans.entries()].sort((a, b) => b[1].valueCents - a[1].valueCents);
	const totalCents = sorted.reduce((sum, [, v]) => sum + v.valueCents, 0);

	let paidColorIdx = 0;
	return sorted.map(([priceId, info]) => {
		const percent = totalCents > 0 ? (info.valueCents / totalCents) * 100 : 0;
		const isFree = info.unitAmount === 0;
		const color = isFree ? FREE_COLOR : PLAN_COLORS[paidColorIdx++ % PLAN_COLORS.length];
		const label = `${info.nickname} (${info.count.toLocaleString()})`;

		return {
			id: priceId,
			label,
			value: Math.round(info.valueCents / 100),
			color,
			percent: `${percent.toFixed(1)}%`
		};
	});
}
