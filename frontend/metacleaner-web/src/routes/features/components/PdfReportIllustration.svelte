<div class="relative w-48 h-48 flex items-center justify-center">
	<div class="relative flex flex-col items-center">
		<!-- PDF document card -->
		<div
			class="w-28 h-36 bg-navy-card border-2 border-brand-blue/40 rounded-lg flex flex-col items-center pt-3 gap-2 relative"
		>
			<!-- PDF badge corner -->
			<div
				class="absolute -top-1 -right-1 w-8 h-5 bg-brand-red rounded-tr-lg rounded-bl-lg flex items-center justify-center"
			>
				<span class="text-badge-xs font-bold text-white">PDF</span>
			</div>

			<!-- Report content lines -->
			<div class="flex flex-col gap-1.5 w-18 px-3 mt-2">
				<div class="h-1.5 bg-brand-blue/30 rounded-full w-full"></div>
				<div class="h-1.5 bg-brand-blue/20 rounded-full w-4/5"></div>
				<div class="h-1.5 bg-brand-green/30 rounded-full w-3/5"></div>
				<div class="h-1.5 bg-brand-blue/15 rounded-full w-full"></div>
				<div class="h-1.5 bg-brand-orange/30 rounded-full w-2/3"></div>
			</div>

			<!-- QR code placeholder -->
			<div class="w-10 h-10 bg-white/90 rounded-sm flex items-center justify-center mt-auto mb-2">
				<i class="fa-solid fa-qrcode text-navy-main text-lg"></i>
			</div>
		</div>

		<!-- Share badge top-left -->
		<div
			class="absolute -top-2 -left-10 flex items-center gap-1 bg-brand-blue/20 border border-brand-blue/40 rounded-md px-2 py-0.5 opacity-70"
		>
			<i class="fa-solid fa-share-nodes text-brand-blue text-xs"></i>
			<span class="text-xs text-brand-blue font-mono">URL</span>
		</div>

		<!-- Certificate badge bottom-left -->
		<div
			class="absolute bottom-6 -left-10 flex items-center gap-1 bg-brand-green/20 border border-brand-green/40 rounded-md px-2 py-0.5 opacity-60"
		>
			<i class="fa-solid fa-circle-check text-brand-green text-xs"></i>
			<span class="text-xs text-brand-green font-mono">OK</span>
		</div>

		<!-- Download action circle -->
		<div
			class="absolute -bottom-3 -right-4 w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center shadow-glow-blue"
		>
			<i class="fa-solid fa-download text-white text-sm"></i>
		</div>
	</div>
</div>
