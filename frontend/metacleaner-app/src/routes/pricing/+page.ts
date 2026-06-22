import { guardProtectedRoute } from '$lib/auth/auth-guard.js';

export async function load({ url }) {
	const plan = url.searchParams.get('plan');
	const billing = url.searchParams.get('billing') ?? 'monthly';

	const returnTo = plan
		? `/pricing?plan=${encodeURIComponent(plan)}&billing=${encodeURIComponent(billing)}`
		: '/pricing';

	await guardProtectedRoute(returnTo);

	return { plan, billing: billing as 'monthly' | 'yearly' };
}
