<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import BrandLogo from '$lib/components/elements/BrandLogo.svelte';
	import FooterBrand from '$lib/components/elements/FooterBrand.svelte';
	import FooterColumn from '$lib/components/elements/FooterColumn.svelte';
	import FooterBottomBar from '$lib/components/elements/FooterBottomBar.svelte';
</script>

<!-- Desktop Footer -->
<footer class="hidden md:block w-full bg-navy-card border-t border-border mt-8">
	<div class="max-w-site mx-auto px-6 py-16">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12 gap-10 w-auto">
			<FooterBrand tagline={m.footer_tagline()} />
			<FooterColumn
				heading={m.footer_col_product()}
				headingClass="text-sm font-bold uppercase tracking-widest text-white"
				links={[
					{ href: '/features', label: m.footer_link_features() },
					{ href: '#how-it-works', label: m.footer_link_how() },
					{ href: '/pricing', label: m.footer_link_pricing() }
				]}
			/>
			<FooterColumn
				heading={m.footer_col_company()}
				headingClass="text-sm font-bold uppercase tracking-widest text-white"
				links={[
					{ href: '#', label: m.footer_link_about() },
					{ href: '#faq', label: m.footer_link_faq() },
					{ href: '#', label: m.footer_link_contact() }
				]}
			/>
		</div>
		<FooterBottomBar
			copyright={m.footer_copyright()}
			links={[
				{ href: '#', label: m.footer_legal_privacy() },
				{ href: '#', label: m.footer_legal_terms() },
				{ href: '#', label: m.footer_legal_cookies() }
			]}
		/>
	</div>
</footer>

<!-- Mobile Footer -->
<footer class="md:hidden w-full max-w-md mx-auto px-4 pb-10 pt-8 border-t border-border mt-4">
	<div class="flex flex-col items-center gap-6">
		<BrandLogo size="md" />
		<p class="text-xs text-text-muted text-center max-w-xs">
			{m.footer_tagline_mobile()}
		</p>
		<div class="flex flex-wrap justify-center gap-x-5 gap-y-2">
			<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
				>{m.footer_short_privacy()}</a
			>
			<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
				>{m.footer_short_terms()}</a
			>
			<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
				>{m.footer_short_contact()}</a
			>
			<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
				>{m.footer_short_about()}</a
			>
		</div>
		<p class="text-[10px] text-text-muted text-center">
			{m.footer_copyright()}
		</p>
	</div>
</footer>
