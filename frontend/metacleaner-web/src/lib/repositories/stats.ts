export interface RiskStat {
	value: string;
	valueMobile?: string;
	icon: string;
	color: string;
	labelKey: string;
	labelMobileKey?: string;
}

export function statsRepository(): RiskStat[] {
	return [
		{
			value: '94%',
			icon: 'fa-location-crosshairs',
			color: 'brand-red',
			labelKey: 'home_stat_gps_label',
			labelMobileKey: 'home_stat_gps_label_short'
		},
		{
			value: '200+',
			icon: 'fa-eye',
			color: 'brand-orange',
			labelKey: 'home_stat_fields_label',
			labelMobileKey: 'home_stat_fields_label_short'
		},
		{
			value: '9 z 10',
			valueMobile: '9/10',
			icon: 'fa-users',
			color: 'brand-blue',
			labelKey: 'home_stat_unaware_label',
			labelMobileKey: 'home_stat_unaware_label_short'
		}
	];
}
