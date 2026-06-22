<script lang="ts">
	import type { ApiKey } from '$lib/clients/apiKeysClient';

	interface Props {
		apiKey: ApiKey;
		onDelete: (key: ApiKey) => void;
		onRevoke: (key: ApiKey) => void;
		onUpdate: (key: ApiKey) => void;
	}

	const { apiKey, onDelete, onRevoke, onUpdate }: Props = $props();
</script>

<!-- Placeholder: implemented in task 10.1 -->
<div class="px-6 py-5 text-sm text-text-muted">
	{apiKey.name}
</div>
