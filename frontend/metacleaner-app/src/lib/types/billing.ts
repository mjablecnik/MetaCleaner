export interface SubscriptionStatus {
	plan_id: string;
	status: string;
	billing_period: 'monthly' | 'yearly' | null;
	current_period_end: string | null;
	subscription_credits: number;
	purchased_credits: number;
	credit_balance: number;
}

export interface CheckoutResponse {
	url: string;
	session_id: string;
}
