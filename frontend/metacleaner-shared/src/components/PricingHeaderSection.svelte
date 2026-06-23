<script lang="ts">
	import BillingToggle from './BillingToggle.svelte';

	interface Props {
		value: 'monthly' | 'yearly';
		onChange: (value: 'monthly' | 'yearly') => void;
		translate: (key: string) => string;
	}

	const { value, onChange, translate }: Props = $props();
</script>

<!-- Desktop Pricing Header -->
<div class="mb-10 hidden text-center md:block">
	<h1 class="mb-4 text-4xl font-bold md:text-5xl">{translate('pricing_title')}</h1>
	<p class="mb-8 text-lg text-text-muted">{translate('pricing_subtitle')}</p>
	<BillingToggle {value} {onChange} {translate} />
</div>

<!-- Mobile Pricing Header -->
<div class="mb-6 w-full text-center md:hidden">
	<h1 class="mb-2 text-3xl font-bold">{translate('pricing_title')}</h1>
	<p class="mb-5 text-sm text-text-muted">{translate('pricing_subtitle')}</p>
	<BillingToggle {value} {onChange} {translate} />
</div>
