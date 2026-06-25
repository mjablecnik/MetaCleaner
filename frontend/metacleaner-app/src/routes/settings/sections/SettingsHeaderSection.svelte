<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';

	interface Props {
		lastLogin: string;
	}

	let { lastLogin }: Props = $props();
</script>

<div class="fade-in-up mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-6">
	<div class="flex items-center gap-3 lg:gap-4">
		<div
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-brand-blue/40 bg-brand-blue/10 lg:h-14 lg:w-14 lg:rounded-2xl"
		>
			<i class="fa-solid fa-gear text-xl text-brand-blue lg:text-3xl"></i>
		</div>
		<div>
			<h1 class="text-xl font-bold leading-tight text-white lg:text-3xl">
				{tx('settings.header.title')}
			</h1>
			<p class="mt-0.5 text-xs text-text-muted lg:mt-1 lg:text-sm">
				{tx('settings.header.subtitle')}
			</p>
		</div>
	</div>
	<div
		class="hidden items-center gap-2 rounded-xl border border-gray-800 bg-navy-card px-4 py-2.5 text-xs text-text-muted sm:flex"
	>
		<i class="fa-solid fa-clock text-xs text-brand-blue"></i>
		<span
			>{tx('settings.header.lastLogin')} <span class="font-semibold text-white">{lastLogin}</span
			></span
		>
	</div>
</div>
