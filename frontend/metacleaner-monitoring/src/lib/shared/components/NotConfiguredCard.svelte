<script lang="ts">
	import { t } from '$lib/i18n';

	interface Props {
		missingVars: string[];
	}

	let { missingVars }: Props = $props();
</script>

<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-5 shadow-sm">
	<div class="flex items-start gap-3">
		<div
			class="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-surface flex items-center justify-center"
		>
			<i class="fa-solid fa-plug-circle-xmark text-textSec text-sm"></i>
		</div>
		<div class="flex-1 min-w-0">
			<h3 class="text-sm font-semibold text-textMain">{t('common_notConfigured_title')}</h3>
			<p class="text-xs text-textSec mt-1">{t('common_notConfigured_description')}</p>
			{#if missingVars.length > 0}
				<div class="mt-3">
					<p class="text-xs font-medium text-textSec mb-1.5">
						{t('common_notConfigured_missingLabel')}
					</p>
					<ul class="flex flex-wrap gap-1.5">
						{#each missingVars as varName (varName)}
							<li
								class="inline-flex items-center px-2 py-0.5 rounded-md bg-surface border border-surface text-xs font-mono text-textSec"
							>
								{varName}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</div>
