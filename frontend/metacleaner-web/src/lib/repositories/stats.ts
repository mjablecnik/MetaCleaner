export interface RiskStat {
	value: string;
	icon: string;
	color: string;
	labelKey: string;
}

export function statsRepository(): RiskStat[] {
	return [
		{
			value: '94%',
			icon: 'fa-location-crosshairs',
			color: 'brand-red',
			labelKey: 'home_stat_gps_label'
		},
		{
			value: '200+',
			icon: 'fa-eye',
			color: 'brand-orange',
			labelKey: 'home_stat_fields_label'
		},
		{
			value: '9 z 10',
			icon: 'fa-users',
			color: 'brand-blue',
			labelKey: 'home_stat_unaware_label'
		}
	];
}
