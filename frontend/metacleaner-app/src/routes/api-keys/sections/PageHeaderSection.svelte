<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import IconContainer from '$lib/shared/elements/IconContainer.svelte';
	import Button from '$lib/shared/elements/Button.svelte';

	interface Props {
		onCreateKey: () => void;
	}

	const { onCreateKey }: Props = $props();
</script>

<div class="flex items-center gap-4">
	<IconContainer icon="fa-solid fa-key" color="green" size="xl" shape="square" />
	<div class="flex-1">
		<PageHeader title={tx('apiKeys.title')} description={tx('apiKeys.subtitle')}>
			{#snippet badge()}
				<Button variant="primary" onclick={onCreateKey}>
					<i class="fa-solid fa-plus text-xs"></i>
					{tx('apiKeys.createButton')}
				</Button>
			{/snippet}
		</PageHeader>
	</div>
</div>
