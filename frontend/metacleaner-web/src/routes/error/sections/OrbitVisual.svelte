<div class="float-anim relative flex items-center justify-center w-80 h-80 md:w-96 md:h-96">
	<!-- Outer ring (clockwise, 18s) -->
	<div
		class="orbit-ring orbit-ring--outer absolute inset-0 rounded-full border-2 border-dashed border-brand-blue/30"
	>
		<!-- Blue glowing dot on outer ring -->
		<div
			class="orbit-dot absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-blue shadow-[0_0_8px_3px_rgba(59,130,246,0.6)]"
		></div>
	</div>

	<!-- Inner ring (counter-clockwise, 28s) -->
	<div
		class="orbit-ring orbit-ring--inner absolute inset-8 md:inset-10 rounded-full border-2 border-dashed border-brand-red/30"
	>
		<!-- Red glowing dot on inner ring -->
		<div
			class="orbit-dot absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand-red shadow-[0_0_8px_3px_rgba(239,68,68,0.6)]"
		></div>
	</div>

	<!-- Center card -->
	<div
		class="relative z-10 flex items-center justify-center w-24 h-24 rounded-2xl bg-navy-card border border-border shadow-lg"
	>
		<i class="fa-solid fa-triangle-exclamation text-brand-red text-4xl"></i>
	</div>
</div>

<style>
	@keyframes spin-cw {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes spin-ccw {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(-360deg);
		}
	}

	@keyframes float-y {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-12px);
		}
	}

	.float-anim {
		animation: float-y 5s ease-in-out infinite;
	}

	.orbit-ring--outer {
		animation: spin-cw 18s linear infinite;
	}

	.orbit-ring--inner {
		animation: spin-ccw 28s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.float-anim,
		.orbit-ring--outer,
		.orbit-ring--inner {
			animation-duration: 0ms !important;
		}
	}
</style>
