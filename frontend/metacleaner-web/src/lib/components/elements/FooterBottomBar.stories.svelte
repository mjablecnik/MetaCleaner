<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FooterBottomBar from './FooterBottomBar.svelte';

	const { Story } = defineMeta({
		title: 'Elements/FooterBottomBar',
		component: FooterBottomBar,
		tags: ['autodocs']
	});
</script>

<Story
	name="WithLinks"
	args={{
		copyright: '© 2024 MetaCleaner. All rights reserved.',
		links: [
			{ href: '#', label: 'Privacy Policy' },
			{ href: '#', label: 'Terms of Service' },
			{ href: '#', label: 'Cookies' }
		]
	}}
/>

<Story
	name="WithMadeWith"
	args={{
		copyright: '© 2024 MetaCleaner. All rights reserved.',
		madeWith: true
	}}
/>
