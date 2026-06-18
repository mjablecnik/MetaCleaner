<script lang="ts">
	interface Props {
		label: string;
		size?: 'sm' | 'xs';
	}

	const { label, size = 'sm' }: Props = $props();

	const sizeClasses = {
		sm: 'px-2 py-1 text-badge',
		xs: 'px-1.5 py-0.5 text-badge-xs'
	} as const;
</script>

<span class="rounded bg-navy-lighter font-bold text-text-main uppercase {sizeClasses[size]}"
	>{label}</span
>
