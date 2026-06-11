<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthMobileHero from './AuthMobileHero.svelte';

	const { Story } = defineMeta({
		title: 'Auth/AuthMobileHero',
		component: AuthMobileHero,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			},
			viewport: { defaultViewport: 'mobile1' }
		}
	});
</script>

<Story name="Default">
	<div class="w-80 p-4">
		<AuthMobileHero
			headline="Clean your files,"
			highlightedWord="remove"
			afterWord="all metadata"
			description="Protect your privacy by removing hidden metadata from images, documents, and audio files."
			stats={[
				{ value: '50K+', labelKey: 'auth.common.stats.usersLabel' },
				{ value: '2M+', labelKey: 'auth.common.stats.filesCleanedLabel' },
				{ value: '100%', labelKey: 'auth.common.stats.securityLabel' }
			]}
		/>
	</div>
</Story>

<Story name="WithCustomStats">
	<div class="w-80 p-4">
		<AuthMobileHero
			headline="Clean your files,"
			highlightedWord="remove"
			afterWord="all metadata"
			description="Protect your privacy by removing hidden metadata from images, documents, and audio files."
			stats={[
				{ value: '100K+', labelKey: 'auth.common.stats.usersLabel' },
				{ value: '5M+', labelKey: 'auth.common.stats.filesCleanedLabel' },
				{ value: '99.9%', labelKey: 'auth.common.stats.securityLabel' }
			]}
		/>
	</div>
</Story>

<Story name="WithoutStats">
	<div class="w-80 p-4">
		<AuthMobileHero
			headline="Join"
			highlightedWord="50,000+"
			afterWord="privacy-conscious users"
			description="Create a free account and start protecting your files today."
		/>
	</div>
</Story>
