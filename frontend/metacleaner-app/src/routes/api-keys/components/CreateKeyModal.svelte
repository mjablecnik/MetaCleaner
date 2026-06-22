<script lang="ts">
	import type { ApiKey } from '$lib/clients/apiKeysClient';

	interface Props {
		open: boolean;
		onClose: () => void;
		onCreated: (key: ApiKey) => void;
	}

	const { open, onClose, onCreated }: Props = $props();
</script>

<!-- Placeholder: implemented in task 10.2 -->
{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-navy-main/85 backdrop-blur-[4px]">
		<div class="rounded-2xl border border-gray-700 bg-navy-card p-7">
			<button onclick={onClose}>Close</button>
		</div>
	</div>
{/if}
