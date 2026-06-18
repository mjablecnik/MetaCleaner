<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import IconBadge from '$lib/components/elements/IconBadge.svelte';
	import MetadataFieldRow from './MetadataFieldRow.svelte';

	interface Field {
		icon: string;
		labelKey: string;
		value?: string;
	}

	interface Props {
		variant: 'before' | 'after';
		fields: Field[];
	}

	const { variant, fields }: Props = $props();

	const isBefore = $derived(variant === 'before');

	const color = $derived(isBefore ? 'brand-red' : 'brand-green');
	const borderClass = $derived(isBefore ? 'border-brand-red/40' : 'border-brand-green/40');
	const headerIcon = $derived(isBefore ? 'fa-triangle-exclamation' : 'fa-shield-halved');
	const noteIcon = $derived(isBefore ? 'fa-circle-exclamation' : 'fa-circle-check');
	const noteColor = $derived(isBefore ? 'text-brand-red/80' : 'text-brand-green/80');
	const labelColor = $derived(isBefore ? 'text-brand-red' : 'text-brand-green');

	const label = $derived(isBefore ? m.home_why_before_label() : m.home_why_after_label());
	const caption = $derived(isBefore ? m.home_why_before_caption() : m.home_why_after_caption());
	const note = $derived(isBefore ? m.home_why_before_warning() : m.home_why_after_note());
</script>

<div class="bg-navy-card rounded-2xl border {borderClass} p-4 gap-3 md:p-6 md:gap-4 flex flex-col">
	<div class="flex items-center gap-3 md:mb-2">
		<IconBadge icon={headerIcon} {color} size="md" shape="circle" />
		<div>
			<span class="text-xs font-bold uppercase tracking-wider {labelColor}">{label}</span>
			<p class="text-xs md:text-sm font-semibold text-white">{caption}</p>
		</div>
	</div>
	<div class="flex flex-col gap-1.5 md:gap-2">
		{#each fields as field, i (i)}
			<MetadataFieldRow {field} {variant} />
		{/each}
	</div>
	<p class="text-xs {noteColor} flex items-center gap-1.5 md:gap-2 md:mt-1">
		<i class="fa-solid {noteIcon}"></i>
		{note}
	</p>
</div>
