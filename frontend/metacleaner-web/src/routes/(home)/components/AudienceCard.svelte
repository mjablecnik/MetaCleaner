<script lang="ts">
	import { t } from '$lib/i18n';
	import IconBadge from '$lib/components/elements/IconBadge.svelte';
	import type { Audience } from '$lib/repositories';

	interface Props {
		audience: Audience;
		compact?: boolean;
	}

	const { audience, compact = false }: Props = $props();

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

{#if compact}
	<div class="bg-navy-card rounded-2xl border border-border p-4 flex items-start gap-4">
		<!-- w-11 h-11 with flex-shrink-0 is not in IconBadge sizeMap, so the badge is inlined -->
		<div
			class="w-11 h-11 rounded-xl {iconBg} flex items-center justify-center {iconText} text-lg flex-shrink-0"
		>
			<i class="fa-solid {audience.icon}"></i>
		</div>
		<div>
			<h3 class="font-bold text-sm mb-1">{t(audience.titleKey)}</h3>
			<p class="text-xs text-text-muted leading-relaxed">{t(audience.descKey)}</p>
		</div>
	</div>
{:else}
	<div
		class="bg-navy-card rounded-2xl border border-border p-7 flex flex-col gap-4 {hoverBorder} transition-colors"
	>
		<IconBadge icon={audience.icon} color={audience.color} size="lg" shape="rounded" />
		<h3 class="text-lg font-bold">{t(audience.titleKey)}</h3>
		<p class="text-sm text-text-muted leading-relaxed">{t(audience.descKey)}</p>
		{#if audience.bulletKeys}
			<!-- Bullets use text-xs (smaller than CheckBullet's text-sm) to match the original page markup -->
			<ul class="flex flex-col gap-1.5 mt-auto">
				{#each audience.bulletKeys as bulletKey}
					<li class="flex items-center gap-2 text-xs text-text-muted">
						<i class="fa-solid fa-check text-brand-green text-[10px]"></i>{t(bulletKey)}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
