<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Card from '$lib/shared/elements/Card.svelte';
	import type { ApiKey } from '$lib/clients/apiKeysClient';
	import KeyRow from '../components/KeyRow.svelte';
	import EmptyState from '../components/EmptyState.svelte';

	interface Props {
		keys: ApiKey[];
		newKeyValues?: Map<string, string>;
		onCreateKey: () => void;
		onDelete: (key: ApiKey) => void;
		onRevoke: (key: ApiKey) => void;
	}

	const { keys, newKeyValues = new Map(), onCreateKey, onDelete, onRevoke }: Props = $props();
</script>

<Card padding="p-0">
	<div class="flex items-center justify-between border-b border-gray-800 px-6 py-4">
		<p class="text-sm font-semibold text-white">{tx('apiKeys.list.title')}</p>
		<span
			class="inline-flex items-center rounded-full border border-gray-700 bg-navy-lighter px-2.5 py-1 text-[10px] font-bold tracking-wider text-text-muted uppercase"
		>
			{tx('apiKeys.list.keysCount', { count: keys.length })}
		</span>
	</div>
	{#if keys.length === 0}
		<EmptyState {onCreateKey} />
	{:else}
		<div class="divide-y divide-gray-800/60">
			{#each keys as apiKey (apiKey.id)}
				<KeyRow
					{apiKey}
					fullKey={newKeyValues.get(apiKey.id)}
					{onDelete}
					{onRevoke}
				/>
			{/each}
		</div>
	{/if}
</Card>
