<script lang="ts">
	interface Props {
		text: string;
		emphasis?: boolean;
		color?: 'green' | 'blue';
		size?: 'sm' | 'xs';
	}

	const { text, emphasis = false, color = 'green', size = 'sm' }: Props = $props();

	const iconColorMap = {
		green: 'text-brand-green',
		blue: 'text-brand-blue'
	} as const;

	const iconSizeMap = {
		sm: 'text-sm',
		xs: 'text-xs'
	} as const;

	const textClass = $derived(
		emphasis ? 'font-medium' : 'text-text-muted'
	);
	const iconClass = $derived(`${iconColorMap[color]} ${iconSizeMap[size]}`);
</script>

<li class="flex items-start gap-2.5">
	<i class="fa-solid fa-check mt-0.5 {iconClass}"></i>
	<span class="text-sm {textClass}">{text}</span>
</li>
