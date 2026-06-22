<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Button from '$lib/shared/elements/Button.svelte';

	interface Props {
		onCreateKey: () => void;
	}

	const { onCreateKey }: Props = $props();
</script>

<div class="flex flex-col items-center gap-4 py-16 text-center">
	<div
		class="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-700 bg-navy-lighter"
	>
		<i class="fa-solid fa-key text-xl text-text-muted opacity-40"></i>
	</div>
	<div>
		<p class="text-sm font-semibold text-white">{tx('apiKeys.emptyState.title')}</p>
		<p class="mt-1 text-xs text-text-muted">Create an API key to start using the API.</p>
	</div>
	<Button variant="primary" onclick={onCreateKey}>
		<i class="fa-solid fa-plus text-xs"></i>
		{tx('apiKeys.emptyState.cta')}
	</Button>
</div>
