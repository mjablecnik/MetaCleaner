<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import CodeBlock from '$lib/shared/elements/CodeBlock.svelte';
	import InfoBox from '$lib/shared/elements/InfoBox.svelte';
	import ErrorTable from '../components/ErrorTable.svelte';
	import { getErrorEntries, getCodeExamples } from '$lib/repositories/docsRepository';

	const errorEntries = getErrorEntries();
	const codeExamples = getCodeExamples();
</script>

<section id="sec-errors" data-section-id="sec-errors" class="mb-12 scroll-mt-24">
	<!-- Section header -->
	<div class="mb-6 flex items-start gap-4">
		<div
			class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-red/30 bg-brand-red/20"
		>
			<i class="fa-solid fa-triangle-exclamation text-xs text-brand-red"></i>
		</div>
		<div>
			<h2 class="text-2xl font-bold text-white">{tx('docs.errors.title')}</h2>
			<p class="text-xs text-text-muted">{tx('docs.errors.subtitle')}</p>
		</div>
	</div>

	<!-- Description -->
	<p class="mb-6 text-sm leading-relaxed text-text-muted">{tx('docs.errors.description')}</p>

	<!-- Standard error response JSON -->
	<div class="mb-6">
		<CodeBlock code={codeExamples['error-standard'].code} />
	</div>

	<!-- HTTP status category overview -->
	<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
		<InfoBox variant="green" icon="fa-circle-check">
			<span class="font-semibold text-brand-green">{tx('docs.errors.status2xx.title')}</span>
			<br />
			{tx('docs.errors.status2xx.desc')}
		</InfoBox>
		<InfoBox variant="orange" icon="fa-triangle-exclamation">
			<span class="font-semibold text-brand-orange">{tx('docs.errors.status4xx.title')}</span>
			<br />
			{tx('docs.errors.status4xx.desc')}
		</InfoBox>
		<InfoBox variant="red" icon="fa-circle-xmark">
			<span class="font-semibold text-brand-red">{tx('docs.errors.status5xx.title')}</span>
			<br />
			{tx('docs.errors.status5xx.desc')}
		</InfoBox>
	</div>

	<!-- Error table -->
	<div class="mb-6">
		<ErrorTable entries={errorEntries} />
	</div>

	<!-- Retry strategy InfoBox -->
	<InfoBox variant="blue" icon="fa-rotate-right">
		{tx('docs.errors.retry')}
	</InfoBox>
</section>
