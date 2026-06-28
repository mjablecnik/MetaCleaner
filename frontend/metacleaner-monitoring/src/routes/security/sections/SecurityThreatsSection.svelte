<script lang="ts">
	import { t } from '$lib/i18n';
	import { getAttackTypes, getActiveThreats } from '$lib/repositories/securityRepository';
	import ThreatItem from '../components/ThreatItem.svelte';

	const attackTypes = getAttackTypes();
	const activeThreats = getActiveThreats();
</script>

<!-- ===== DESKTOP: Attack Types + Active Threats (3-col grid) ===== -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain mb-1">{t('security_attackTypes_title')}</h3>
		<p class="text-xs text-textSec mb-4">{t('security_attackTypes_subtitle')}</p>
		<div id="chart-attack-pie" class="h-[200px] w-full"></div>
		<div class="mt-4 space-y-2">
			{#each attackTypes as attack (attack.id)}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color:{attack.color}"></span>
						<span class="text-textSec">{attack.label}</span>
					</div>
					<span class="text-textMain font-medium">{attack.percent}%</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="bg-card border border-surface rounded-xl p-5 lg:col-span-2">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('security_threats_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('security_threats_subtitle')}</p>
			</div>
			<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('security_threats_badge')}</span>
		</div>
		<div class="space-y-3">
			{#each activeThreats as threat (threat.id)}
				<ThreatItem {threat} variant="desktop" />
			{/each}
		</div>
	</div>
</section>

<!-- ===== MOBILE: Active Threats ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<div class="px-4 pt-4 pb-3 flex items-center justify-between border-b border-surface">
		<div>
			<h3 class="text-base font-semibold text-textMain">{t('security_threats_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('security_threats_subtitle')}</p>
		</div>
		<span class="flex items-center gap-1.5 text-xs text-error bg-error/10 border border-error/20 px-2.5 py-1 rounded-lg font-medium">
			<div class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div>
			{t('security_threats_badge')}
		</span>
	</div>
	<div class="divide-y divide-surface/60">
		{#each activeThreats as threat (threat.id)}
			<ThreatItem {threat} variant="mobile" />
		{/each}
	</div>
</section>
