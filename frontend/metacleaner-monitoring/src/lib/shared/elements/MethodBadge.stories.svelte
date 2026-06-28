<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MethodBadge from './MethodBadge.svelte';

	const { Story } = defineMeta({
		title: 'Elements/MethodBadge',
		component: MethodBadge,
		tags: ['autodocs'],
		argTypes: {
			method: {
				control: 'select',
				options: ['GET', 'POST', 'PUT', 'DELETE']
			}
		}
	});
</script>

<Story name="GET" args={{ method: 'GET' }} />

<Story name="POST" args={{ method: 'POST' }} />

<Story name="PUT" args={{ method: 'PUT' }} />

<Story name="DELETE" args={{ method: 'DELETE' }} />
