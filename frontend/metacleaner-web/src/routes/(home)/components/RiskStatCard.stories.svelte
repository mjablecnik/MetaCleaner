<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RiskStatCard from './RiskStatCard.svelte';

	const statRed = {
		value: '94%',
		icon: 'fa-location-crosshairs',
		color: 'brand-red',
		labelKey: 'home_stat_gps_label',
		labelMobileKey: 'home_stat_gps_label_short'
	};

	const statOrange = {
		value: '200+',
		icon: 'fa-eye',
		color: 'brand-orange',
		labelKey: 'home_stat_fields_label',
		labelMobileKey: 'home_stat_fields_label_short'
	};

	const statBlue = {
		value: '9 z 10',
		valueMobile: '9/10',
		icon: 'fa-users',
		color: 'brand-blue',
		labelKey: 'home_stat_unaware_label',
		labelMobileKey: 'home_stat_unaware_label_short'
	};

	const { Story } = defineMeta({
		title: 'Home/RiskStatCard',
		component: RiskStatCard,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'select' }, options: ['desktop', 'mobile'] }
		},
		args: {
			stat: statRed,
			size: 'desktop'
		}
	});
</script>

<!-- Desktop / Red -->
<Story name="Desktop / Red" args={{ stat: statRed, size: 'desktop' }} />

<!-- Desktop / Orange -->
<Story name="Desktop / Orange" args={{ stat: statOrange, size: 'desktop' }} />

<!-- Desktop / Blue -->
<Story name="Desktop / Blue" args={{ stat: statBlue, size: 'desktop' }} />

<!-- Mobile / Red -->
<Story name="Mobile / Red" args={{ stat: statRed, size: 'mobile' }} />

<!-- Mobile / Orange -->
<Story name="Mobile / Orange" args={{ stat: statOrange, size: 'mobile' }} />

<!-- Mobile / Blue -->
<Story name="Mobile / Blue" args={{ stat: statBlue, size: 'mobile' }} />
