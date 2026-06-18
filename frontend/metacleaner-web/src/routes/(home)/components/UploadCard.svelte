<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import FormatBadge from '$lib/components/elements/FormatBadge.svelte';

	interface Props {
		size?: 'desktop' | 'mobile';
	}

	const { size = 'desktop' }: Props = $props();

	const isMobile = $derived(size === 'mobile');

	const formats = ['JPG', 'PNG', 'HEIC', 'WEBP'];
	const badgeSize = $derived(isMobile ? 'xs' : 'sm') as 'sm' | 'xs';

	const cardHeight = $derived(isMobile ? '' : 'h-full');
	const cardPadding = $derived(isMobile ? 'p-5' : 'p-6');
	const glowHeight = $derived(isMobile ? 'h-1/3' : 'h-1/2');
	const glowBlur = $derived(isMobile ? 'blur-glow-sm' : 'blur-glow');
	const headerMb = $derived(isMobile ? 'mb-4' : 'mb-6');
	const titleSize = $derived(isMobile ? 'text-sm' : 'text-lg');
	const badgeGap = $derived(isMobile ? 'gap-1' : 'gap-2');
	const dropFlex = $derived(isMobile ? 'py-8' : 'flex-1');
	const dropGap = $derived(isMobile ? 'gap-3' : 'gap-4');
	const dropHover = $derived(isMobile ? '' : 'hover:bg-navy-main/80 transition-colors');
	const iconSize = $derived(isMobile ? 'w-14 h-14 text-xl' : 'w-16 h-16 text-2xl');
	const dropText = $derived(isMobile ? m.home_upload_drop_mobile() : m.home_upload_drop());
	const hintText = $derived(isMobile ? m.home_upload_hint_mobile() : m.home_upload_hint());
	const dropTextSize = $derived(isMobile ? 'text-sm' : '');
	const dropCenter = $derived(isMobile ? 'text-center px-4' : 'text-center');
	const noteMt = $derived(isMobile ? '' : 'mt-2');
</script>

<div
	class="w-full {cardHeight} rounded-2xl bg-navy-card border border-border {cardPadding} flex flex-col shadow-card relative overflow-hidden"
>
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 {glowHeight} bg-brand-blue/10 {glowBlur} rounded-full pointer-events-none"
	></div>
	<div class="flex justify-between items-center {headerMb} z-10">
		<h3 class="font-semibold {titleSize}">{m.home_upload_title()}</h3>
		<div class="flex {badgeGap}">
			{#each formats as label (label)}
				<FormatBadge {label} size={badgeSize} />
			{/each}
		</div>
	</div>
	<div
		class="{dropFlex} rounded-xl bg-navy-main/50 dashed-border-anim flex flex-col items-center justify-center {dropGap} cursor-pointer z-10 {dropHover}"
	>
		<div
			class="{iconSize} rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue shadow-glow-blue"
		>
			<i class="fa-solid fa-file-arrow-up"></i>
		</div>
		<div class={dropCenter}>
			<p class="font-semibold text-white {dropTextSize} mb-1">{dropText}</p>
			<p class="text-xs text-text-muted">{hintText}</p>
		</div>
		<p class="text-[10px] text-text-muted {noteMt}">
			<i class="fa-solid fa-lock mr-1"></i>{m.home_upload_local_note()}
		</p>
	</div>
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
