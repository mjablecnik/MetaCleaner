<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SectionErrorCard from './SectionErrorCard.svelte';

	const { Story } = defineMeta({
		title: 'Components/SectionErrorCard',
		component: SectionErrorCard,
		tags: ['autodocs']
	});
</script>

<Story
	name="Timeout"
	args={{
		category: 'timeout',
		onretry: () => {}
	}}
/>

<Story
	name="TimeoutWithMessage"
	args={{
		category: 'timeout',
		message: 'Request timed out after 30 000 ms. The upstream service may be overloaded.',
		onretry: () => {}
	}}
/>

<Story
	name="Unauthorized"
	args={{
		category: 'unauthorized',
		onretry: () => {}
	}}
/>

<Story
	name="UnauthorizedWithMessage"
	args={{
		category: 'unauthorized',
		message: '401 Unauthorized — check your API token.',
		onretry: () => {}
	}}
/>

<Story
	name="ServiceUnavailable"
	args={{
		category: 'service_unavailable',
		onretry: () => {}
	}}
/>

<Story
	name="RequestError"
	args={{
		category: 'request_error',
		onretry: () => {}
	}}
/>

<Story
	name="RequestErrorWithMessage"
	args={{
		category: 'request_error',
		message: 'HTTP 500 — Internal Server Error from /api/metrics.',
		onretry: () => {}
	}}
/>
