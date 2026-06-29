<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import FormatBadge from '$lib/components/elements/FormatBadge.svelte';

	const formats = ['JPG', 'PNG', 'HEIC', 'WEBP'];
</script>

<div
	class="w-full md:h-full rounded-2xl bg-navy-card border border-border p-5 md:p-6 flex flex-col shadow-card relative overflow-hidden"
>
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 md:h-1/2 bg-brand-blue/10 blur-glow-sm md:blur-glow rounded-full pointer-events-none"
	></div>
	<div class="flex justify-between items-center mb-4 md:mb-6 z-10">
		<h3 class="font-semibold text-sm md:text-lg">{m.home_upload_title()}</h3>
		<div class="flex gap-1 md:gap-2">
			{#each formats as label (label)}
				<FormatBadge {label} size="sm" />
			{/each}
		</div>
	</div>
	<div
		class="py-8 md:py-0 md:flex-1 rounded-xl bg-navy-main/50 dashed-border-anim flex flex-col items-center justify-center gap-3 md:gap-4 cursor-pointer z-10 md:hover:bg-navy-main/80 md:transition-colors"
	>
		<div
			class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-navy-lighter flex items-center justify-center text-xl md:text-2xl text-brand-blue shadow-glow-blue"
		>
			<i class="fa-solid fa-file-arrow-up"></i>
		</div>
		<div class="text-center px-4 md:px-0">
			<p class="font-semibold text-white text-sm mb-1">
				<span class="md:hidden">{m.home_upload_drop_mobile()}</span>
				<span class="hidden md:inline">{m.home_upload_drop()}</span>
			</p>
			<p class="text-xs text-text-muted">
				<span class="md:hidden">{m.home_upload_hint_mobile()}</span>
				<span class="hidden md:inline">{m.home_upload_hint()}</span>
			</p>
		</div>
	</div>
	<p class="text-xs text-text-muted text-center mt-3 z-10">{m.home_upload_local_note()}</p>
</div>

<style>
	.dashed-border-anim {
		background-image:
			linear-gradient(90deg, #94a3b8 50%, transparent 50%),
			linear-gradient(90deg, #94a3b8 50%, transparent 50%),
			linear-gradient(0deg, #94a3b8 50%, transparent 50%),
			linear-gradient(0deg, #94a3b8 50%, transparent 50%);
		background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
		background-size:
			15px 2px,
			15px 2px,
			2px 15px,
			2px 15px;
		background-position:
			left top,
			right bottom,
			left bottom,
			right top;
		animation: border-dance 1s infinite linear;
	}

	@keyframes border-dance {
		0% {
			background-position:
				left top,
				right bottom,
				left bottom,
				right top;
		}
		100% {
			background-position:
				left 15px top,
				right 15px bottom,
				left bottom 15px,
				right top 15px;
		}
	}
</style>
