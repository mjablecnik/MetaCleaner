<script lang="ts">
	interface Props {
		value: 'monthly' | 'yearly';
		onChange: (value: 'monthly' | 'yearly') => void;
		translate: (key: string) => string;
	}

	const { value, onChange, translate }: Props = $props();

	const isYearly = $derived(value === 'yearly');
</script>

<div class="inline-flex items-center bg-navy-card border border-border rounded-xl p-1 gap-1">
	<button
		onclick={() => onChange('monthly')}
		class="px-5 py-2 rounded-lg text-sm font-semibold transition-all {!isYearly
			? 'bg-brand-blue text-white shadow'
			: 'text-text-muted hover:text-white'}"
	>
		{translate('pricing_billing_monthly')}
	</button>
	<button
		onclick={() => onChange('yearly')}
		class="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 {isYearly
			? 'bg-brand-blue text-white shadow'
			: 'text-text-muted hover:text-white'}"
	>
		{translate('pricing_billing_yearly')}<span
			class="bg-brand-green text-white text-xs font-bold px-2 py-0.5 rounded-full">−20%</span
		>
	</button>
</div>
