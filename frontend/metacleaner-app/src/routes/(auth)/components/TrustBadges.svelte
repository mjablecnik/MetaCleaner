<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}
</script>

<div class="mt-4 flex flex-wrap items-center justify-center gap-4 lg:mt-5 lg:gap-5">
	<div class="flex items-center gap-1.5 text-xs text-text-muted">
		<i class="fa-solid fa-shield-halved text-sm text-brand-green"></i>
		<span class="lg:hidden">{tx('auth.common.trust.sslShort')}</span>
		<span class="hidden lg:inline">{tx('auth.common.trust.ssl')}</span>
	</div>
	<div class="h-3 w-px bg-gray-700"></div>
	<div class="flex items-center gap-1.5 text-xs text-text-muted">
		<i class="fa-solid fa-user-shield text-sm text-brand-blue"></i>
		<span class="lg:hidden">{tx('auth.common.trust.gdprShort')}</span>
		<span class="hidden lg:inline">{tx('auth.common.trust.gdpr')}</span>
	</div>
	<div class="h-3 w-px bg-gray-700"></div>
	<div class="flex items-center gap-1.5 text-xs text-text-muted">
		<i class="fa-solid fa-lock text-sm text-text-muted"></i>
		<span>{tx('auth.common.trust.noTracking')}</span>
	</div>
</div>
