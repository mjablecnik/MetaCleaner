<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Card from '$lib/shared/elements/Card.svelte';

	interface Props {
		class?: string;
	}

	const { class: extraClass = '' }: Props = $props();
</script>

<Card class="flex flex-col gap-4 lg:gap-5 {extraClass}">
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step1.status.title')}</h3>
		<span
			class="rounded-full bg-navy-lighter px-2.5 py-1 text-[10px] font-bold tracking-wider text-text-muted uppercase lg:px-3 lg:text-xs"
		>
			{tx('step1.status.waiting')}
		</span>
	</div>

	<div class="flex flex-col items-center justify-center gap-3 py-6 lg:gap-4 lg:py-8">
		<div
			class="flex h-16 w-16 items-center justify-center rounded-full bg-navy-lighter lg:h-20 lg:w-20"
		>
			<i class="fa-solid fa-shield-halved text-3xl text-gray-700 lg:text-4xl"></i>
		</div>
		<p class="text-center text-sm text-text-muted">
			{tx('step1.status.uploadPrompt')}
		</p>
	</div>
</Card>
