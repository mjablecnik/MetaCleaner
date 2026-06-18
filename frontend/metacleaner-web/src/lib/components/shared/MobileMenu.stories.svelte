<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MobileMenu from './MobileMenu.svelte';

	const { Story } = defineMeta({
		title: 'Shared/MobileMenu',
		component: MobileMenu,
		tags: ['autodocs'],
		argTypes: {
			variant: { control: { type: 'select' }, options: ['drawer', 'dropdown'] },
			active: {
				control: { type: 'select' },
				options: ['home', 'features', 'pricing', 'faq']
			},
			open: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Drawer Open" args={{ variant: 'drawer', active: 'home', open: true, onClose: () => {} }} />
<Story name="Dropdown Open — Features" args={{ variant: 'dropdown', active: 'features', open: true, onClose: () => {} }} />
<Story name="Dropdown Open — Pricing" args={{ variant: 'dropdown', active: 'pricing', open: true, onClose: () => {} }} />
<Story name="Dropdown Closed" args={{ variant: 'dropdown', active: 'features', open: false, onClose: () => {} }} />
