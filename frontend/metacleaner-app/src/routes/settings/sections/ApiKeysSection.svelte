<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import CopyButton from '$lib/shared/elements/CopyButton.svelte';
	import type { ApiKeyInfo } from '$lib/repositories/settingsRepository';

	interface Props {
		apiKeys: { production: ApiKeyInfo; test: ApiKeyInfo };
	}

	let { apiKeys }: Props = $props();

	let showApiKey = $state(false);
	let showTestKey = $state(false);
</script>

<!-- Production Key -->
<div class="flex flex-col gap-3 rounded-xl border border-gray-800 bg-navy-main p-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="h-2 w-2 animate-pulse rounded-full bg-brand-green"></div>
			<span class="text-xs font-semibold text-white">{tx('settings.apiKeys.productionLabel')}</span>
		</div>
		<span
			class="rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[9px] font-bold uppercase text-brand-green"
			>{tx('settings.apiKeys.activeBadge')}</span
		>
	</div>
	<div class="flex gap-2">
		<input
			type={showApiKey ? 'text' : 'password'}
			readonly
			value={apiKeys.production.key}
			class="min-w-0 flex-1 rounded-lg border border-gray-700 bg-navy-card px-3 py-2 font-mono text-xs text-text-muted focus:outline-none"
		/>
		<button
			type="button"
			onclick={() => (showApiKey = !showApiKey)}
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-text-muted transition-colors hover:text-white lg:h-9 lg:w-9"
		>
			<i class="fa-solid text-xs {showApiKey ? 'fa-eye-slash' : 'fa-eye'}"></i>
		</button>
		<CopyButton
			text={apiKeys.production.key}
			class="h-11 w-11 flex-shrink-0 rounded-lg border border-brand-blue/20 bg-brand-blue/10 hover:bg-brand-blue/20 lg:h-9 lg:w-9"
		/>
	</div>
	<p class="text-[10px] text-text-muted">
		{tx('settings.apiKeys.createdUsed', {
			createdAt: apiKeys.production.createdAt,
			lastUsed: apiKeys.production.lastUsed
		})}
	</p>
</div>

<!-- Test Key -->
<div class="flex flex-col gap-3 rounded-xl border border-dashed border-gray-700 bg-navy-main p-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="h-2 w-2 rounded-full bg-gray-600"></div>
			<span class="text-xs font-semibold text-text-muted">{tx('settings.apiKeys.testLabel')}</span>
		</div>
		<span
			class="rounded-full border border-gray-600 bg-gray-700/50 px-2 py-0.5 text-[9px] font-bold uppercase text-text-muted"
			>{tx('settings.apiKeys.sandboxBadge')}</span
		>
	</div>
	<div class="flex gap-2">
		<input
			type={showTestKey ? 'text' : 'password'}
			readonly
			value={apiKeys.test.key}
			class="min-w-0 flex-1 rounded-lg border border-gray-700 bg-navy-card px-3 py-2 font-mono text-xs text-text-muted focus:outline-none"
		/>
		<button
			type="button"
			onclick={() => (showTestKey = !showTestKey)}
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-text-muted transition-colors hover:text-white lg:h-9 lg:w-9"
		>
			<i class="fa-solid text-xs {showTestKey ? 'fa-eye-slash' : 'fa-eye'}"></i>
		</button>
		<CopyButton
			text={apiKeys.test.key}
			class="h-11 w-11 flex-shrink-0 rounded-lg border border-brand-blue/20 bg-brand-blue/10 hover:bg-brand-blue/20 lg:h-9 lg:w-9"
		/>
	</div>
</div>
