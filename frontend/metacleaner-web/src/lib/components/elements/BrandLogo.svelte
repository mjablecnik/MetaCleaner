<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		href?: string;
	}

	const { size = 'md', href = '/' }: Props = $props();

	const sizeMap = {
		sm: { container: 'w-8 h-8', icon: 'text-sm', text: 'text-base', gap: 'gap-2' },
		md: { container: 'w-9 h-9', icon: 'text-base', text: 'text-lg', gap: 'gap-2' },
		lg: { container: 'w-10 h-10', icon: 'text-xl', text: 'text-xl', gap: 'gap-3' }
	} as const;

	const s = $derived(sizeMap[size]);
</script>

<a {href} class="flex items-center {s.gap}">
	<div
		class="{s.container} rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
	>
		<i class="fa-solid fa-shield-halved {s.icon}"></i>
	</div>
	<span class="{s.text} font-bold tracking-tight">MetaCleaner</span>
</a>
