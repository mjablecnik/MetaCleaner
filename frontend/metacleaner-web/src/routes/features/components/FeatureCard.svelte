<script lang="ts">
	import type { Feature } from '$lib/repositories/features';
	import { t } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import IconBadge from '$lib/components/elements/IconBadge.svelte';
	import FormatPill from './FormatPill.svelte';
	import CheckBullet from '$lib/components/elements/CheckBullet.svelte';

	interface Props {
		feature: Feature;
	}

	const { feature }: Props = $props();

	const labelColorMap: Record<string, string> = {
		'brand-blue': 'text-brand-blue',
		'brand-orange': 'text-brand-orange',
		'brand-green': 'text-brand-green',
		'brand-red': 'text-brand-red'
	};

	const labelColor = $derived(labelColorMap[feature.color] ?? 'text-brand-blue');
	const featureNumber = $derived(String(feature.number).padStart(2, '0'));
</script>

<div class="bg-navy-card rounded-2xl border border-border overflow-hidden">
	<div class="w-full flex items-center gap-3 px-4 py-4">
		<div class="flex-shrink-0">
			<IconBadge icon={feature.icon} color={feature.color} size="md" />
		</div>
		<div class="flex-1 min-w-0">
			<div class="text-xs font-bold uppercase tracking-widest {labelColor} mb-0.5">
				{m.feature_label()} {featureNumber}
			</div>
			<div class="text-base font-bold">{feature.titleText}</div>
		</div>
	</div>
	<div class="px-4 pb-5">
		<p class="text-text-muted text-sm leading-relaxed mb-4">{t(feature.descKey)}</p>

		{#if feature.formats}
			<div class="grid grid-cols-2 gap-2">
				{#each feature.formats as fmt}
					<FormatPill format={fmt} size="mobile" />
				{/each}
			</div>
		{:else if feature.bullets}
			<ul class="flex flex-col gap-2.5">
				{#each feature.bullets as bullet}
					<CheckBullet text={t(bullet)} size="xs" />
				{/each}
			</ul>
		{/if}
	</div>
</div>
