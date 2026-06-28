<script lang="ts">
	import { t } from '$lib/i18n';
	import type { CacheRule } from '$lib/repositories/edgeRepository';

	interface Props {
		rule: CacheRule;
		variant?: 'desktop' | 'mobile';
	}

	let { rule, variant = 'desktop' }: Props = $props();
</script>

<div
	class="flex items-center {variant === 'desktop'
		? 'gap-4'
		: 'gap-3'} p-3 rounded-lg bg-surface/40 border border-border/40"
>
	<div class="w-8 h-8 rounded-lg {rule.iconBg} flex items-center justify-center flex-shrink-0">
		<i class="fa-solid {rule.icon} {rule.iconColor} text-xs"></i>
	</div>
	<div class="flex-1 min-w-0">
		<p
			class="text-textMain {variant === 'desktop'
				? 'text-sm'
				: 'text-xs'} font-medium font-mono truncate"
		>
			{rule.pattern}
		</p>
		<p class="text-xs text-textSec mt-0.5">{rule.description}</p>
	</div>
	<div class="text-right flex-shrink-0">
		<div class="{rule.hitRateColor} font-bold text-sm">{rule.hitRate}</div>
		<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
	</div>
</div>
