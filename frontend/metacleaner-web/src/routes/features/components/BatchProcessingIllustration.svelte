<div class="relative w-48 h-48 flex items-center justify-center">
	<div class="relative flex items-center justify-center">
		<!-- Stacked file cards (back to front) -->
		<div
			class="absolute top-0 left-4 w-24 h-28 bg-navy-card/60 border border-border/30 rounded-lg -rotate-6"
		></div>
		<div
			class="absolute top-0 left-2 w-24 h-28 bg-navy-card/80 border border-border/50 rounded-lg -rotate-3"
		></div>

		<!-- Main file card (front) -->
		<div
			class="relative w-24 h-28 bg-navy-card border-2 border-brand-blue/40 rounded-lg flex flex-col items-center justify-center gap-2"
		>
			<i class="fa-solid fa-images text-brand-blue/60 text-2xl"></i>
			<div class="flex flex-col gap-1 w-14">
				<div class="h-1 bg-brand-blue/30 rounded-full w-full"></div>
				<div class="h-1 bg-brand-blue/20 rounded-full w-2/3"></div>
			</div>
		</div>

		<!-- Quantity badge top-right -->
		<div
			class="absolute -top-2 -right-4 w-8 h-8 rounded-full bg-brand-blue/20 border-2 border-brand-blue/50 flex items-center justify-center"
		>
			<span class="text-xs font-bold text-brand-blue">×99</span>
		</div>

		<!-- Progress indicator bottom -->
		<div class="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-32">
			<div class="w-full h-1.5 bg-navy-lighter rounded-full overflow-hidden">
				<div class="h-full w-2/3 bg-brand-blue rounded-full"></div>
			</div>
			<span class="text-xs text-text-muted font-mono">66/99</span>
		</div>

		<!-- Check marks flying off left -->
		<div class="absolute top-2 -left-8 opacity-50">
			<i class="fa-solid fa-check text-brand-green text-xs"></i>
		</div>
		<div class="absolute top-8 -left-6 opacity-30">
			<i class="fa-solid fa-check text-brand-green text-xs"></i>
		</div>

		<!-- Processing circle indicator -->
		<div
			class="absolute -bottom-3 -right-6 w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center shadow-glow-blue"
		>
			<i class="fa-solid fa-bolt text-white text-sm"></i>
		</div>
	</div>
</div>
