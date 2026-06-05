<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		totalReports: number;
	}

	const { totalReports }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0 lg:mb-2">
	<div class="flex items-center gap-3 lg:gap-4">
		<div
			class="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-brand-blue/10 border-2 border-brand-blue/40 flex items-center justify-center flex-shrink-0"
		>
			<i class="fa-solid fa-clock-rotate-left text-brand-blue text-lg lg:text-3xl"></i>
		</div>
		<div>
			<h1 class="text-xl lg:text-3xl font-bold text-white leading-tight">
				{tx('reports.header.title')}
			</h1>
			<p class="text-text-muted text-xs lg:text-sm mt-0.5 lg:mt-1">
				<span class="hidden lg:inline">{tx('reports.header.subtitle')} · </span>{tx('reports.header.totalReports', { count: totalReports })}
			</p>
		</div>
	</div>
	<div class="flex items-center gap-3 self-start sm:self-auto">
		<a
			href="/"
			class="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-400 transition-all shadow-glow-green"
		>
			<i class="fa-solid fa-plus text-xs"></i>
			<span class="hidden sm:inline">{tx('reports.header.newCleaning')}</span>
			<span class="inline sm:hidden">{tx('reports.header.newShort')}</span>
		</a>
	</div>
</div>
