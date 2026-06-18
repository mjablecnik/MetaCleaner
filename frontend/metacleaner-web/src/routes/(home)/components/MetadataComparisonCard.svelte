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
		size?: 'desktop' | 'mobile';
	}

	const { variant, fields, size = 'desktop' }: Props = $props();

	const isMobile = $derived(size === 'mobile');
	const isBefore = $derived(variant === 'before');

	const color = $derived(isBefore ? 'brand-red' : 'brand-green');
	const borderClass = $derived(isBefore ? 'border-brand-red/40' : 'border-brand-green/40');
	const cardPadding = $derived(isMobile ? 'p-4 gap-3' : 'p-6 gap-4');
	const fieldsGap = $derived(isMobile ? 'gap-1.5' : 'gap-2');
	const badgeSize = $derived(isMobile ? 'sm' : 'md') as 'sm' | 'md';
	const headerIcon = $derived(isBefore ? 'fa-triangle-exclamation' : 'fa-shield-halved');
	const noteIcon = $derived(isBefore ? 'fa-circle-exclamation' : 'fa-circle-check');
	const noteIconSize = $derived(isMobile ? 'text-[10px]' : '');
	const noteGap = $derived(isMobile ? 'gap-1.5' : 'gap-2');
	const noteMt = $derived(isMobile ? '' : 'mt-1');
	const noteColor = $derived(isBefore ? 'text-brand-red/80' : 'text-brand-green/80');
	const labelSize = $derived(isMobile ? 'text-[10px] block' : 'text-xs');
	const captionSize = $derived(isMobile ? 'text-xs' : 'text-sm');
	const labelColor = $derived(isBefore ? 'text-brand-red' : 'text-brand-green');
	const headerMb = $derived(isMobile ? '' : 'mb-2');

	const label = $derived(isBefore ? m.home_why_before_label() : m.home_why_after_label());
	const caption = $derived(isBefore ? m.home_why_before_caption() : m.home_why_after_caption());
	const note = $derived(isBefore ? m.home_why_before_warning() : m.home_why_after_note());
</script>

<div class="bg-navy-card rounded-2xl border {borderClass} {cardPadding} flex flex-col">
	<div class="flex items-center gap-3 {headerMb}">
		<IconBadge icon={headerIcon} {color} size={badgeSize} shape="circle" />
		<div>
			<span class="{labelSize} font-bold uppercase tracking-wider {labelColor}">{label}</span>
			<p class="{captionSize} font-semibold text-white">{caption}</p>
		</div>
	</div>
	<div class="flex flex-col {fieldsGap}">
		{#each fields as field, i (i)}
			<MetadataFieldRow {field} {variant} {size} />
		{/each}
	</div>
	<p class="text-xs {noteColor} flex items-center {noteGap} {noteMt}">
		<i class="fa-solid {noteIcon} {noteIconSize}"></i>
		{note}
	</p>
</div>
