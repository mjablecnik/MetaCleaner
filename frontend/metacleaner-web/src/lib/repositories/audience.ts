export interface Audience {
	id: string;
	icon: string;
	color: string;
	titleKey: string;
	descKey: string;
	bulletKeys?: string[];
}

export function getAudience(mode: 'full' | 'compact'): Audience[] {
	if (mode === 'compact') {
		return [
			{
				id: 'journalists',
				icon: 'fa-newspaper',
				color: 'brand-blue',
				titleKey: 'home_audience_journalists_title_mobile',
				descKey: 'home_audience_journalists_desc_mobile'
			},
			{
				id: 'photographers',
				icon: 'fa-camera',
				color: 'brand-green',
				titleKey: 'home_audience_photographers_title_mobile',
				descKey: 'home_audience_photographers_desc_mobile'
			},
			{
				id: 'business',
				icon: 'fa-briefcase',
				color: 'brand-orange',
				titleKey: 'home_audience_business_title_mobile',
				descKey: 'home_audience_business_desc_mobile'
			},
			{
				id: 'users',
				icon: 'fa-users',
				color: 'brand-blue',
				titleKey: 'home_audience_users_title_mobile',
				descKey: 'home_audience_users_desc_mobile'
			}
		];
	}

	return [
		{
			id: 'journalists',
			icon: 'fa-newspaper',
			color: 'brand-blue',
			titleKey: 'home_audience_journalists_title',
			descKey: 'home_audience_journalists_desc',
			bulletKeys: ['home_audience_journalists_bullet1', 'home_audience_journalists_bullet2']
		},
		{
			id: 'photographers',
			icon: 'fa-camera-retro',
			color: 'brand-orange',
			titleKey: 'home_audience_photographers_title',
			descKey: 'home_audience_photographers_desc',
			bulletKeys: ['home_audience_photographers_bullet1', 'home_audience_photographers_bullet2']
		},
		{
			id: 'business',
			icon: 'fa-building',
			color: 'brand-green',
			titleKey: 'home_audience_business_title',
			descKey: 'home_audience_business_desc',
			bulletKeys: ['home_audience_business_bullet1', 'home_audience_business_bullet2']
		},
		{
			id: 'users',
			icon: 'fa-user-shield',
			color: 'brand-blue',
			titleKey: 'home_audience_users_title',
			descKey: 'home_audience_users_desc',
			bulletKeys: ['home_audience_users_bullet1', 'home_audience_users_bullet2']
		},
		{
			id: 'researchers',
			icon: 'fa-flask',
			color: 'brand-orange',
			titleKey: 'home_audience_researchers_title',
			descKey: 'home_audience_researchers_desc',
			bulletKeys: ['home_audience_researchers_bullet1', 'home_audience_researchers_bullet2']
		},
		{
			id: 'it',
			icon: 'fa-lock',
			color: 'brand-green',
			titleKey: 'home_audience_it_title',
			descKey: 'home_audience_it_desc',
			bulletKeys: ['home_audience_it_bullet1', 'home_audience_it_bullet2']
		}
	];
}
