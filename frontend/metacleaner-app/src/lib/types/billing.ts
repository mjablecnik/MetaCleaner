export interface SubscriptionStatus {
	plan_id: string;
	status: string;
	billing_period: 'monthly' | 'yearly' | null;
	current_period_end: string | null;
	subscription_credits: number;
	purchased_credits: number;
	total_credits: number;
}

export interface CheckoutResponse {
	url: string;
	session_id: string;
}

export interface ChangePlanResponse {
	plan_id: string;
	billing_period: 'monthly' | 'yearly';
	status: string;
	current_period_end: string;
	prorated_amount?: number;
	scheduled_change_date?: string;
}

export interface CancelResponse {
	current_period_end: string;
}

export interface ReactivateResponse {
	plan_id: string;
	status: string;
	current_period_end: string;
}
