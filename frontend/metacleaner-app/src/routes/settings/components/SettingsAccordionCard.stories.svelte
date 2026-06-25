<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SettingsAccordionCard from './SettingsAccordionCard.svelte';

	const { Story } = defineMeta({
		title: 'Settings/SettingsAccordionCard',
		component: SettingsAccordionCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Open (Blue)">
	<SettingsAccordionCard
		icon="fa-solid fa-circle-user"
		colorVariant="blue"
		title="Account Information"
		subtitle="Manage your personal details"
		defaultOpen={true}
	>
		<p class="text-sm text-text-muted">Content visible when open.</p>
	</SettingsAccordionCard>
</Story>

<Story name="Closed (Blue)">
	<SettingsAccordionCard
		icon="fa-solid fa-circle-user"
		colorVariant="blue"
		title="Account Information"
		subtitle="Manage your personal details"
		defaultOpen={false}
	>
		<p class="text-sm text-text-muted">Content hidden when closed on mobile.</p>
	</SettingsAccordionCard>
</Story>

<Story name="Open (Green)">
	<SettingsAccordionCard
		icon="fa-solid fa-code"
		colorVariant="green"
		title="API Keys"
		subtitle="Your production and sandbox keys"
		defaultOpen={true}
	>
		<p class="text-sm text-text-muted">API key content here.</p>
	</SettingsAccordionCard>
</Story>

<Story name="Open with Badge (Orange)">
	<SettingsAccordionCard
		icon="fa-solid fa-users"
		colorVariant="orange"
		title="Affiliate Program"
		subtitle="Earn commissions by referring customers"
		badge="Active"
		defaultOpen={true}
	>
		<p class="text-sm text-text-muted">Affiliate content here.</p>
	</SettingsAccordionCard>
</Story>

<Story name="Desktop Always Open">
	<div class="lg:grid lg:grid-cols-2 lg:gap-6">
		<SettingsAccordionCard
			icon="fa-solid fa-lock"
			colorVariant="blue"
			title="Change Password"
			subtitle="Update your security credentials"
			defaultOpen={false}
		>
			<p class="text-sm text-text-muted">
				On desktop this content is always visible regardless of the closed state.
			</p>
		</SettingsAccordionCard>
	</div>
</Story>
