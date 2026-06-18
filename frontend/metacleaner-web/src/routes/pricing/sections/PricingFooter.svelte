<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import FooterBottomBar from '$lib/components/elements/FooterBottomBar.svelte';
</script>

<footer class="w-full bg-navy-card border-t border-border mt-auto">
	<div class="max-w-site mx-auto px-6 py-8">
		<FooterBottomBar
			copyright={m.footer_copyright()}
			links={[
				{ href: '#', label: m.footer_legal_privacy() },
				{ href: '#', label: m.footer_legal_terms() }
			]}
			showBorder={false}
			pt="pt-0"
		/>
	</div>
</footer>
