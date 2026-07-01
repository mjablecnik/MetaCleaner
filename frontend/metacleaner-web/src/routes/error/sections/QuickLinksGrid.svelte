<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import QuickLinkCard from '../components/QuickLinkCard.svelte';

	const links = [
		{
			href: '/',
			icon: 'fa-solid fa-cloud-arrow-up',
			label: m.error_404_link_try_free(),
			hoverColor: 'brand-green' as const
		},
		{
			href: '/features',
			icon: 'fa-solid fa-star',
			label: m.error_404_link_features(),
			hoverColor: 'brand-blue' as const
		},
		{
			href: '/pricing',
			icon: 'fa-solid fa-tag',
			label: m.error_404_link_pricing(),
			hoverColor: 'brand-orange' as const
		},
		{
			href: '/#faq',
			icon: 'fa-solid fa-circle-question',
			label: m.error_404_link_faq(),
			hoverColor: 'brand-blue' as const
		}
	];
</script>

<div>
	<p class="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
		{m.error_404_links_label()}
	</p>
	<div class="grid grid-cols-4 gap-3">
		{#each links as link (link.href)}
			<QuickLinkCard
				href={link.href}
				icon={link.icon}
				label={link.label}
				hoverColor={link.hoverColor}
			/>
		{/each}
	</div>
</div>
