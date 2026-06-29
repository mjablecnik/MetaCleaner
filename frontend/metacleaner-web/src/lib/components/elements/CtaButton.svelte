<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'blue' | 'outline';
		size?: 'md' | 'sm';
		icon?: string;
		label: string;
		href?: string;
		disabled?: boolean;
		fullWidth?: boolean;
		class?: string;
		onclick?: () => void;
	}

	const {
		variant = 'primary',
		size = 'md',
		icon,
		label,
		href,
		disabled = false,
		fullWidth = false,
		class: extraClass = '',
		onclick
	}: Props = $props();

	const sizeClasses: Record<string, string> = {
		md: 'px-8 py-3.5 rounded-lg',
		sm: 'px-12 py-4 rounded-xl text-sm'
	};

	const variantClasses: Record<string, string> = {
		primary: 'bg-brand-green text-white shadow-glow-green hover:bg-green-500 transition-all',
		secondary:
			'bg-navy-lighter border border-border-strong text-white hover:bg-border transition-all',
		blue: 'bg-brand-blue text-white hover:bg-blue-600 transition-colors',
		outline: 'border border-border-strong text-white hover:bg-navy-lighter transition-colors'
	};

	const classes = $derived(
		[
			sizeClasses[size],
			'font-semibold inline-flex items-center justify-center gap-2',
			fullWidth ? 'w-full' : '',
			extraClass,
			disabled
				? 'border border-border-strong text-text-muted cursor-not-allowed'
				: (variantClasses[variant] ?? variantClasses.primary)
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href && !disabled}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a {href} class={classes}>
		{#if icon}<i class={icon}></i>{/if}
		{label}
	</a>
{:else}
	<button {disabled} {onclick} class={classes}>
		{#if icon}<i class={icon}></i>{/if}
		{label}
	</button>
{/if}
