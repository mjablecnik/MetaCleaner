import { buildApiUrl } from './api-config.js';
import { authStore } from '$lib/auth/auth.svelte.js';
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
		const res = await fetch(buildApiUrl('/api/billing/checkout'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authStore.accessToken}`
			},
			body: JSON.stringify({ plan_id: planId, billing_period: billing })
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<CheckoutResponse>;
	},

	async getSubscription(): Promise<SubscriptionStatus> {
		const res = await fetch(buildApiUrl('/api/billing/subscription'), {
			headers: { Authorization: `Bearer ${authStore.accessToken}` }
		});
		if (!res.ok) throw new Error(await res.text());
		return res.json() as Promise<SubscriptionStatus>;
	},

	async changePlan(
		planId: string,
		billingPeriod: 'monthly' | 'yearly'
	): Promise<ChangePlanResponse> {
		const res = await fetch(buildApiUrl('/api/billing/change-plan'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authStore.accessToken}`
			},
			body: JSON.stringify({ plan_id: planId, billing_period: billingPeriod })
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<ChangePlanResponse>;
	},

	async cancelSubscription(): Promise<CancelResponse> {
		const res = await fetch(buildApiUrl('/api/billing/cancel'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authStore.accessToken}`
			}
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<CancelResponse>;
	},

	async reactivateSubscription(): Promise<ReactivateResponse> {
		const res = await fetch(buildApiUrl('/api/billing/reactivate'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authStore.accessToken}`
			}
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<ReactivateResponse>;
	},

	async cancelDowngrade(): Promise<CancelDowngradeResponse> {
		const res = await fetch(buildApiUrl('/api/billing/cancel-downgrade'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authStore.accessToken}`
			}
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error((body as { message?: string }).message || res.statusText);
		}
		return res.json() as Promise<CancelDowngradeResponse>;
	}
};
