export interface Step {
	number: string;
	icon: string;
	titleKey: string;
	descKey: string;
	descMobileKey?: string;
}

export function stepsRepository(): Step[] {
	return [
		{
			number: '01',
			icon: 'fa-upload',
			titleKey: 'home_step1_title',
			descKey: 'home_step1_desc',
			descMobileKey: 'home_step1_desc_mobile'
		},
		{
			number: '02',
			icon: 'fa-clipboard',
			titleKey: 'home_step2_title',
			descKey: 'home_step2_desc',
			descMobileKey: 'home_step2_desc_mobile'
		},
		{
			number: '03',
			icon: 'fa-download',
			titleKey: 'home_step3_title',
			descKey: 'home_step3_desc'
		}
	];
}
