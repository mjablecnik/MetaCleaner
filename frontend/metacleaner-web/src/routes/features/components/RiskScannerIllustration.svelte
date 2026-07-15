<div class="relative w-48 h-48 flex items-center justify-center">
	<div class="relative flex flex-col items-center">
		<!-- Shield with gauge -->
		<div
			class="w-32 h-32 bg-navy-card border-2 border-brand-red/30 rounded-xl flex flex-col items-center justify-center relative"
		>
			<!-- Shield icon -->
			<div class="relative mb-2">
				<i class="fa-solid fa-shield-halved text-brand-red/70 text-4xl"></i>
			</div>

			<!-- Risk score bar -->
			<div class="w-20 h-2 bg-navy-lighter rounded-full overflow-hidden">
				<div class="h-full w-3/4 bg-linear-to-r from-brand-green via-brand-orange to-brand-red rounded-full"></div>
			</div>
			<span class="text-xs font-mono text-brand-red mt-1 font-bold">72/100</span>
		</div>

		<!-- GPS risk tag top-left -->
		<div
			class="absolute -top-1 -left-10 flex items-center gap-1 bg-brand-red/20 border border-brand-red/40 rounded-md px-1.5 py-0.5"
		>
			<i class="fa-solid fa-location-dot text-brand-red text-xs"></i>
			<span class="text-xs text-brand-red font-mono">HIGH</span>
		</div>

		<!-- Identity tag top-right -->
		<div
			class="absolute top-0 -right-10 flex items-center gap-1 bg-brand-orange/20 border border-brand-orange/40 rounded-md px-1.5 py-0.5"
		>
			<i class="fa-solid fa-user text-brand-orange text-xs"></i>
			<span class="text-xs text-brand-orange font-mono">MED</span>
		</div>

		<!-- Low risk tag bottom-left -->
		<div
			class="absolute bottom-4 -left-8 flex items-center gap-1 bg-brand-green/20 border border-brand-green/40 rounded-md px-1.5 py-0.5 opacity-60"
		>
			<i class="fa-solid fa-check text-brand-green text-xs"></i>
			<span class="text-xs text-brand-green font-mono">LOW</span>
		</div>

		<!-- Score circle indicator bottom-right -->
		<div
			class="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-brand-red flex items-center justify-center shadow-glow-blue"
		>
			<i class="fa-solid fa-chart-line text-white text-sm"></i>
		</div>
	</div>
</div>
