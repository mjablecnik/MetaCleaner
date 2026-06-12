<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import MobileBottomCta from '$lib/shared/components/MobileBottomCta.svelte';
	import UploadZoneCard from '../../(step1)/sections/UploadZoneCard.svelte';
	import StatusCardIdle from './StatusCardIdle.svelte';

</script>

<!-- Desktop: two-column grid 55%/43% | Mobile: single column -->
<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
	<!-- Left: upload zone + desktop disabled start button -->
	<div class="flex flex-col gap-4 lg:gap-5">
		<UploadZoneCard />

		<!-- Desktop-only disabled start cleaning button -->
		<div class="hidden lg:block">
			<button
				disabled
				class="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-700 py-3.5 text-sm font-bold text-gray-500 opacity-60"
			>
				<i class="fa-solid fa-wand-magic-sparkles"></i>
				{tx('common.startCleaning')}
			</button>
		</div>
	</div>

	<!-- Right: idle status card -->
	<div class="flex flex-col">
		<StatusCardIdle />
	</div>
</div>

<!-- Mobile: disabled start cleaning fixed at bottom -->
<MobileBottomCta>
	<button
		disabled
		class="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-700 py-4 text-sm font-bold text-gray-500 opacity-60"
	>
		<i class="fa-solid fa-wand-magic-sparkles"></i>
		{tx('common.startCleaning')}
	</button>
</MobileBottomCta>
