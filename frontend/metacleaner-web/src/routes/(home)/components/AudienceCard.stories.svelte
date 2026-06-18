<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AudienceCard from './AudienceCard.svelte';

	const journalist = {
		id: 'journalists',
		icon: 'fa-newspaper',
		color: 'brand-blue',
		titleKey: 'home_audience_journalists_title',
		descKey: 'home_audience_journalists_desc',
		bulletKeys: ['home_audience_journalists_bullet1', 'home_audience_journalists_bullet2']
	};

	const photographer = {
		id: 'photographers',
		icon: 'fa-camera-retro',
		color: 'brand-orange',
		titleKey: 'home_audience_photographers_title',
		descKey: 'home_audience_photographers_desc',
		bulletKeys: ['home_audience_photographers_bullet1', 'home_audience_photographers_bullet2']
	};

	const { Story } = defineMeta({
		title: 'Home/AudienceCard',
		component: AudienceCard,
		tags: ['autodocs'],
		args: {
			audience: journalist
		}
	});
</script>

<!-- Journalist (blue) -->
<Story name="Journalist" args={{ audience: journalist }} />

<!-- Photographer (orange) -->
<Story name="Photographer" args={{ audience: photographer }} />
