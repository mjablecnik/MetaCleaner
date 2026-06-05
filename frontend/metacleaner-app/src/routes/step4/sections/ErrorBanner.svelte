<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/repositories/processingRepository';

	interface Props {
		errorState: ErrorState | null;
		visible: boolean;
		onDismiss: () => void;
	}

	const { errorState, visible, onDismiss }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

{#if visible}
	<div class="w-full bg-brand-red/10 border border-brand-red/30 rounded-2xl px-4 lg:px-5 py-3.5 lg:py-4 flex items-start gap-3 lg:gap-4 shadow-glow-red">
		<div class="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center flex-shrink-0 mt-0.5">
			<i class="fa-solid fa-triangle-exclamation text-brand-red text-base lg:text-lg"></i>
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 flex-wrap">
				<p class="text-sm font-bold text-white">{tx('step4.error.processFailedTitle')}</p>
				<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30 tracking-wider">{errorState?.errorCode}</span>
			</div>
			<p class="text-xs text-text-muted mt-1 leading-relaxed">
				<span class="hidden lg:inline">{tx('step4.error.descriptionDesktop')}</span>
				<span class="inline lg:hidden">{tx('step4.error.descriptionMobile')}</span>
			</p>
		</div>
		<button
			onclick={onDismiss}
			class="flex-shrink-0 text-text-muted hover:text-white transition-colors mt-0.5 p-1"
			aria-label="close"
		>
			<i class="fa-solid fa-xmark text-sm"></i>
		</button>
	</div>
{/if}
