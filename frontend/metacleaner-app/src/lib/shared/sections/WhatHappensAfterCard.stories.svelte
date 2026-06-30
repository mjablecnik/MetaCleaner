<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WhatHappensAfterCard from './WhatHappensAfterCard.svelte';

	const { Story } = defineMeta({
		title: 'Sections/WhatHappensAfterCard',
		component: WhatHappensAfterCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="No Credits Remaining">
	<div class="w-full max-w-2xl">
		<WhatHappensAfterCard periodEndDate="2026-07-28" creditsRemaining={0} />
	</div>
</Story>

<Story name="With Credits Remaining">
	<div class="w-full max-w-2xl">
		<WhatHappensAfterCard periodEndDate="2026-07-28" creditsRemaining={55} />
	</div>
</Story>
