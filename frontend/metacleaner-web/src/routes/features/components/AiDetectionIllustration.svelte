<div class="relative w-48 h-48 flex items-center justify-center">
	<div class="relative flex flex-col items-center">
		<!-- Main image card -->
		<div
			class="w-28 h-32 bg-navy-card border-2 border-brand-orange/40 rounded-lg flex flex-col items-center justify-center gap-2 relative"
		>
			<i class="fa-solid fa-image text-brand-orange/50 text-3xl"></i>
			<div class="flex flex-col gap-1 w-16">
				<div class="h-1.5 bg-brand-orange/30 rounded-full w-full"></div>
				<div class="h-1.5 bg-brand-orange/20 rounded-full w-2/3"></div>
			</div>
		</div>

		<!-- AI badge top-left -->
		<div
			class="absolute -top-2 -left-10 flex items-center gap-1 bg-brand-orange/20 border border-brand-orange/40 rounded-md px-2 py-0.5"
		>
			<i class="fa-solid fa-robot text-brand-orange text-xs"></i>
			<span class="text-xs text-brand-orange font-mono font-bold">AI</span>
		</div>

		<!-- Scan lines overlay -->
		<div
			class="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-brand-orange/60 rounded-full animate-pulse"
		></div>
		<div
			class="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-brand-orange/30 rounded-full"
		></div>
		<div
			class="absolute top-14 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-brand-orange/20 rounded-full"
		></div>

		<!-- Detection result badge top-right -->
		<div
			class="absolute -top-3 -right-12 flex items-center gap-1 bg-brand-red/20 border border-brand-red/40 rounded-md px-2 py-0.5 opacity-80"
		>
			<i class="fa-solid fa-triangle-exclamation text-brand-red text-xs"></i>
			<span class="text-xs text-brand-red font-mono">DALL-E</span>
		</div>

		<!-- Midjourney tag bottom-left -->
		<div
			class="absolute bottom-6 -left-14 flex items-center gap-1 bg-text-muted/10 border border-text-muted/30 rounded-md px-2 py-0.5 opacity-50"
		>
			<i class="fa-solid fa-wand-magic-sparkles text-text-muted text-xs"></i>
			<span class="text-xs text-text-muted font-mono">MJ</span>
		</div>

		<!-- Detection circle indicator -->
		<div
			class="absolute -bottom-4 -right-4 w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center shadow-glow-blue"
		>
			<i class="fa-solid fa-magnifying-glass text-white text-sm"></i>
		</div>
	</div>
</div>
