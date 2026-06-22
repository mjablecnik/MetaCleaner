<script lang="ts">
	import type { ApiKey } from '$lib/clients/apiKeysClient';

	interface Props {
		apiKey: ApiKey | null;
		onClose: () => void;
		onDeleted: (id: string) => void;
	}

	const { apiKey, onClose, onDeleted }: Props = $props();
</script>

<!-- Placeholder: implemented in task 10.3 -->
{#if apiKey}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-navy-main/85 backdrop-blur-[4px]">
		<div class="rounded-2xl border border-gray-700 bg-navy-card p-7">
			<button onclick={onClose}>Cancel</button>
			<button onclick={() => onDeleted(apiKey.id)}>Delete</button>
		</div>
	</div>
{/if}
