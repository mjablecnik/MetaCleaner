<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CtaButton from './CtaButton.svelte';

	const { Story } = defineMeta({
		title: 'Elements/CtaButton',
		component: CtaButton,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['primary', 'secondary', 'blue', 'outline']
			}
		},
		args: {
			label: 'Try for Free',
			variant: 'primary',
			icon: 'fa-solid fa-cloud-arrow-up',
			disabled: false,
			fullWidth: false
		}
	});
</script>

<!-- Variant stories -->
<Story name="Primary" args={{ variant: 'primary', icon: 'fa-solid fa-cloud-arrow-up', label: 'Try for Free' }} />
<Story name="Secondary" args={{ variant: 'secondary', icon: 'fa-brands fa-apple', label: 'Download App' }} />
<Story name="Blue" args={{ variant: 'blue', icon: 'fa-solid fa-bolt', label: 'Get Started' }} />
<Story name="Outline" args={{ variant: 'outline', label: 'Contact Sales' }} />

<!-- States -->
<Story name="Disabled" args={{ variant: 'outline', label: 'Coming Soon', disabled: true }} />
<Story name="Full Width Primary" args={{ variant: 'primary', label: 'Try for Free', fullWidth: true }} />
<Story name="Full Width Blue" args={{ variant: 'blue', icon: 'fa-solid fa-bolt', label: 'Get Started', fullWidth: true }} />

<!-- As link -->
<Story name="Link (Primary)" args={{ variant: 'primary', label: 'Try for Free', href: '#' }} />
