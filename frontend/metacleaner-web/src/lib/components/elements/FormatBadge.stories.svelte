<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormatBadge from './FormatBadge.svelte';

	const { Story } = defineMeta({
		title: 'Elements/FormatBadge',
		component: FormatBadge,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['sm', 'xs']
			}
		},
		args: {
			label: 'JPG',
			size: 'sm'
		}
	});
</script>

<!-- Format labels -->
<Story name="JPG" args={{ label: 'JPG', size: 'sm' }} />
<Story name="PNG" args={{ label: 'PNG', size: 'sm' }} />
<Story name="HEIC" args={{ label: 'HEIC', size: 'sm' }} />
<Story name="WEBP" args={{ label: 'WEBP', size: 'sm' }} />

<!-- Size variants -->
<Story name="Small (sm)" args={{ label: 'JPG', size: 'sm' }} />
<Story name="Extra small (xs)" args={{ label: 'JPG', size: 'xs' }} />
