<script lang="ts">
	import type { Feature } from '$lib/repositories/features';
	import { t } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import IconBadge from '$lib/components/elements/IconBadge.svelte';
	import FormatPill from './FormatPill.svelte';
	import CheckBullet from '$lib/components/elements/CheckBullet.svelte';
	import ExifIllustration from './ExifIllustration.svelte';
	import C2paIllustration from './C2paIllustration.svelte';

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
	const formatsGridClass = $derived(
		feature.formats && feature.formats.length === 4
			? 'grid grid-cols-2 sm:grid-cols-4 gap-3'
			: 'grid grid-cols-2 sm:grid-cols-3 gap-3'
	);
</script>

<section id="feature-{feature.id}" class="w-full">
	<div
		class="flex flex-col {feature.layout === 'rtl'
			? 'lg:flex-row-reverse'
			: 'lg:flex-row'} gap-10 items-center"
	>
		<!-- Content -->
		<div class="flex flex-col gap-6 flex-1">
			<div class="inline-flex items-center gap-2 w-fit">
				<IconBadge icon={feature.icon} color={feature.color} size="lg" />
				<span class="text-xs font-bold uppercase tracking-widest {labelColor}">
					{m.feature_label()}
					{featureNumber}
				</span>
			</div>
			<h2 class="text-4xl font-bold leading-tight">{feature.titleText}</h2>
			<p class="text-text-muted leading-relaxed max-w-2xl">{t(feature.descKey)}</p>

			{#if feature.formats}
				<div class={formatsGridClass}>
					{#each feature.formats as fmt (fmt)}
						<FormatPill format={fmt} size="desktop" />
					{/each}
				</div>
			{:else if feature.bullets}
				<ul class="flex flex-col gap-3">
					{#each feature.bullets as bullet (bullet)}
						<CheckBullet text={t(bullet)} />
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Visual -->
		<div class="hidden lg:flex flex-shrink-0 w-full lg:w-72 h-64 items-center justify-center">
			{#if feature.image}
				<img
					class="w-full h-full object-contain"
					src={feature.image.src}
					alt={t(feature.image.altKey)}
				/>
			{:else if feature.id === 'exif'}
				<ExifIllustration />
			{:else if feature.id === 'c2pa'}
				<C2paIllustration />
			{/if}
		</div>
	</div>
</section>
