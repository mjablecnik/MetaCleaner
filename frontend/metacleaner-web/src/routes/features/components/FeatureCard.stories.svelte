<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeatureCard from './FeatureCard.svelte';

	const { Story } = defineMeta({
		title: 'Features/FeatureCard',
		component: FeatureCard,
		tags: ['autodocs'],
		args: {
			feature: {
				id: 'exif',
				number: 1,
				icon: 'fa-broom',
				color: 'brand-blue',
				layout: 'ltr',
				titleText: 'EXIF Metadata Removal',
				descKey: 'feature_exif_desc',
				formats: [
					{ icon: 'fa-location-dot', color: 'brand-red', key: 'feature_exif_fmt_gps' },
					{ icon: 'fa-mobile-screen', color: 'brand-orange', key: 'feature_exif_fmt_device' },
					{ icon: 'fa-user', color: 'brand-blue', key: 'feature_exif_fmt_author' },
					{ icon: 'fa-calendar', color: 'brand-green', key: 'feature_exif_fmt_datetime' },
					{ icon: 'fa-code', color: 'text-muted', key: 'feature_exif_fmt_software' },
					{ icon: 'fa-camera', color: 'brand-blue', key: 'feature_exif_fmt_camera' }
				]
			}
		}
	});
</script>

<!-- Card with format pills (brand-blue) -->
<Story
	name="Formats — brand-blue"
	args={{
		feature: {
			id: 'exif',
			number: 1,
			icon: 'fa-broom',
			color: 'brand-blue',
			layout: 'ltr',
			titleText: 'EXIF Metadata Removal',
			descKey: 'feature_exif_desc',
			formats: [
				{ icon: 'fa-location-dot', color: 'brand-red', key: 'feature_exif_fmt_gps' },
				{ icon: 'fa-mobile-screen', color: 'brand-orange', key: 'feature_exif_fmt_device' },
				{ icon: 'fa-user', color: 'brand-blue', key: 'feature_exif_fmt_author' },
				{ icon: 'fa-calendar', color: 'brand-green', key: 'feature_exif_fmt_datetime' },
				{ icon: 'fa-code', color: 'text-muted', key: 'feature_exif_fmt_software' },
				{ icon: 'fa-camera', color: 'brand-blue', key: 'feature_exif_fmt_camera' }
			]
		}
	}}
/>

<!-- Card with bullet list (brand-orange) -->
<Story
	name="Bullets — brand-orange"
	args={{
		feature: {
			id: 'ai',
			number: 2,
			icon: 'fa-robot',
			color: 'brand-orange',
			layout: 'rtl',
			titleText: 'AI Tool Detection',
			descKey: 'feature_ai_desc',
			bullets: [
				'feature_ai_bullet1',
				'feature_ai_bullet2',
				'feature_ai_bullet3',
				'feature_ai_bullet4'
			]
		}
	}}
/>
