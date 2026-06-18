<script lang="ts">
	import { t } from '$lib/i18n';
	import type { Audience } from '$lib/repositories';

	interface Props {
		audience: Audience;
	}

	const { audience }: Props = $props();

	const hoverBorderMap: Record<string, string> = {
		'brand-blue': 'hover:border-brand-blue/50',
		'brand-orange': 'hover:border-brand-orange/50',
		'brand-green': 'hover:border-brand-green/50'
	};

	const iconBgMap: Record<string, string> = {
		'brand-blue': 'bg-brand-blue/20',
		'brand-orange': 'bg-brand-orange/20',
		'brand-green': 'bg-brand-green/20'
	};

	const iconTextMap: Record<string, string> = {
		'brand-blue': 'text-brand-blue',
		'brand-orange': 'text-brand-orange',
		'brand-green': 'text-brand-green'
	};

	const hoverBorder = $derived(hoverBorderMap[audience.color] ?? 'hover:border-brand-blue/50');
	const iconBg = $derived(iconBgMap[audience.color] ?? 'bg-brand-blue/20');
	const iconText = $derived(iconTextMap[audience.color] ?? 'text-brand-blue');
</script>

<div
	class="bg-navy-card rounded-2xl border border-border p-4 md:p-7 flex items-start gap-4 md:flex-col {hoverBorder} transition-colors"
>
	<div
		class="w-10 h-10 md:w-12 md:h-12 rounded-xl {iconBg} flex items-center justify-center {iconText} text-base md:text-xl flex-shrink-0"
	>
		<i class="fa-solid {audience.icon}"></i>
	</div>
	<div class="flex-1 md:flex-none">
		<h3 class="font-bold text-sm md:text-lg mb-1 md:mb-2">{t(audience.titleKey)}</h3>
		<p class="text-xs md:text-sm text-text-muted leading-relaxed">{t(audience.descKey)}</p>
		{#if audience.bulletKeys}
			<ul class="hidden md:flex flex-col gap-1.5 mt-4">
				{#each audience.bulletKeys as bulletKey (bulletKey)}
					<li class="flex items-center gap-2 text-xs text-text-muted">
						<i class="fa-solid fa-check text-brand-green text-[10px]"></i>{t(bulletKey)}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
