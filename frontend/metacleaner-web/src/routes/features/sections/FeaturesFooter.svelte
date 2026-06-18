<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import FooterBrand from '$lib/components/elements/FooterBrand.svelte';
	import FooterColumn from '$lib/components/elements/FooterColumn.svelte';
	import FooterBottomBar from '$lib/components/elements/FooterBottomBar.svelte';
	import SocialIconLink from '$lib/components/elements/SocialIconLink.svelte';
	import BrandLogo from '$lib/components/elements/BrandLogo.svelte';
</script>

<!-- Desktop Footer -->
<footer class="hidden md:block w-full border-t border-border mt-8">
	<div class="w-full max-w-site mx-auto px-6 py-12">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
			<div class="flex flex-col gap-4 md:col-span-1">
				<FooterBrand tagline={m.footer_tagline_features()} />
				<div class="flex items-center gap-3 mt-1">
					<SocialIconLink icon="fa-brands fa-twitter" href="#" />
					<SocialIconLink icon="fa-brands fa-github" href="#" />
					<SocialIconLink icon="fa-brands fa-linkedin" href="#" />
				</div>
			</div>
			<FooterColumn
				heading={m.footer_col_product()}
				links={[
					{ href: '/#how-it-works', label: m.footer_link_how() },
					{ href: '/features', label: m.footer_link_features() },
					{ href: '/pricing', label: m.footer_link_pricing() },
					{ href: '/#faq', label: m.footer_link_faq() }
				]}
			/>
			<FooterColumn
				heading={m.footer_col_features()}
				links={[
					{ href: '#feature-exif', label: 'EXIF Removal' },
					{ href: '#feature-ai', label: 'AI Detection' },
					{ href: '#feature-c2pa', label: 'C2PA Removal' },
					{ href: '#feature-risk', label: 'Risk Scanner' },
					{ href: '#feature-batch', label: 'Batch Processing' },
					{ href: '#feature-pdf', label: 'PDF Report' }
				]}
			/>
			<FooterColumn
				heading={m.footer_col_legal()}
				links={[
					{ href: '#', label: m.footer_legal_privacy() },
					{ href: '#', label: m.footer_legal_terms() },
					{ href: '#', label: 'GDPR' },
					{ href: '#', label: m.footer_link_contact() }
				]}
			/>
		</div>
		<FooterBottomBar copyright={m.footer_copyright()} madeWith pt="pt-6" />
	</div>
</footer>

<!-- Mobile Footer -->
<footer class="md:hidden w-full border-t border-border">
	<div class="px-4 py-8">
		<div class="mb-4">
			<BrandLogo size="md" />
		</div>
		<p class="text-text-muted text-sm leading-relaxed mb-4">
			{m.footer_tagline_features()}
		</p>
		<div class="flex items-center gap-2 mb-6">
			<SocialIconLink icon="fa-brands fa-twitter" href="#" />
			<SocialIconLink icon="fa-brands fa-github" href="#" />
			<SocialIconLink icon="fa-brands fa-linkedin" href="#" />
		</div>
	</div>
</footer>
