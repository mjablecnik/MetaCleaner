<script lang="ts">
	interface Props {
		id?: string;
		label?: string;
		type?: string;
		value: string;
		placeholder?: string;
		error?: string;
		icon?: string;
		disabled?: boolean;
	}

	let {
		id,
		label,
		type = 'text',
		value = $bindable(),
		placeholder = '',
		error = '',
		icon,
		disabled = false
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
	{#if label}
		<label for={id} class="text-sm font-medium text-white">{label}</label>
	{/if}
	<div class="relative">
		{#if icon}
			<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
				<i class={icon}></i>
			</span>
		{/if}
		<input
			{id}
			{type}
			{disabled}
			bind:value
			{placeholder}
			class="min-h-[44px] w-full rounded-xl border py-3 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 {icon
				? 'pl-10 pr-4'
				: 'px-4'}"
			style="background: var(--color-navy-main); border-color: {borderColor};"
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
		/>
	</div>
	{#if error}
		<span class="text-[12px] text-brand-red">
			<i class="fa-solid fa-circle-exclamation mr-1"></i>{error}
		</span>
	{/if}
</div>
