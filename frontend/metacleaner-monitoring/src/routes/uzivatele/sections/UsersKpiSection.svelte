<script lang="ts">
	import { t } from '$lib/i18n';
	import { getUserStats } from '$lib/repositories/usersRepository';

	const stats = getUserStats();
</script>

<!-- ===== DESKTOP: Stats Cards (4-col grid) ===== -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each stats as stat (stat.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-start mb-4">
				<h3 class="text-textSec text-sm font-medium">{t(stat.labelKey)}</h3>
				<div class="w-8 h-8 rounded-lg {stat.iconBg} flex items-center justify-center">
					<i class="fa-solid {stat.icon} {stat.iconColor} text-sm"></i>
				</div>
			</div>
			<div class="text-3xl font-bold text-textMain">{stat.value}</div>
			{#if stat.pulse}
				<div class="flex items-center gap-2 mt-2">
					<div class="w-2 h-2 rounded-full {stat.pulseColor} animate-pulse"></div>
					<span class="text-xs text-textSec">{t(stat.trendKey)}</span>
				</div>
			{:else}
				<div class="flex items-center gap-1 mt-2">
					<i
						class="fa-solid {stat.trendPositive
							? 'fa-arrow-trend-up text-success'
							: 'fa-arrow-trend-down text-error'} text-xs"
					></i>
					<span class="text-xs {stat.trendPositive ? 'text-success' : 'text-error'}"
						>{stat.trendValue}</span
					>
					<span class="text-xs text-textSec ml-1">{t(stat.trendKey)}</span>
				</div>
			{/if}
		</div>
	{/each}
</section>

<!-- ===== MOBILE: Stats Cards (2x2 grid, compact) ===== -->
<section class="lg:hidden grid grid-cols-2 gap-3">
	{#each stats as stat (stat.key)}
		<div class="bg-card border border-surface rounded-xl p-4">
			<div class="flex justify-between items-start mb-3">
				<h3 class="text-textSec text-xs font-medium leading-tight">
					{#if stat.key === 'newRegistrations'}
						{t('users_stats_newRegistrationsShort')}
					{:else if stat.key === 'avgSessionDuration'}
						{t('users_stats_sessionDurationShort')}
					{:else}
						{t(stat.labelKey)}
					{/if}
				</h3>
				<div
					class="w-7 h-7 rounded-lg {stat.iconBg} flex items-center justify-center flex-shrink-0"
				>
					<i class="fa-solid {stat.icon} {stat.iconColor} text-xs"></i>
				</div>
			</div>
			<div class="text-2xl font-bold text-textMain">{stat.value}</div>
			{#if stat.pulse}
				<div class="flex items-center gap-1.5 mt-1.5">
					<div class="w-1.5 h-1.5 rounded-full {stat.pulseColor} animate-pulse"></div>
					<span class="text-xs text-textSec">{t('users_stats_liveNow')}</span>
				</div>
			{:else}
				<div class="flex items-center gap-1 mt-1.5">
					<i
						class="fa-solid {stat.trendPositive
							? 'fa-arrow-trend-up text-success'
							: 'fa-arrow-trend-down text-error'} text-xs"
					></i>
					<span class="text-xs {stat.trendPositive ? 'text-success' : 'text-error'} font-medium"
						>{stat.trendValue}</span
					>
				</div>
			{/if}
		</div>
	{/each}
</section>
