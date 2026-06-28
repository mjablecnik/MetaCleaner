<script lang="ts">
	import { t } from '$lib/i18n';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';
	import InstanceCard from '../components/InstanceCard.svelte';
	import type { MachineInstance } from '$lib/repositories/runtimeRepository';

	let { machines }: { machines: MachineInstance[] } = $props();

	const machinesOnline = $derived(machines.filter((m) => m.status === 'running').length);
	const machinesTotal = $derived(machines.length);

	let open = $state(true);
</script>

<!-- Desktop: instances panel card -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-5">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('runtime_instances_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('runtime_instances_flyioInfo')}</p>
		</div>
		<button
			class="flex items-center gap-2 px-3 py-1.5 bg-purple-light/10 border border-purple-light/20 rounded-lg text-purple-light text-xs font-medium hover:bg-purple-light/20 transition-colors"
		>
			<i class="fa-solid fa-plus text-xs"></i>{t('runtime_instances_scale')}
		</button>
	</div>
	<div class="space-y-3">
		{#each machines as machine (machine.id)}
			<InstanceCard {machine} variant="desktop" />
		{/each}
	</div>
</div>

<!-- Mobile: accordion -->
<div class="lg:hidden">
	<AccordionSection
		title={t('runtime_instances_titleMobile')}
		icon="fa-microchip"
		{open}
		ontoggle={() => (open = !open)}
	>
		{#snippet headerRight()}
			<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
				{machinesOnline}/{machinesTotal}
			</span>
		{/snippet}
		<div class="flex justify-end mb-3">
			<button
				class="flex items-center gap-2 px-3 py-2 bg-purple-light/10 border border-purple-light/20 rounded-lg text-purple-light text-xs font-medium"
			>
				<i class="fa-solid fa-plus text-xs"></i>{t('runtime_instances_scale')}
			</button>
		</div>
		<div class="space-y-3">
			{#each machines as machine (machine.id)}
				<InstanceCard {machine} variant="mobile" />
			{/each}
		</div>
	</AccordionSection>
</div>
