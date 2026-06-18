<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FooterColumn from './FooterColumn.svelte';

	const { Story } = defineMeta({
		title: 'Elements/FooterColumn',
		component: FooterColumn,
		tags: ['autodocs']
	});
</script>

<Story
	name="Product"
	args={{
		heading: 'Product',
		links: [
			{ href: '/features', label: 'Features' },
			{ href: '/#how-it-works', label: 'How it works' },
			{ href: '/pricing', label: 'Pricing' }
		]
	}}
/>

<Story
	name="Company"
	args={{
		heading: 'Company',
		links: [
			{ href: '#', label: 'About' },
			{ href: '/#faq', label: 'FAQ' },
			{ href: '#', label: 'Contact' }
		]
	}}
/>

<Story
	name="Legal"
	args={{
		heading: 'Legal',
		links: [
			{ href: '#', label: 'Privacy Policy' },
			{ href: '#', label: 'Terms of Service' },
			{ href: '#', label: 'GDPR' },
			{ href: '#', label: 'Contact' }
		]
	}}
/>
