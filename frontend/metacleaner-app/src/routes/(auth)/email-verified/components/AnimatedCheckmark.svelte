<script lang="ts">
	type Size = 'sm' | 'lg';

	interface Props {
		size?: Size;
	}

	const { size = 'lg' }: Props = $props();

	const containerClass: Record<Size, string> = {
		sm: 'h-20 w-20',
		lg: 'h-24 w-24'
	};

	const iconClass: Record<Size, string> = {
		sm: 'text-[2.5rem]',
		lg: 'text-5xl'
	};
</script>

<div class="success-ring relative">
	<div class="pulse-glow absolute inset-0 rounded-full"></div>
	<div
		class="success-circle relative z-10 flex items-center justify-center rounded-full {containerClass[size]}"
	>
		<i class="fa-solid fa-circle-check text-brand-green {iconClass[size]}"></i>
	</div>
</div>

<style>
	.success-circle {
		background: linear-gradient(135deg, var(--color-brand-green-15), var(--color-brand-green-4));
		border: 2px solid var(--color-brand-green-35);
	}

	.success-ring {
		animation: successRing 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
	}
	@keyframes successRing {
		from {
			transform: scale(0.5);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.pulse-glow {
		animation: pulseGlow 2.5s ease-in-out infinite;
	}
	@keyframes pulseGlow {
		0%,
		100% {
			box-shadow:
				0 0 0 0 var(--color-brand-green-30),
				0 0 24px var(--color-brand-green-15);
		}
		50% {
			box-shadow:
				0 0 0 16px transparent,
				0 0 40px var(--color-brand-green-30);
		}
	}
</style>
