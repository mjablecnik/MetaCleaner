export interface SettingsProfile {
	name: string;
	email: string;
	avatarUrl: string;
	plan: string;
	verified: boolean;
	company: string;
	lastLogin: string;
}

export interface AffiliateStats {
	referrals: number;
	conversions: number;
	earnings: string;
	affiliateLink: string;
}

export interface ApiKeyInfo {
	key: string;
	label: string;
	active: boolean;
	createdAt: string;
	lastUsed: string;
}

export function getSettingsProfile(): SettingsProfile {
	return {
		name: 'Jana Nováková',
		email: 'jana.novakova@email.cz',
		avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
		plan: 'pro',
		verified: true,
		company: '',
		lastLogin: 'dnes, 09:41'
	};
}

export function getAffiliateStats(): AffiliateStats {
	return {
		referrals: 7,
		conversions: 3,
		earnings: '€12',
		affiliateLink: 'https://settiq.io/ref/jana-novakova'
	};
}

export function getApiKeys(): { production: ApiKeyInfo; test: ApiKeyInfo } {
	return {
		production: {
			key: 'sk_live_a8f3k2m9x1qw5e7r0tyu6io4p',
			label: 'Production Key',
			active: true,
			createdAt: '15. 4. 2025',
			lastUsed: '2. 6. 2025'
		},
		test: {
			key: 'sk_test_z9d4n7h2s6bv1cx3lm8poq0wr',
			label: 'Test Key',
			active: false,
			createdAt: '',
			lastUsed: ''
		}
	};
}
