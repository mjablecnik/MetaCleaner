<script lang="ts">
	interface Props {
		severity: 'error' | 'warning' | 'resolved';
		title: string;
		descriptionMobile: string;
		descriptionDesktop: string;
		timeMobile: string;
		timeDesktop: string;
	}

	let { severity, title, descriptionMobile, descriptionDesktop, timeMobile, timeDesktop }: Props =
		$props();

	const severityConfig: Record<
		string,
		{ border: string; strip: string; dot: string; opacity: string }
	> = {
		error: {
			border: 'border-error/20 lg:border-border/50',
			strip: 'bg-error',
			dot: 'bg-error',
			opacity: ''
		},
		warning: {
			border: 'border-secondary/20 lg:border-border/50',
			strip: 'bg-secondary',
			dot: 'bg-secondary',
			opacity: ''
		},
		resolved: {
			border: 'border-border/30',
			strip: 'bg-success',
			dot: 'bg-success',
			opacity: 'opacity-75'
		}
	};

	const sc = $derived(severityConfig[severity]);
</script>

{#if severity === 'resolved'}
	<div
		class="flex gap-3 lg:gap-4 p-3.5 lg:p-4 rounded-xl lg:rounded-lg bg-background border {sc.border} {sc.opacity}"
	>
		<div class="w-1.5 h-1.5 rounded-full {sc.dot} mt-1.5 shrink-0"></div>
		<div class="flex-1 min-w-0">
			<div class="flex justify-between items-start gap-2 mb-1">
				<h4 class="text-textSec font-medium text-sm leading-tight truncate line-through">
					{title}
				</h4>
				<span class="text-xs text-textSec whitespace-nowrap">
					<span class="lg:hidden">{timeMobile}</span>
					<span class="hidden lg:inline">{timeDesktop}</span>
				</span>
			</div>
			<p class="text-sm text-textSec line-clamp-1">
				<span class="lg:hidden">{descriptionMobile}</span>
				<span class="hidden lg:inline">{descriptionDesktop}</span>
			</p>
		</div>
	</div>
{:else}
	<div
		class="flex gap-3 lg:gap-4 p-3.5 lg:p-4 rounded-xl lg:rounded-lg bg-surface/60 lg:bg-surface/50 border {sc.border} relative overflow-hidden"
	>
		<div class="absolute left-0 top-0 bottom-0 w-1 {sc.strip} lg:hidden"></div>
		<div class="hidden lg:block w-2 h-2 rounded-full {sc.dot} mt-2 shrink-0"></div>
		<div class="flex-1 min-w-0">
			<div class="flex justify-between items-start gap-2 mb-1">
				<h4 class="text-textMain font-medium text-sm leading-tight truncate">{title}</h4>
				<span
					class="text-xs text-textSec whitespace-nowrap bg-background lg:bg-transparent px-2 lg:px-0 py-0.5 lg:py-0 rounded-md lg:rounded-none"
				>
					<span class="lg:hidden">{timeMobile}</span>
					<span class="hidden lg:inline">{timeDesktop}</span>
				</span>
			</div>
			<p class="text-sm text-textSec line-clamp-2">
				<span class="lg:hidden">{descriptionMobile}</span>
				<span class="hidden lg:inline">{descriptionDesktop}</span>
			</p>
		</div>
	</div>
{/if}
