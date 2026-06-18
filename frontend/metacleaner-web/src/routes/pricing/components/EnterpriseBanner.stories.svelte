<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EnterpriseBanner from './EnterpriseBanner.svelte';

	const enterprise = {
		titleKey: 'pricing_enterprise_title',
		descKey: 'pricing_enterprise_desc',
		ctaKey: 'pricing_cta_contact'
	};

	const { Story } = defineMeta({
		title: 'Pricing/EnterpriseBanner',
		component: EnterpriseBanner,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['desktop', 'mobile'] }
		},
		args: {
			enterprise,
			size: 'desktop'
		}
	});
</script>

<!-- Desktop -->
<Story name="Desktop" args={{ enterprise, size: 'desktop' }} />

<!-- Mobile -->
<Story name="Mobile" args={{ enterprise, size: 'mobile' }} />
