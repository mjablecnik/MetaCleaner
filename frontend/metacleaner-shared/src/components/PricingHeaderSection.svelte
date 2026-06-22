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
<div class="hidden md:block text-center mb-10">
	<h1 class="text-4xl md:text-5xl font-bold mb-4">{translate('pricing_title')}</h1>
	<p class="text-text-muted text-lg mb-8">{translate('pricing_subtitle')}</p>
	<BillingToggle {value} {onChange} {translate} />
</div>

<!-- Mobile Pricing Header -->
<div class="md:hidden text-center mb-6 w-full">
	<h1 class="text-3xl font-bold mb-2">{translate('pricing_title')}</h1>
	<p class="text-text-muted text-sm mb-5">{translate('pricing_subtitle')}</p>
	<BillingToggle {value} {onChange} {translate} />
</div>
