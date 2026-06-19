<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import BrandLogo from '$lib/components/elements/BrandLogo.svelte';
	import FooterBrand from '$lib/components/elements/FooterBrand.svelte';
	import FooterColumn from '$lib/components/elements/FooterColumn.svelte';
	import FooterBottomBar from '$lib/components/elements/FooterBottomBar.svelte';
	import SocialIconLink from '$lib/components/elements/SocialIconLink.svelte';
</script>

<footer class="w-full bg-navy-card border-t border-border mt-8">
	<!-- Desktop layout -->
	<div class="hidden md:block max-w-site mx-auto px-6 py-16">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
			<div class="flex flex-col gap-4 md:col-span-1">
				<FooterBrand tagline={m.footer_tagline()} />
				<div class="flex items-center gap-3 mt-1">
					<SocialIconLink icon="fa-brands fa-twitter" href="#" />
					<SocialIconLink icon="fa-brands fa-github" href="#" />
					<SocialIconLink icon="fa-brands fa-linkedin" href="#" />
				</div>
			</div>
			<FooterColumn
				heading={m.footer_col_product()}
				headingClass="text-sm font-bold uppercase tracking-widest text-white"
				links={[
					{ href: '/features', label: m.footer_link_features() },
					{ href: '/#how-it-works', label: m.footer_link_how() },
					{ href: '/pricing', label: m.footer_link_pricing() }
				]}
			/>
			<FooterColumn
				heading={m.footer_col_company()}
				headingClass="text-sm font-bold uppercase tracking-widest text-white"
				links={[
					{ href: '#', label: m.footer_link_about() },
					{ href: '/#faq', label: m.footer_link_faq() },
					{ href: '#', label: m.footer_link_contact() }
				]}
			/>
			<FooterColumn
				heading={m.footer_col_legal()}
				headingClass="text-sm font-bold uppercase tracking-widest text-white"
				links={[
					{ href: '/privacy', label: m.footer_legal_privacy() },
					{ href: '/terms', label: m.footer_legal_terms() }
				]}
			/>
		</div>
		<FooterBottomBar
			copyright={m.footer_copyright()}
			madeWith
		/>
	</div>

	<!-- Mobile layout -->
	<div class="md:hidden w-full max-w-md mx-auto px-4 pb-10 pt-8">
		<div class="flex flex-col items-center gap-6">
			<BrandLogo size="md" />
			<p class="text-xs text-text-muted text-center max-w-xs">
				{m.footer_tagline()}
			</p>
			<div class="flex items-center gap-3">
				<SocialIconLink icon="fa-brands fa-twitter" href="#" />
				<SocialIconLink icon="fa-brands fa-github" href="#" />
				<SocialIconLink icon="fa-brands fa-linkedin" href="#" />
			</div>
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
	</div>
</footer>
