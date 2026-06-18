<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StepCard from './StepCard.svelte';

	const step1 = {
		number: '01',
		icon: 'fa-upload',
		titleKey: 'home_step1_title',
		descKey: 'home_step1_desc',
		descMobileKey: 'home_step1_desc_mobile'
	};

	const step2 = {
		number: '02',
		icon: 'fa-clipboard',
		titleKey: 'home_step2_title',
		descKey: 'home_step2_desc',
		descMobileKey: 'home_step2_desc_mobile'
	};

	const step3 = {
		number: '03',
		icon: 'fa-download',
		titleKey: 'home_step3_title',
		descKey: 'home_step3_desc'
	};

	const { Story } = defineMeta({
		title: 'Home/StepCard',
		component: StepCard,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'select' }, options: ['desktop', 'mobile'] }
		},
		args: {
			step: step1,
			size: 'desktop'
		}
	});
</script>

<!-- Desktop / Step 1 -->
<Story name="Desktop / Step 1" args={{ step: step1, size: 'desktop' }} />

<!-- Desktop / Step 2 -->
<Story name="Desktop / Step 2" args={{ step: step2, size: 'desktop' }} />

<!-- Desktop / Step 3 -->
<Story name="Desktop / Step 3" args={{ step: step3, size: 'desktop' }} />

<!-- Mobile / Step 1 -->
<Story name="Mobile / Step 1" args={{ step: step1, size: 'mobile' }} />

<!-- Mobile / Step 2 -->
<Story name="Mobile / Step 2" args={{ step: step2, size: 'mobile' }} />

<!-- Mobile / Step 3 (no mobile desc) -->
<Story name="Mobile / Step 3" args={{ step: step3, size: 'mobile' }} />
