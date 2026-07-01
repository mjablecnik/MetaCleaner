<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NotConfiguredCard from './NotConfiguredCard.svelte';

	const { Story } = defineMeta({
		title: 'Components/NotConfiguredCard',
		component: NotConfiguredCard,
		tags: ['autodocs']
	});
</script>

<Story
	name="WithMissingVars"
	args={{
		missingVars: ['FLY_API_TOKEN', 'FLY_ORG']
	}}
/>

<Story
	name="ManyMissingVars"
	args={{
		missingVars: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'CLOUDFLARE_API_TOKEN']
	}}
/>

<Story
	name="EmptyMissingVars"
	args={{
		missingVars: []
	}}
/>
