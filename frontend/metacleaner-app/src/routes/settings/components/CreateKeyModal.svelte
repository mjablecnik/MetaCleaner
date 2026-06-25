<script lang="ts">
	import type { ApiKey } from '$lib/clients/apiKeysClient.js';

	interface Props {
		onClose: () => void;
		onCreated: (key: ApiKey) => void;
	}

	let { onClose, onCreated: _onCreated }: Props = $props();
</script>

<!-- Task 4.5: full implementation pending -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
	<div class="w-full max-w-md rounded-2xl border border-gray-700 bg-navy-lighter p-6">
		<p class="text-white">Create key modal — coming soon</p>
		<button type="button" class="mt-4 text-sm text-text-muted hover:text-white" onclick={onClose}>
			Close
		</button>
	</div>
</div>
