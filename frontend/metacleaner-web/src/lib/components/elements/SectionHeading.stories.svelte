<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SectionHeading from './SectionHeading.svelte';

	const { Story } = defineMeta({
		title: 'Elements/SectionHeading',
		component: SectionHeading,
		tags: ['autodocs'],
		argTypes: {
			eyebrowColor: {
				control: { type: 'select' },
				options: ['brand-green', 'brand-blue', 'brand-orange', 'brand-red']
			},
			size: {
				control: { type: 'select' },
				options: ['lg', 'sm']
			}
		},
		args: {
			title: 'Why Privacy Matters',
			eyebrow: 'Your Privacy',
			eyebrowColor: 'brand-green',
			subtitle: 'Every photo you share contains hidden metadata that reveals more than you think.',
			size: 'lg'
		}
	});
</script>

<!-- Size variants -->
<Story
	name="Large with Eyebrow"
	args={{ size: 'lg', eyebrow: 'Your Privacy', eyebrowColor: 'brand-green' }}
/>
<Story
	name="Small with Eyebrow"
	args={{ size: 'sm', eyebrow: 'Your Privacy', eyebrowColor: 'brand-green' }}
/>

<!-- Eyebrow color variants -->
<Story
	name="Blue Eyebrow"
	args={{ size: 'lg', eyebrow: 'Features', eyebrowColor: 'brand-blue' }}
/>
<Story
	name="Orange Eyebrow"
	args={{ size: 'lg', eyebrow: 'How It Works', eyebrowColor: 'brand-orange' }}
/>

<!-- Optional fields -->
<Story name="No Eyebrow" args={{ eyebrow: undefined }} />
<Story name="No Subtitle" args={{ subtitle: undefined }} />
