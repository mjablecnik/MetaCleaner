<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';

	interface Props {
		code: string;
		description: string;
		onDismiss: () => void;
	}

	const { code, description, onDismiss }: Props = $props();

</script>

<div
	class="flex w-full items-start gap-3 rounded-2xl border border-brand-red/30 bg-brand-red/10 px-4 py-3.5 shadow-glow-red lg:gap-4 lg:px-5 lg:py-4"
>
	<div
		class="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red/15 lg:h-10 lg:w-10"
	>
		<i class="fa-solid fa-triangle-exclamation text-brand-red lg:text-lg"></i>
	</div>
	<div class="min-w-0 flex-1">
		<div class="flex flex-wrap items-center gap-2">
			<p class="text-sm font-bold text-white">{tx('step4.error.processFailedTitle')}</p>
			<span
				class="rounded border border-brand-red/30 bg-brand-red/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-red uppercase"
			>
				{code}
			</span>
		</div>
		<p class="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>
	</div>
	<button
		onclick={onDismiss}
		aria-label={tx('common.dismiss')}
		class="mt-0.5 flex-shrink-0 p-1 text-text-muted transition-colors hover:text-white"
	>
		<i class="fa-solid fa-xmark text-sm"></i>
	</button>
</div>
