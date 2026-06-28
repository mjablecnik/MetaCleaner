<script lang="ts">
	import { t } from '$lib/i18n';
	import UptimeTimeline from '../components/UptimeTimeline.svelte';
	import type { ServiceCard } from '$lib/repositories/availabilityRepository';

	let { services }: { services: ServiceCard[] } = $props();

	const serviceCards = $derived(services);
	let utOpen = $state(true);
</script>

<!-- Desktop Timeline -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex items-center justify-between gap-3 mb-6">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('availability_timeline_title')}</h3>
			<p class="text-xs text-textSec mt-1">{t('availability_timeline_subtitle')}</p>
		</div>
		<div class="flex items-center gap-4 text-xs text-textSec">
			<div class="flex items-center gap-1.5">
				<span class="w-3 h-3 rounded-sm bg-success inline-block"></span>{t(
					'availability_timeline_up'
				)}
			</div>
			<div class="flex items-center gap-1.5">
				<span class="w-3 h-3 rounded-sm bg-secondary inline-block"></span>{t(
					'availability_timeline_degraded'
				)}
			</div>
			<div class="flex items-center gap-1.5">
				<span class="w-3 h-3 rounded-sm bg-error inline-block"></span>{t(
					'availability_timeline_down'
				)}
			</div>
			<div class="flex items-center gap-1.5">
				<span class="w-3 h-3 rounded-sm bg-surface border border-border inline-block"></span>{t(
					'availability_timeline_noData'
				)}
			</div>
		</div>
	</div>
	<div class="space-y-5">
		{#each serviceCards as card (card.key)}
			<UptimeTimeline {card} variant="desktop" />
		{/each}
	</div>
</section>

<!-- Mobile Uptime Timeline Accordion -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<button
		class="w-full flex items-center justify-between p-4"
		style="min-height:52px"
		onclick={() => (utOpen = !utOpen)}
	>
		<h3 class="text-sm font-semibold text-textMain">{t('availability_timeline_titleMobile')}</h3>
		<div class="flex items-center gap-2">
			<span class="text-xs text-textSec">{t('availability_timeline_90days')}</span>
			<i
				class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {utOpen
					? 'rotate-180'
					: ''}"
			></i>
		</div>
	</button>
	{#if utOpen}
		<div class="px-4 pb-4">
			<div class="flex flex-wrap items-center gap-3 mb-4 text-xs text-textSec">
				<div class="flex items-center gap-1">
					<span class="w-2.5 h-2.5 rounded-sm bg-success inline-block"></span>{t(
						'availability_timeline_up'
					)}
				</div>
				<div class="flex items-center gap-1">
					<span class="w-2.5 h-2.5 rounded-sm bg-secondary inline-block"></span>{t(
						'availability_timeline_degraded'
					)}
				</div>
				<div class="flex items-center gap-1">
					<span class="w-2.5 h-2.5 rounded-sm bg-error inline-block"></span>{t(
						'availability_timeline_down'
					)}
				</div>
			</div>
			<div class="space-y-4">
				{#each serviceCards as card (card.key)}
					<UptimeTimeline {card} variant="mobile" />
				{/each}
			</div>
		</div>
	{/if}
</section>
