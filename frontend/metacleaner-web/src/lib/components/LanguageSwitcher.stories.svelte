<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	const { Story } = defineMeta({
		title: 'Shared/LanguageSwitcher',
		component: LanguageSwitcher,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['desktop', 'mobile']
			}
		}
	});
</script>

<Story name="Desktop" args={{ variant: 'desktop' }} />
<Story name="Mobile" args={{ variant: 'mobile' }} />
