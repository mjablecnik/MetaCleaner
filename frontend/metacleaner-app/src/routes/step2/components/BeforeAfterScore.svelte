<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		beforeScore: number;
		afterScore: number;
	}

	const { beforeScore, afterScore }: Props = $props();

	function tx(key: string): string {
		currentLocale; // reactive dependency
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}
</script>

<div class="grid grid-cols-2 gap-3">
	<div
		class="flex flex-col items-center gap-2 px-3 py-3 rounded-xl border border-brand-red/25 bg-brand-red/8"
	>
		<span class="text-[10px] font-bold uppercase tracking-widest text-brand-red">
			{tx('step2.risk.now')}
		</span>
		<span class="text-2xl font-black text-brand-red">{beforeScore}</span>
		<span class="text-[10px] text-text-muted">{tx('step2.risk.score')}</span>
	</div>
	<div
		class="flex flex-col items-center gap-2 px-3 py-3 rounded-xl border border-brand-green/25 bg-brand-green/8"
	>
		<span class="text-[10px] font-bold uppercase tracking-widest text-brand-green">
			{tx('step2.risk.afterCleaning')}
		</span>
		<span class="text-2xl font-black text-brand-green">{afterScore}</span>
		<span class="text-[10px] text-text-muted">{tx('step2.risk.cleanScore')}</span>
	</div>
</div>
