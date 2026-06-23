<script lang="ts">
	interface Props {
		value: 'monthly' | 'yearly';
		onChange: (value: 'monthly' | 'yearly') => void;
		translate: (key: string) => string;
	}

	const { value, onChange, translate }: Props = $props();

	const isYearly = $derived(value === 'yearly');
</script>

<div class="inline-flex items-center gap-1 rounded-xl border border-gray-800 bg-navy-card p-1">
	<button
		onclick={() => onChange('monthly')}
		class="rounded-lg px-5 py-2 text-sm font-semibold transition-all {!isYearly
			? 'bg-brand-blue text-white shadow'
			: 'text-text-muted hover:text-white'}"
	>
		<span>{translate('pricing_billing_monthly')}</span>
	</button>
	<button
		onclick={() => onChange('yearly')}
		class="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all {isYearly
			? 'bg-brand-blue text-white shadow'
			: 'text-text-muted hover:text-white'}"
	>
		<span>{translate('pricing_billing_yearly')}</span>
		<span class="rounded-full bg-brand-green px-2 py-0.5 text-xs font-bold text-white">−20%</span>
	</button>
</div>
