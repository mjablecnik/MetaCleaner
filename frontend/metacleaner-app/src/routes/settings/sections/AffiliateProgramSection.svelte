<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { AffiliateStats } from '$lib/repositories/settingsRepository';

	const defaultStats: AffiliateStats = {
		referrals: 0,
		conversions: 0,
		earnings: '€0',
		affiliateLink: 'https://metacleaner.com/ref/...'
	};

	interface Props {
		affiliateStats?: AffiliateStats;
		onCopy?: (text: string, msg: string) => void;
	}

	let { affiliateStats = defaultStats, onCopy }: Props = $props();

	function handleCopyLink() {
		if (onCopy) {
			onCopy(affiliateStats.affiliateLink, tx('settings.affiliate.linkCopied'));
		} else {
			navigator.clipboard.writeText(affiliateStats.affiliateLink).catch(() => {});
		}
	}
</script>

<!-- Stats grid -->
<div class="grid grid-cols-3 gap-2 lg:gap-3">
	<div class="rounded-xl border border-gray-800 bg-navy-main p-3 text-center">
		<p class="text-2xl font-black text-brand-orange">{affiliateStats.referrals}</p>
		<p class="mt-0.5 text-[10px] text-text-muted">{tx('settings.affiliate.referralsLabel')}</p>
	</div>
	<div class="rounded-xl border border-gray-800 bg-navy-main p-3 text-center">
		<p class="text-2xl font-black text-brand-green">{affiliateStats.conversions}</p>
		<p class="mt-0.5 text-[10px] text-text-muted">{tx('settings.affiliate.conversionsLabel')}</p>
	</div>
	<div class="rounded-xl border border-gray-800 bg-navy-main p-3 text-center">
		<p class="text-2xl font-black text-white">{affiliateStats.earnings}</p>
		<p class="mt-0.5 text-[10px] text-text-muted">{tx('settings.affiliate.earningsLabel')}</p>
	</div>
</div>

<!-- Affiliate link -->
<div class="flex flex-col gap-1.5">
	<label class="text-xs font-semibold tracking-wider text-text-muted uppercase"
		>{tx('settings.affiliate.linkLabel')}</label
	>
	<div class="flex gap-2">
		<input
			type="text"
			readonly
			value={affiliateStats.affiliateLink}
			class="min-w-0 flex-1 rounded-xl border border-gray-700 bg-navy-main px-3 py-2.5 font-mono text-sm text-text-muted focus:outline-none lg:px-4"
		/>
		<button
			type="button"
			onclick={handleCopyLink}
			class="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-2.5 text-sm font-bold whitespace-nowrap text-brand-orange transition-colors hover:bg-brand-orange/20"
		>
			<i class="fa-solid fa-copy text-xs"></i>
			{tx('settings.affiliate.copyButton')}
		</button>
	</div>
</div>

<!-- Commission info -->
<div class="flex items-start gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange/5 p-3">
	<i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0 text-sm text-brand-orange"></i>
	<p class="text-xs leading-relaxed text-text-muted">
		{tx('settings.affiliate.commissionInfoPre')}
		<span class="font-semibold text-brand-orange">{tx('settings.affiliate.commissionRate')}</span>
		{tx('settings.affiliate.commissionInfoPost')}
	</p>
</div>
