<script lang="ts">
	import { t } from '$lib/i18n';
	import IconBadge from '$lib/components/elements/IconBadge.svelte';
	import type { Step } from '$lib/repositories';

	interface Props {
		step: Step;
	}

	const { step }: Props = $props();
</script>

<div
	class="bg-navy-card rounded-2xl border border-border p-5 md:p-8 flex items-start md:flex-col md:items-center md:text-center gap-4 relative overflow-hidden"
>
	<span
		class="absolute top-3 right-4 md:top-6 md:right-6 text-4xl md:text-5xl font-black text-watermark select-none leading-none"
		>{step.number}</span
	>
	<div class="flex-shrink-0 md:hidden">
		<IconBadge icon={step.icon} color="brand-blue" size="md" shape="circle" />
	</div>
	<div class="flex-shrink-0 hidden md:block">
		<IconBadge icon={step.icon} color="brand-blue" size="xl" shape="circle" />
	</div>
	<div class="flex-1 z-10">
		<h3 class="font-bold text-base mb-1 md:text-xl md:mb-0">{t(step.titleKey)}</h3>
		<p class="text-text-muted leading-relaxed text-xs md:text-sm">
			{#if step.descMobileKey}
				<span class="md:hidden">{t(step.descMobileKey)}</span>
				<span class="hidden md:inline">{t(step.descKey)}</span>
			{:else}
				{t(step.descKey)}
			{/if}
		</p>
	</div>
</div>
