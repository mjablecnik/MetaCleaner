<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import MethodBadge from '$lib/shared/elements/MethodBadge.svelte';
	import type { SidebarSection, SidebarEndpoint } from '$lib/repositories/docsRepository';

	interface Props {
		sections: SidebarSection[];
		endpoints: SidebarEndpoint[];
		activeId: string;
		onNavigate: (id: string) => void;
	}

	const { sections, endpoints, activeId, onNavigate }: Props = $props();
</script>

<nav class="w-56 shrink-0">
	<ul class="flex flex-col gap-0.5">
		{#each sections as section (section.id)}
			<li>
				<button
					onclick={() => onNavigate(section.id)}
					class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200
						{activeId === section.id
						? 'font-semibold text-brand-blue'
						: 'text-text-muted hover:text-white'}"
				>
					<i class="fa-solid {section.icon} w-4 text-center text-xs"></i>
					<span>{tx(section.labelKey)}</span>
				</button>
			</li>
		{/each}

		{#if endpoints.length > 0}
			<li class="mt-2">
				<p class="mb-1 px-3 text-[10px] font-bold tracking-widest text-text-muted/60 uppercase">
					{tx('docs.sidebar.endpointsHeading')}
				</p>
			</li>
			{#each endpoints as endpoint (endpoint.id)}
				<li>
					<button
						onclick={() => onNavigate(endpoint.id)}
						class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200
							{activeId === endpoint.id
							? 'font-semibold text-brand-blue'
							: 'text-text-muted hover:text-white'}"
					>
						<span><MethodBadge method={endpoint.method} size="sm" /></span>
						<span>{endpoint.label}</span>
					</button>
				</li>
			{/each}
		{/if}
	</ul>
</nav>
