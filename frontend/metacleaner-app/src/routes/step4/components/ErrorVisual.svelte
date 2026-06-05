<script lang="ts">
	type Size = 'sm' | 'lg';

	interface Props {
		size?: Size;
	}

	const { size = 'lg' }: Props = $props();

	const ringClass: Record<Size, string> = {
		sm: 'w-20 h-20',
		lg: 'w-24 h-24'
	};

	const circleClass: Record<Size, string> = {
		sm: 'w-16 h-16',
		lg: 'w-20 h-20'
	};

	const iconClass: Record<Size, string> = {
		sm: 'text-3xl',
		lg: 'text-4xl'
	};

	const badgeClass: Record<Size, string> = {
		sm: '-top-1 -right-1 w-5 h-5',
		lg: '-top-1 -right-1 w-6 h-6'
	};

	const badgeIconClass: Record<Size, string> = {
		sm: 'text-[9px]',
		lg: 'text-[10px]'
	};
</script>

<div class="relative flex items-center justify-center" class:flex-shrink-0={size === 'sm'}>
	<div
		class="pulse-ring absolute {ringClass[size]} rounded-full border-2 border-brand-red/20"
	></div>
	<div
		class="{circleClass[
			size
		]} shake flex items-center justify-center rounded-full border-2 border-brand-red/40 bg-brand-red/10"
	>
		<i class="fa-solid fa-triangle-exclamation text-brand-red {iconClass[size]}"></i>
	</div>
	<div
		class="absolute {badgeClass[size]} flex items-center justify-center rounded-full bg-brand-red"
	>
		<i class="fa-solid fa-xmark text-white {badgeIconClass[size]}"></i>
	</div>
</div>
