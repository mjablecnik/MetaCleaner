<script lang="ts">
	import { t } from '$lib/i18n';
	import IconBadge from '$lib/components/elements/IconBadge.svelte';
	import type { Step } from '$lib/repositories';

	interface Props {
		step: Step;
		size?: 'desktop' | 'mobile';
	}

	const { step, size = 'desktop' }: Props = $props();

	const isMobile = $derived(size === 'mobile');
</script>

{#if isMobile}
	<div
		class="bg-navy-card rounded-2xl border border-border p-5 flex items-start gap-4 relative overflow-hidden"
	>
		<span class="absolute top-3 right-4 text-4xl font-black text-watermark select-none leading-none"
			>{step.number}</span
		>
		<IconBadge icon={step.icon} color="brand-blue" size="md" shape="circle" />
		<div class="flex-1 z-10">
			<h3 class="font-bold text-base mb-1">{t(step.titleKey)}</h3>
			{#if step.descMobileKey}
				<p class="text-xs text-text-muted leading-relaxed">{t(step.descMobileKey)}</p>
			{/if}
		</div>
	</div>
{:else}
	<div
		class="bg-navy-card rounded-2xl border border-border p-8 flex flex-col items-center text-center gap-4 relative"
	>
		<IconBadge icon={step.icon} color="brand-blue" size="xl" shape="circle" />
		<span class="absolute top-6 right-6 text-5xl font-black text-watermark select-none"
			>{step.number}</span
		>
		<h3 class="text-xl font-bold">{t(step.titleKey)}</h3>
		<p class="text-text-muted text-sm leading-relaxed">{t(step.descKey)}</p>
	</div>
{/if}
