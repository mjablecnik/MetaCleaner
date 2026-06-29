<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';

	const CONSENT_KEY = 'cookie_consent';

	let visible = $state(false);

	onMount(() => {
		try {
			const stored = localStorage.getItem(CONSENT_KEY);
			if (stored === null) {
				visible = true;
			}
		} catch {
			visible = true;
		}
	});

	function accept() {
		try {
			localStorage.setItem(CONSENT_KEY, 'accepted');
		} catch {
			// private browsing — proceed without storing
		}
		visible = false;
	}

	function reject() {
		try {
			localStorage.setItem(CONSENT_KEY, 'rejected');
		} catch {
			// private browsing — proceed without storing
		}
		visible = false;
	}
</script>

{#if visible}
	<div
		class="fixed bottom-0 left-0 right-0 z-50 bg-navy-card border-t border-border px-4 py-4 transition-all duration-300"
		role="region"
		aria-label={m.cookie_banner_aria_label()}
	>
		<div class="max-w-site mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
			<p class="text-sm text-text-muted text-center sm:text-left">
				{m.cookie_banner_text()}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/privacy" class="text-brand-blue hover:underline ml-1"
					>{m.cookie_banner_privacy_link()}</a
				>
			</p>
			<div class="flex items-center gap-2 shrink-0">
				<button
					onclick={reject}
					class="px-4 py-2 text-sm font-semibold rounded-lg border border-border-strong text-white hover:bg-navy-lighter transition-colors"
				>
					{m.cookie_banner_reject()}
				</button>
				<button
					onclick={accept}
					class="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-blue text-white hover:bg-blue-600 transition-colors"
				>
					{m.cookie_banner_accept()}
				</button>
			</div>
		</div>
	</div>
{/if}
