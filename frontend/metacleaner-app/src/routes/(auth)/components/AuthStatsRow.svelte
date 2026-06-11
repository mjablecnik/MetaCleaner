<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { AuthStat } from '$lib/repositories/authRepository';

	interface Props {
		stats: AuthStat[];
		bordered?: boolean;
	}

	let { stats, bordered = false }: Props = $props();

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}
</script>

<div class="grid grid-cols-3 gap-4 {bordered ? 'border-t border-gray-800 pt-2' : ''}">
	<div class="text-center">
		<p class="text-2xl font-black text-white">{stats[0].value}</p>
		<p class="mt-1 text-xs text-text-muted">{tx(stats[0].labelKey)}</p>
	</div>
	<div class="border-x border-gray-800 text-center">
		<p class="text-2xl font-black text-brand-green">{stats[1].value}</p>
		<p class="mt-1 text-xs text-text-muted">{tx(stats[1].labelKey)}</p>
	</div>
	<div class="text-center">
		<p class="text-2xl font-black text-brand-blue">{stats[2].value}</p>
		<p class="mt-1 text-xs text-text-muted">{tx(stats[2].labelKey)}</p>
	</div>
</div>
