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
