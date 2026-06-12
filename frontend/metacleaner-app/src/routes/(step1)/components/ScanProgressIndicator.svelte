<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { ScanStatus } from '$lib/scanner/types';

	interface Props {
		status: ScanStatus;
	}

	const { status }: Props = $props();
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
