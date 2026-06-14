<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ActionCard from './ActionCard.svelte';

	const { Story } = defineMeta({
		title: 'EmailVerified/ActionCard',
		component: ActionCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="CleanAction">
	<div class="p-8">
		<ActionCard
			icon="fa-solid fa-broom"
			iconColorClass="text-brand-green"
			bgClass="bg-brand-green-10"
			title="Start Cleaning Now"
			description="Remove hidden metadata from your files instantly"
			href="/"
			variant="highlighted"
		/>
	</div>
</Story>

<Story name="ProUpgradeAction">
	<div class="p-8">
		<ActionCard
			icon="fa-solid fa-crown"
			iconColorClass="text-brand-orange"
			bgClass="bg-brand-orange-10"
			badgeBgClass="bg-brand-orange-15"
			title="Upgrade to Pro"
			description="Unlimited files, batch processing, and priority support"
			badge="PRO"
		/>
	</div>
</Story>
