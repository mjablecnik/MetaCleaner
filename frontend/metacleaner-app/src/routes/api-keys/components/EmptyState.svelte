<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Button from '$lib/shared/elements/Button.svelte';

	interface Props {
		onCreateKey: () => void;
	}

	const { onCreateKey }: Props = $props();
</script>

<!-- Placeholder: implemented in task 10.4 -->
<div class="flex flex-col items-center gap-4 py-12 text-center">
	<i class="fa-solid fa-key text-3xl text-text-muted opacity-40"></i>
	<p class="text-sm text-text-muted">{tx('apiKeys.emptyState.title')}</p>
	<Button variant="primary" onclick={onCreateKey}>
		{tx('apiKeys.emptyState.cta')}
	</Button>
</div>
