<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	interface Props {
		totalReports: number;
	}

	const { totalReports }: Props = $props();

</script>

<div
	class="fade-in-up mb-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-2"
>
	<div class="flex items-center gap-3 lg:gap-4">
		<div
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-brand-blue/40 bg-brand-blue/10 lg:h-14 lg:w-14 lg:rounded-2xl"
		>
			<i class="fa-solid fa-clock-rotate-left text-lg text-brand-blue lg:text-3xl"></i>
		</div>
		<div>
			<h1 class="text-xl leading-tight font-bold text-white lg:text-3xl">
				{tx('reports.header.title')}
			</h1>
			<p class="mt-0.5 text-xs text-text-muted lg:mt-1 lg:text-sm">
				<span class="hidden lg:inline">{tx('reports.header.subtitle')} · </span>{tx(
					'reports.header.totalReports',
					{ count: totalReports }
				)}
			</p>
		</div>
	</div>
	<div class="flex items-center gap-3 self-start sm:self-auto">
		<a
			href={resolve('/' as Pathname)}
			class="flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400 lg:px-5 lg:py-2.5"
		>
			<i class="fa-solid fa-plus text-xs"></i>
			<span class="hidden sm:inline">{tx('reports.header.newCleaning')}</span>
			<span class="inline sm:hidden">{tx('reports.header.newShort')}</span>
		</a>
	</div>
</div>
