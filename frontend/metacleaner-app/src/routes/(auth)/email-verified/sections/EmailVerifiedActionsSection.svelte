<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import ActionCard from '../components/ActionCard.svelte';
</script>

<!-- Mobile: What's next divider + action cards -->
<div class="mt-5 flex flex-col gap-3 lg:hidden">
	<div class="flex items-center gap-3">
		<div class="h-px flex-1 bg-gray-800"></div>
		<span class="text-xs font-medium text-text-muted"
			>{tx('auth.emailVerified.whatsNext.divider')}</span
		>
		<div class="h-px flex-1 bg-gray-800"></div>
	</div>
	<ActionCard
		href="/"
		icon="fa-solid fa-broom"
		iconColorClass="text-brand-green"
		bgClass="bg-brand-green-10"
		title={tx('auth.emailVerified.action.cleanTitle')}
		description={tx('auth.emailVerified.action.cleanDesc')}
		variant="highlighted"
	/>
	<ActionCard
		icon="fa-solid fa-crown"
		iconColorClass="text-brand-orange"
		bgClass="bg-brand-orange-10"
		title={tx('auth.emailVerified.action.proTitle')}
		description={tx('auth.emailVerified.action.proDesc')}
		badge={tx('auth.emailVerified.action.proBadge')}
		badgeBgClass="bg-brand-orange-15"
	/>
</div>

<!-- Mobile: CTA buttons -->
<div class="mt-5 flex flex-col gap-3 pt-1 lg:hidden">
	<a
		href={resolve('/' as import('$app/types').Pathname)}
		class="cta-btn flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl py-4 text-base font-bold text-white shadow-glow-green"
	>
		<i class="fa-solid fa-shield-halved"></i>
		{tx('auth.emailVerified.cta.login')}
	</a>
	<button
		class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-colors active:bg-gray-800"
	>
		<i class="fa-solid fa-download text-text-muted"></i>
		{tx('auth.emailVerified.cta.ebook')}
	</button>
</div>

<!-- Desktop: divider + action cards + CTA buttons (rendered inside the success card) -->
<div class="hidden flex-col gap-7 lg:flex">
	<div class="flex items-center gap-3">
		<div class="h-px flex-1 bg-gray-800"></div>
		<span class="text-xs font-medium text-text-muted"
			>{tx('auth.emailVerified.whatsNext.divider')}</span
		>
		<div class="h-px flex-1 bg-gray-800"></div>
	</div>
	<div class="flex flex-col gap-2.5">
		<ActionCard
			href="/"
			icon="fa-solid fa-broom"
			iconColorClass="text-brand-green"
			bgClass="bg-brand-green-10"
			title={tx('auth.emailVerified.action.cleanTitle')}
			description={tx('auth.emailVerified.action.cleanDesc')}
			variant="highlighted"
		/>
		<ActionCard
			icon="fa-solid fa-crown"
			iconColorClass="text-brand-orange"
			bgClass="bg-brand-orange-10"
			title={tx('auth.emailVerified.action.proTitle')}
			description={tx('auth.emailVerified.action.proDesc')}
			badge={tx('auth.emailVerified.action.proBadge')}
			badgeBgClass="bg-brand-orange-15"
		/>
	</div>
	<div class="flex flex-col gap-3">
		<a
			href={resolve('/' as import('$app/types').Pathname)}
			class="cta-btn flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold text-white shadow-glow-green"
		>
			<i class="fa-solid fa-shield-halved"></i>
			{tx('auth.emailVerified.cta.login')}
		</a>
		<button
			class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
		>
			<i class="fa-solid fa-download text-text-muted"></i>
			{tx('auth.emailVerified.cta.ebook')}
		</button>
	</div>
</div>

<style>
	.cta-btn {
		background: linear-gradient(
			135deg,
			var(--color-brand-green) 0%,
			var(--color-brand-green-dark) 100%
		);
		transition: all 0.2s ease;
	}
	.cta-btn:hover {
		background: linear-gradient(
			135deg,
			var(--color-brand-green-dark) 0%,
			var(--color-brand-green-darker) 100%
		);
		transform: translateY(-1px);
		box-shadow: 0 8px 24px var(--color-brand-green-40);
	}
	.cta-btn:active {
		background: linear-gradient(
			135deg,
			var(--color-brand-green-dark) 0%,
			var(--color-brand-green-darker) 100%
		);
		transform: scale(0.98);
		box-shadow: 0 8px 24px var(--color-brand-green-40);
	}
</style>
