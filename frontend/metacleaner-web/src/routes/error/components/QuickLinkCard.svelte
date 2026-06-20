<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	interface Props {
		href: string;
		icon: string;
		label: string;
		hoverColor: 'brand-blue' | 'brand-green' | 'brand-orange';
	}

	const { href, icon, label, hoverColor }: Props = $props();

	const resolvedHref = $derived.by(() => {
		const [path, hash] = href.split('#');
		return hash ? `${resolve(path as Pathname)}#${hash}` : resolve(href as Pathname);
	});

	const borderClass = $derived(
		{
			'brand-blue': 'hover:border-brand-blue/50',
			'brand-green': 'hover:border-brand-green/50',
			'brand-orange': 'hover:border-brand-orange/50'
		}[hoverColor]
	);

	const iconClass = $derived(
		{
			'brand-blue': 'text-brand-blue bg-brand-blue/10',
			'brand-green': 'text-brand-green bg-brand-green/10',
			'brand-orange': 'text-brand-orange bg-brand-orange/10'
		}[hoverColor]
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
	href={resolvedHref}
	class="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-navy-card border border-border transition-colors duration-200 min-h-[44px] min-w-[44px] {borderClass}"
>
	<div class="w-10 h-10 rounded-lg flex items-center justify-center {iconClass}">
		<i class="{icon} text-sm"></i>
	</div>
	<span class="text-sm font-medium text-white">{label}</span>
</a>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
