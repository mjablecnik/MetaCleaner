<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthFeatureCard from './AuthFeatureCard.svelte';

	const { Story } = defineMeta({
		title: 'Auth/AuthFeatureCard',
		component: AuthFeatureCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="WithBadge">
	<div class="w-96 p-4">
		<AuthFeatureCard
			icon="fa-solid fa-lock"
			iconClass="text-brand-blue"
			iconBgClass="bg-brand-blue/15"
			title="End-to-end encryption"
			desc="Your files are protected with military-grade encryption"
			badge="AES-256"
			badgeClass="bg-brand-blue/10 text-brand-blue"
		/>
	</div>
</Story>

<Story name="WithFormatChips">
	<div class="w-96 p-4">
		<AuthFeatureCard
			icon="fa-solid fa-file-image"
			iconClass="text-brand-orange"
			iconBgClass="bg-brand-orange/15"
			title="All popular formats"
			desc="Supports images, documents, and audio files"
			chips={['JPG', 'PNG', 'PDF']}
		/>
	</div>
</Story>

<Story name="Default">
	<div class="w-96 p-4">
		<AuthFeatureCard
			icon="fa-solid fa-bolt"
			iconClass="text-brand-green"
			iconBgClass="bg-brand-green/15"
			title="Lightning fast processing"
			desc="Clean metadata from hundreds of files in seconds"
		/>
	</div>
</Story>
