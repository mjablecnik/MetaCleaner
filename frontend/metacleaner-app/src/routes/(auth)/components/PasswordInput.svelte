<script lang="ts">
	interface Props {
		id?: string;
		value: string;
		placeholder?: string;
		error?: string;
		visible?: boolean;
		showToggle?: boolean;
		onToggle?: () => void;
		ariaShowLabel?: string;
		ariaHideLabel?: string;
	}

	let {
		id,
		value = $bindable(),
		placeholder = '••••••••',
		error = '',
		visible = false,
		showToggle = true,
		onToggle,
		ariaShowLabel = 'Show password',
		ariaHideLabel = 'Hide password'
	}: Props = $props();

	let isFocused = $state(false);

	const borderColor = $derived(
		error
			? 'var(--color-brand-red)'
			: isFocused
				? 'var(--color-brand-blue)'
				: 'var(--color-navy-lighter)'
	);
</script>

<div class="flex flex-col gap-1.5">
	<div class="relative">
		<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
			<i class="fa-solid fa-lock"></i>
		</span>
		<input
			{id}
			type={visible ? 'text' : 'password'}
			bind:value
			{placeholder}
			class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 {showToggle
				? 'pr-12'
				: 'pr-4'} text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
			style="background: var(--color-navy-main); border-color: {borderColor};"
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
		/>
		{#if showToggle && onToggle}
			<button
				type="button"
				onclick={onToggle}
				aria-label={visible ? ariaHideLabel : ariaShowLabel}
				class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-sm text-text-muted transition-colors hover:text-white"
			>
				<i class={visible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
			</button>
		{/if}
	</div>
	{#if error}
		<span class="text-[12px] text-brand-red">
			<i class="fa-solid fa-circle-exclamation mr-1"></i>{error}
		</span>
	{/if}
</div>
