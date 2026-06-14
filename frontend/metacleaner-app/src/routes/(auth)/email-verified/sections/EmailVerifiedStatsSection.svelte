<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { getAuthStats } from '$lib/repositories/authRepository';
	import AuthStatsRow from '../../components/AuthStatsRow.svelte';

	const stats = getAuthStats();
</script>

<!-- Desktop: stats row with top border -->
<div class="hidden border-t border-gray-800 pt-5 lg:block">
	<AuthStatsRow {stats} />
</div>

<!-- Mobile: card-style compact stats -->
<div class="grid grid-cols-3 gap-3 lg:hidden">
	<div
		class="flex flex-col items-center gap-0.5 rounded-xl border border-gray-800 bg-navy-card py-3"
	>
		<p class="text-xl font-black text-white">{stats[0].value}</p>
		<p class="text-center text-[10px] leading-tight text-text-muted">
			{tx(stats[0].labelKey)}
		</p>
	</div>
	<div
		class="flex flex-col items-center gap-0.5 rounded-xl border border-gray-800 bg-navy-card py-3"
	>
		<p class="text-xl font-black text-brand-green">{stats[1].value}</p>
		<p class="text-center text-[10px] leading-tight text-text-muted">
			{tx(stats[1].labelKey)}
		</p>
	</div>
	<div
		class="flex flex-col items-center gap-0.5 rounded-xl border border-gray-800 bg-navy-card py-3"
	>
		<p class="text-xl font-black text-brand-blue">{stats[2].value}</p>
		<p class="text-center text-[10px] leading-tight text-text-muted">
			{tx(stats[2].labelKey)}
		</p>
	</div>
</div>
