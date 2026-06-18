<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AudienceCard from './AudienceCard.svelte';

	const journalistFull = {
		id: 'journalists',
		icon: 'fa-newspaper',
		color: 'brand-blue',
		titleKey: 'home_audience_journalists_title',
		descKey: 'home_audience_journalists_desc',
		bulletKeys: ['home_audience_journalists_bullet1', 'home_audience_journalists_bullet2']
	};

	const photographerFull = {
		id: 'photographers',
		icon: 'fa-camera-retro',
		color: 'brand-orange',
		titleKey: 'home_audience_photographers_title',
		descKey: 'home_audience_photographers_desc',
		bulletKeys: ['home_audience_photographers_bullet1', 'home_audience_photographers_bullet2']
	};

	const journalistCompact = {
		id: 'journalists',
		icon: 'fa-newspaper',
		color: 'brand-blue',
		titleKey: 'home_audience_journalists_title_mobile',
		descKey: 'home_audience_journalists_desc_mobile'
	};

	const photographerCompact = {
		id: 'photographers',
		icon: 'fa-camera',
		color: 'brand-green',
		titleKey: 'home_audience_photographers_title_mobile',
		descKey: 'home_audience_photographers_desc_mobile'
	};

	const { Story } = defineMeta({
		title: 'Home/AudienceCard',
		component: AudienceCard,
		tags: ['autodocs'],
		argTypes: {
			compact: { control: 'boolean' }
		},
		args: {
			audience: journalistFull,
			compact: false
		}
	});
</script>

<!-- Full / Journalist (blue) -->
<Story name="Full / Journalist" args={{ audience: journalistFull, compact: false }} />

<!-- Full / Photographer (orange) -->
<Story name="Full / Photographer" args={{ audience: photographerFull, compact: false }} />

<!-- Compact / Journalist (blue) -->
<Story name="Compact / Journalist" args={{ audience: journalistCompact, compact: true }} />

<!-- Compact / Photographer (green) -->
<Story name="Compact / Photographer" args={{ audience: photographerCompact, compact: true }} />
