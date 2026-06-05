<script lang="ts">
	type Size = 'sm' | 'lg';

	interface Props {
		size?: Size;
	}

	const { size = 'lg' }: Props = $props();

	const ringClass: Record<Size, string> = {
		sm: 'w-16 h-16',
		lg: 'w-24 h-24'
	};

	const shieldClass: Record<Size, string> = {
		sm: 'w-14 h-14',
		lg: 'w-20 h-20'
	};

	const iconClass: Record<Size, string> = {
		sm: 'text-2xl',
		lg: 'text-4xl'
	};

	const badgeClass: Record<Size, string> = {
		sm: '-top-0.5 -right-0.5 w-5 h-5',
		lg: '-top-1 -right-1 w-6 h-6'
	};

	const badgeIconClass: Record<Size, string> = {
		sm: 'text-[9px]',
		lg: 'text-[10px]'
	};
</script>

<div class="relative flex items-center justify-center" class:flex-shrink-0={size === 'sm'}>
	<div
		class="pulse-ring absolute {ringClass[size]} rounded-full border-2 border-brand-blue/20"
	></div>
	<div
		class="{shieldClass[
			size
		]} flex items-center justify-center rounded-full border-2 border-brand-blue/40 bg-brand-blue/10"
	>
		<i class="fa-solid fa-shield-halved text-brand-blue {iconClass[size]}"></i>
	</div>
	<div
		class="absolute {badgeClass[size]} flex items-center justify-center rounded-full bg-brand-blue"
	>
		<i class="fa-solid fa-circle-notch spin-slow text-white {badgeIconClass[size]}"></i>
	</div>
</div>
