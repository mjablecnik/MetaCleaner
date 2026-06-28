<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TopCustomerRow from './TopCustomerRow.svelte';

	const { Story } = defineMeta({
		title: 'Business/TopCustomerRow',
		component: TopCustomerRow,
		tags: ['autodocs']
	});
</script>

<Story
	name="Enterprise Customer"
	args={{
		name: 'Acme Corp',
		plan: 'Enterprise',
		mrr: '$2,800',
		avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg'
	}}
/>

<Story
	name="Business Customer"
	args={{
		name: 'DataFlow GmbH',
		plan: 'Business',
		mrr: '$1,200',
		avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
	}}
/>

<Story
	name="Pro Customer"
	args={{
		name: 'Sparkly Media',
		plan: 'Pro',
		mrr: '$750',
		avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg'
	}}
/>
