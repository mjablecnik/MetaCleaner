<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Pathname } from '$app/types';
	import { getPlanStyle } from '$lib/shared/utils/planStyleMap';

	interface Props {
		planId: string;
		planStatus: string;
	}

	const { planId, planStatus }: Props = $props();

	const style = $derived(getPlanStyle(planId, planStatus));

	function handleClick() {
		goto(resolve('/pricing' as Pathname));
	}
</script>

<button
	onclick={handleClick}
	class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all duration-200
		bg-gradient-to-r {style.bgGradient} {style.borderColor}
		hover:brightness-125"
>
	<span class="h-1.5 w-1.5 flex-shrink-0 rounded-full {style.dotColor} shadow {style.glowColor}"></span>
	<i class="fa-solid fa-{style.icon} text-[9px] {style.textColor}"></i>
	<span class="text-xs font-bold {style.textColor}">{style.label}</span>
</button>
