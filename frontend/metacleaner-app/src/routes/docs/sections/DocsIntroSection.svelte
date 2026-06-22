<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import CodeBlock from '$lib/shared/elements/CodeBlock.svelte';
	import InfoBox from '$lib/shared/elements/InfoBox.svelte';
	import FeatureCard from '$lib/shared/elements/FeatureCard.svelte';
	import QuickStartFlow from '../components/QuickStartFlow.svelte';
	import {
		getFeatureCards,
		getQuickStartSteps,
		getSupportedFormats,
		getCodeExamples
	} from '$lib/repositories/docsRepository';

	const featureCards = getFeatureCards();
	const quickStartSteps = getQuickStartSteps();
	const formats = getSupportedFormats();
	const codeExamples = getCodeExamples();
</script>

<section id="sec-intro" data-section-id="sec-intro" class="mb-12 scroll-mt-24">
	<!-- Section header -->
	<div class="mb-6 flex items-start gap-4">
		<div
			class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-blue/30 bg-brand-blue/20"
		>
			<i class="fa-solid fa-house text-xs text-brand-blue"></i>
		</div>
		<div>
			<h2 class="text-2xl font-bold text-white">{tx('docs.intro.title')}</h2>
			<p class="text-xs text-text-muted">{tx('docs.intro.subtitle')}</p>
		</div>
	</div>

	<!-- Description -->
	<p class="mb-6 text-sm leading-relaxed text-text-muted">{tx('docs.intro.description')}</p>

	<!-- Base URL -->
	<div class="mb-6">
		<CodeBlock code={codeExamples['base-url'].code} />
	</div>

	<!-- Feature Cards -->
	<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
		{#each featureCards as card (card.titleKey)}
			<FeatureCard
				icon="fa-solid {card.icon}"
				iconColor={card.iconColor}
				title={tx(card.titleKey)}
				description={tx(card.descriptionKey)}
			/>
		{/each}
	</div>

	<!-- Supported formats -->
	<div class="mb-6">
		<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
			{tx('docs.intro.formatsLabel')}
		</p>
		<div class="flex flex-wrap gap-2">
			{#each formats as fmt}
				<span
					class="rounded-md border border-gray-700 bg-navy-lighter px-2.5 py-1 font-mono text-xs font-medium text-text-muted"
				>
					{fmt}
				</span>
			{/each}
		</div>
	</div>

	<!-- Quick Start Flow -->
	<div class="mb-6">
		<h3 class="mb-4 text-base font-semibold text-white">{tx('docs.intro.quickStart.title')}</h3>
		<QuickStartFlow steps={quickStartSteps} />
	</div>

	<!-- Rate limit InfoBox -->
	<InfoBox variant="orange" icon="fa-triangle-exclamation">
		{tx('docs.intro.rateLimit')}
	</InfoBox>
</section>
