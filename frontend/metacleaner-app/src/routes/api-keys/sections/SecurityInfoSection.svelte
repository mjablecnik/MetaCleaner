<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Card from '$lib/shared/elements/Card.svelte';
</script>

<Card borderColor="blue" padding="p-4">
	<div class="flex items-start gap-3">
		<i class="fa-solid fa-circle-info mt-0.5 shrink-0 text-sm text-brand-blue"></i>
		<div>
			<p class="mb-0.5 text-sm font-semibold text-white">{tx('apiKeys.security.title')}</p>
			<p class="text-xs leading-relaxed text-text-muted">{tx('apiKeys.security.description')}</p>
		</div>
	</div>
</Card>
