<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BrandLogo from './BrandLogo.svelte';

	const { Story } = defineMeta({
		title: 'Elements/BrandLogo',
		component: BrandLogo,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg']
			}
		}
	});
</script>

<Story name="Small" args={{ size: 'sm' }} />
<Story name="Medium" args={{ size: 'md' }} />
<Story name="Large" args={{ size: 'lg' }} />
