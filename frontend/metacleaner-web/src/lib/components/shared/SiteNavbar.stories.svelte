<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SiteNavbar from './SiteNavbar.svelte';

	const { Story } = defineMeta({
		title: 'Shared/SiteNavbar',
		component: SiteNavbar,
		tags: ['autodocs'],
		argTypes: {
			active: {
				control: { type: 'select' },
				options: ['home', 'features', 'pricing', 'faq']
			}
		}
	});
</script>

<Story name="Home Active" args={{ active: 'home' }} />
<Story name="Features Active" args={{ active: 'features' }} />
<Story name="Pricing Active" args={{ active: 'pricing' }} />
