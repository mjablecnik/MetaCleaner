<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { t } from '$lib/i18n';

	interface Field {
		icon: string;
		labelKey: string;
		value?: string;
	}

	interface Props {
		field: Field;
		variant: 'before' | 'after';
	}

	const { field, variant }: Props = $props();

	const isAfter = $derived(variant === 'after');
	const iconColor = $derived(isAfter ? 'text-brand-green' : 'text-brand-red');
</script>

<div
	class="flex items-center justify-between px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-navy-main/60 border border-border"
>
	<span class="text-xs text-text-muted flex items-center gap-1.5 md:gap-2">
		<i class="fa-solid {field.icon} {iconColor}"></i>
		{t(field.labelKey)}
	</span>
	{#if isAfter}
		<span class="text-xs font-mono text-brand-green flex items-center gap-1">
			<i class="fa-solid fa-check"></i>
			{m.home_why_removed()}
		</span>
	{:else}
		<span class="text-xs font-mono text-white">{field.value ?? ''}</span>
	{/if}
</div>
