<script lang="ts">
	import { t } from '$lib/i18n';
	import type { Incident } from '$lib/repositories/availabilityRepository';

	interface Props {
		incident: Incident;
		variant?: 'desktop' | 'mobile';
	}

	let { incident: inc, variant = 'desktop' }: Props = $props();

	const isMobile = $derived(variant === 'mobile');
</script>

{#if inc.status === 'active'}
	<div class="p-4 rounded-xl bg-surface/60 border border-secondary/30">
		<div class="flex items-start gap-3">
			<div class="mt-1 flex-shrink-0">
				{#if isMobile}
					<span
						class="w-7 h-7 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center"
					>
						<i class="fa-solid fa-triangle-exclamation text-secondary text-xs"></i>
					</span>
				{:else}
					<span
						class="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center"
					>
						<i class="fa-solid fa-triangle-exclamation text-secondary text-xs"></i>
					</span>
				{/if}
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div class="flex items-center gap-2">
						<span class="text-sm font-semibold text-textMain leading-tight">{inc.title}</span>
						<span
							class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full border border-secondary/20 font-medium flex-shrink-0"
							>{t('common_status_active')}</span
						>
					</div>
					<span class="text-xs text-textSec">{inc.timestamp}</span>
				</div>
				<p class="text-xs text-textSec mt-1.5 leading-relaxed">
					{isMobile ? inc.descriptionMobile : inc.descriptionDesktop}
				</p>
				<div class="flex flex-wrap items-center gap-3 mt-2">
					<span class="text-xs text-textSec">
						<i class="fa-solid fa-clock mr-1"></i>
						{#if isMobile}
							{inc.duration}
						{:else}
							{t('availability_incidents_ongoing', { duration: inc.duration })}
						{/if}
					</span>
					<span class="text-xs text-textSec">
						<i class="fa-solid {inc.serviceIcon} mr-1"></i>{inc.service}
					</span>
					{#if isMobile}
						<span class="text-xs text-textSec">{inc.timestamp}</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="p-4 rounded-xl bg-surface/40 border border-border/40">
		<div class="flex items-start gap-3">
			<div class="mt-1 flex-shrink-0">
				{#if isMobile}
					<span
						class="w-7 h-7 rounded-full bg-success/10 border border-success/30 flex items-center justify-center"
					>
						<i class="fa-solid fa-check text-success text-xs"></i>
					</span>
				{:else}
					<span
						class="w-6 h-6 rounded-full bg-success/10 border border-success/30 flex items-center justify-center"
					>
						<i class="fa-solid fa-check text-success text-xs"></i>
					</span>
				{/if}
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium text-textSec line-through leading-tight"
							>{inc.title}</span
						>
						<span
							class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium flex-shrink-0"
							>{t('common_status_resolved')}</span
						>
					</div>
					<span class="text-xs text-textSec">{inc.timestamp}</span>
				</div>
				<p class="text-xs text-textSec mt-1.5 leading-relaxed">
					{isMobile ? inc.descriptionMobile : inc.descriptionDesktop}
				</p>
				<div class="flex flex-wrap items-center gap-3 mt-2">
					<span class="text-xs text-textSec">
						<i class="fa-solid fa-stopwatch mr-1"></i>
						{#if isMobile}
							{inc.duration}
						{:else}
							{t('availability_incidents_duration', { duration: inc.duration })}
						{/if}
					</span>
					<span class="text-xs text-textSec">
						<i class="fa-solid {inc.serviceIcon} mr-1"></i>
						{isMobile ? inc.service.split(' ')[0] : inc.service}
					</span>
					{#if isMobile}
						<span class="text-xs text-textSec">{inc.timestamp}</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
