<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Badge from '$lib/shared/elements/Badge.svelte';
	import Card from '$lib/shared/elements/Card.svelte';
	import IconContainer from '$lib/shared/elements/IconContainer.svelte';

	interface Props {
		class?: string;
	}

	const { class: extraClass = '' }: Props = $props();
</script>

<Card class="flex flex-col items-center justify-center gap-5 py-12 lg:h-full lg:py-16 {extraClass}">
	<IconContainer color="muted" size="2xl" shape="circle" icon="fa-solid fa-shield-halved" />

	<div class="flex flex-col items-center gap-2">
		<Badge color="blue" icon="fa-solid fa-clock" label={tx('step1.status.waiting')} />
	</div>

	<p class="max-w-xs text-center text-sm leading-relaxed text-text-muted">
		{tx('step1.status.uploadPrompt')}
	</p>
</Card>
