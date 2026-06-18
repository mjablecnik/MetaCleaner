<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'blue' | 'outline';
		icon?: string;
		label: string;
		href?: string;
		disabled?: boolean;
		fullWidth?: boolean;
		onclick?: () => void;
	}

	const {
		variant = 'primary',
		icon,
		label,
		href,
		disabled = false,
		fullWidth = false,
		onclick
	}: Props = $props();

	const variantClasses: Record<string, string> = {
		primary: 'bg-brand-green text-white shadow-glow-green hover:bg-green-500 transition-all',
		secondary: 'bg-navy-lighter border border-border-strong text-white hover:bg-border transition-all',
		blue: 'bg-brand-blue text-white hover:bg-blue-600 transition-colors',
		outline: 'border border-border-strong text-white hover:bg-navy-lighter transition-colors'
	};

	const classes = $derived(
		[
			'px-8 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2',
			fullWidth ? 'w-full' : '',
			disabled
				? 'border border-border-strong text-text-muted cursor-not-allowed'
				: (variantClasses[variant] ?? variantClasses.primary)
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href && !disabled}
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
