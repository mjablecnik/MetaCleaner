<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';

	interface Props {
		fileCount: number;
		onUploadNew: () => void;
	}

	const { fileCount, onUploadNew }: Props = $props();
</script>

<div class="fade-in-up mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex items-center gap-3 lg:gap-4">
		<div class="relative flex-shrink-0">
			<div
				class="check-pop flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-brand-green/40 bg-brand-green/10 lg:h-14 lg:w-14"
			>
				<i class="fa-solid fa-circle-check text-2xl text-brand-green lg:text-3xl"></i>
			</div>
		</div>
		<div>
			<h1 class="text-xl leading-tight font-bold text-white lg:text-3xl">
				{tx('step5.header.title')}
			</h1>
			<p class="mt-0.5 text-xs text-text-muted lg:mt-1 lg:text-sm">
				<span class="lg:hidden">{tx('step5.header.descriptionMobile', { count: fileCount })}</span>
				<span class="hidden lg:inline"
					>{tx('step5.header.descriptionDesktop', { count: fileCount })}</span
				>
			</p>
		</div>
	</div>

	<div class="hidden flex-col items-start gap-3 sm:flex sm:items-end">
		<button
			onclick={onUploadNew}
			class="flex items-center gap-2 rounded-xl border border-brand-blue/30 bg-brand-blue/10 px-4 py-2.5 text-sm font-semibold text-brand-blue transition-all hover:bg-brand-blue/20"
		>
			<i class="fa-solid fa-arrow-up-from-bracket"></i>
			<span>{tx('step5.actions.uploadNew')}</span>
		</button>
		<div
			class="flex w-fit items-center gap-2 rounded-xl border border-brand-green/30 bg-brand-green/10 px-4 py-2.5"
		>
			<div class="h-2 w-2 rounded-full bg-brand-green"></div>
			<span class="text-xs font-semibold text-brand-green">{tx('step5.badge.success')}</span>
		</div>
	</div>
</div>
