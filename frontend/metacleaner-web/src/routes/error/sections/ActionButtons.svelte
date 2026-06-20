<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<div class="flex flex-col gap-3">
	<a
		href="/"
		class="w-full py-3.5 rounded-xl bg-brand-green text-white text-sm font-semibold shadow-glow-green flex items-center justify-center gap-2 min-h-[48px] hover:bg-green-500 transition-colors"
	>
		<i class="fa-solid fa-house"></i>
		{m.error_404_btn_home()}
	</a>
	<div class="flex gap-3">
		<button
			onclick={() => history.back()}
			class="flex-1 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-white text-sm font-semibold flex items-center justify-center gap-2 min-h-[48px] hover:bg-border transition-colors"
		>
			<i class="fa-solid fa-arrow-left"></i>
			{m.error_404_btn_back()}
		</button>
		<a
			href="/about#contact"
			class="flex-1 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-white text-sm font-semibold flex items-center justify-center gap-2 min-h-[48px] hover:bg-border transition-colors"
		>
			<i class="fa-solid fa-headset"></i>
			{m.error_404_btn_support()}
		</a>
	</div>
</div>
