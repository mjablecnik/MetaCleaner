<script lang="ts">
	import type { ScanStatus } from '$lib/scanner/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		status: ScanStatus;
	}

	const { status }: Props = $props();

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}
</script>

{#if status === 'pending'}
	<span class="text-[9px] font-medium text-text-muted">{tx('step1.scan.pending')}</span>
{:else if status === 'scanning'}
	<span class="flex items-center gap-1 text-[9px] font-medium text-brand-blue">
		<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-blue"></span>
		{tx('step1.scan.scanning')}
	</span>
{:else if status === 'done'}
	<i class="fa-solid fa-circle-check text-[10px] text-brand-green"></i>
{:else if status === 'error'}
	<i class="fa-solid fa-triangle-exclamation text-[10px] text-brand-orange"></i>
{/if}
