<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MethodBadge from './MethodBadge.svelte';

	const { Story } = defineMeta({
		title: 'Elements/MethodBadge',
		component: MethodBadge,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="GET (md)">
	<MethodBadge method="GET" />
</Story>

<Story name="POST (md)">
	<MethodBadge method="POST" />
</Story>

<Story name="DEL (md)">
	<MethodBadge method="DEL" />
</Story>

<Story name="PATCH (md)">
	<MethodBadge method="PATCH" />
</Story>

<Story name="PUT (md)">
	<MethodBadge method="PUT" />
</Story>

<Story name="WS (md)">
	<MethodBadge method="WS" />
</Story>

<Story name="GET (sm)">
	<MethodBadge method="GET" size="sm" />
</Story>

<Story name="POST (sm)">
	<MethodBadge method="POST" size="sm" />
</Story>

<Story name="DEL (sm)">
	<MethodBadge method="DEL" size="sm" />
</Story>

<Story name="PATCH (sm)">
	<MethodBadge method="PATCH" size="sm" />
</Story>

<Story name="PUT (sm)">
	<MethodBadge method="PUT" size="sm" />
</Story>

<Story name="WS (sm)">
	<MethodBadge method="WS" size="sm" />
</Story>

<Story name="All Methods (md)">
	<div class="flex flex-wrap gap-2">
		<MethodBadge method="GET" />
		<MethodBadge method="POST" />
		<MethodBadge method="DEL" />
		<MethodBadge method="PATCH" />
		<MethodBadge method="PUT" />
		<MethodBadge method="WS" />
	</div>
</Story>

<Story name="All Methods (sm)">
	<div class="flex flex-wrap gap-2">
		<MethodBadge method="GET" size="sm" />
		<MethodBadge method="POST" size="sm" />
		<MethodBadge method="DEL" size="sm" />
		<MethodBadge method="PATCH" size="sm" />
		<MethodBadge method="PUT" size="sm" />
		<MethodBadge method="WS" size="sm" />
	</div>
</Story>
