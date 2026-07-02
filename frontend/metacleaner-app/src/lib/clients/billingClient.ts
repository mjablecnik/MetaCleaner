import { apiFetch } from '$lib/auth/api-client.js';
import type {
	CancelDowngradeResponse,
	CancelResponse,
	ChangePlanResponse,
	CheckoutResponse,
	ReactivateResponse,
	SubscriptionStatus
} from '$lib/types/billing.js';

export const billingClient = {
	async createCheckoutSession(
		planId: string,
		billing: 'monthly' | 'yearly'
	): Promise<CheckoutResponse> {
		const res = await apiFetch('/api/billing/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ plan_id: planId, billing_period: billing })
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<CheckoutResponse>;
	},

	async getSubscription(): Promise<SubscriptionStatus> {
		const res = await apiFetch('/api/billing/subscription');
		if (!res.ok) throw new Error(await res.text());
		return res.json() as Promise<SubscriptionStatus>;
	},

	async changePlan(
		planId: string,
		billingPeriod: 'monthly' | 'yearly'
	): Promise<ChangePlanResponse> {
		const res = await apiFetch('/api/billing/change-plan', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ plan_id: planId, billing_period: billingPeriod })
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<ChangePlanResponse>;
	},

	async cancelSubscription(): Promise<CancelResponse> {
		const res = await apiFetch('/api/billing/cancel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<CancelResponse>;
	},

	async reactivateSubscription(): Promise<ReactivateResponse> {
		const res = await apiFetch('/api/billing/reactivate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<ReactivateResponse>;
	},

	async cancelDowngrade(): Promise<CancelDowngradeResponse> {
		const res = await apiFetch('/api/billing/cancel-downgrade', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<CancelDowngradeResponse>;
	}
};
