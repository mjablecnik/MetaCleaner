<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthBranding from './AuthBranding.svelte';
	import AuthFeatureCard from './AuthFeatureCard.svelte';

	const { Story } = defineMeta({
		title: 'Auth/AuthBranding',
		component: AuthBranding,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="LoginBranding">
	<div class="w-[480px] p-8">
		<AuthBranding
			headline="Clean your files,"
			highlightedWord="remove"
			afterWord="all metadata"
			description="Protect your privacy by removing hidden metadata from images, documents, and audio files in seconds."
			stats={[
				{ value: '50K+', labelKey: 'auth.common.stats.usersLabel' },
				{ value: '2M+', labelKey: 'auth.common.stats.filesCleanedLabel' },
				{ value: '100%', labelKey: 'auth.common.stats.securityLabel' }
			]}
		>
			<div class="flex flex-col gap-3">
				<AuthFeatureCard
					icon="fa-solid fa-lock"
					iconClass="text-brand-blue"
					iconBgClass="bg-brand-blue/15"
					title="End-to-end encryption"
					desc="Your files are protected with military-grade encryption"
					badge="AES-256"
					badgeClass="bg-brand-blue/10 text-brand-blue"
				/>
				<AuthFeatureCard
					icon="fa-solid fa-bolt"
					iconClass="text-brand-green"
					iconBgClass="bg-brand-green/15"
					title="Lightning fast processing"
					desc="Clean metadata from hundreds of files in seconds"
					badge="Instant"
					badgeClass="bg-brand-green/10 text-brand-green"
				/>
				<AuthFeatureCard
					icon="fa-solid fa-file-image"
					iconClass="text-brand-orange"
					iconBgClass="bg-brand-orange/15"
					title="All popular formats"
					desc="Supports images, documents, and audio files"
					chips={['JPG', 'PNG', 'PDF']}
				/>
			</div>
		</AuthBranding>
	</div>
</Story>

<Story name="RegisterBranding">
	<div class="w-[480px] p-8">
		<AuthBranding
			headline="Join"
			highlightedWord="50,000+"
			afterWord="privacy-conscious users"
			description="Create a free account and start protecting your files today. No credit card required."
			badge={{ icon: 'fa-solid fa-circle-check', text: 'Free forever' }}
			stats={[
				{ value: '50K+', labelKey: 'auth.common.stats.usersLabel' },
				{ value: '2M+', labelKey: 'auth.common.stats.filesCleanedLabel' },
				{ value: '100%', labelKey: 'auth.common.stats.securityLabel' }
			]}
			statsBordered
			topPadding
		/>
	</div>
</Story>
