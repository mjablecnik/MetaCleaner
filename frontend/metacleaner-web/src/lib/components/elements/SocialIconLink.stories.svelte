<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SocialIconLink from './SocialIconLink.svelte';

	const { Story } = defineMeta({
		title: 'Elements/SocialIconLink',
		component: SocialIconLink,
		tags: ['autodocs'],
		args: {
			icon: 'fa-brands fa-twitter',
			href: '#'
		}
	});
</script>

<Story name="Twitter" args={{ icon: 'fa-brands fa-twitter', href: '#' }} />
<Story name="GitHub" args={{ icon: 'fa-brands fa-github', href: '#' }} />
<Story name="LinkedIn" args={{ icon: 'fa-brands fa-linkedin', href: '#' }} />
