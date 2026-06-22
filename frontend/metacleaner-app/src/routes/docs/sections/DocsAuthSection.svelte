<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import CodeBlock from '$lib/shared/elements/CodeBlock.svelte';
	import InfoBox from '$lib/shared/elements/InfoBox.svelte';
	import { getCodeExamples } from '$lib/repositories/docsRepository';

	const codeExamples = getCodeExamples();

	const bestPractices = [
		'docs.auth.bestPractice.1',
		'docs.auth.bestPractice.2',
		'docs.auth.bestPractice.3',
		'docs.auth.bestPractice.4'
	];
</script>

<section id="sec-auth" data-section-id="sec-auth" class="mb-12 scroll-mt-24">
	<!-- Section header -->
	<div class="mb-6 flex items-start gap-4">
		<div
			class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-orange/30 bg-brand-orange/20"
		>
			<i class="fa-solid fa-lock text-xs text-brand-orange"></i>
		</div>
		<div>
			<h2 class="text-2xl font-bold text-white">{tx('docs.auth.title')}</h2>
			<p class="text-xs text-text-muted">{tx('docs.auth.subtitle')}</p>
		</div>
	</div>

	<!-- Description -->
	<p class="mb-6 text-sm leading-relaxed text-text-muted">{tx('docs.auth.description')}</p>

	<!-- Authorization header CodeBlock -->
	<div class="mb-6">
		<CodeBlock code={codeExamples['auth-header'].code} />
	</div>

	<!-- API key InfoBox (blue) -->
	<InfoBox variant="blue" icon="fa-circle-info" class="mb-6">
		{tx('docs.auth.infoBox')}
	</InfoBox>

	<!-- Authenticated cURL example -->
	<div class="mb-6">
		<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
			{tx('docs.common.curlExample')}
		</p>
		<CodeBlock code={codeExamples['auth-curl'].code} />
	</div>

	<!-- Security best practices -->
	<div class="mb-6">
		<h3 class="mb-3 text-base font-semibold text-white">{tx('docs.auth.bestPractices.title')}</h3>
		<ul class="flex flex-col gap-2">
			{#each bestPractices as key, i}
				<li class="flex items-start gap-2.5 text-sm text-text-muted">
					<span
						class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-[10px] font-bold text-brand-blue"
					>
						{i + 1}
					</span>
					{tx(key)}
				</li>
			{/each}
		</ul>
	</div>

	<!-- Error response examples -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<div>
			<p class="mb-2 text-xs font-semibold text-text-muted">{tx('docs.auth.error401Label')}</p>
			<CodeBlock code={codeExamples['auth-401'].code} />
		</div>
		<div>
			<p class="mb-2 text-xs font-semibold text-text-muted">{tx('docs.auth.error403Label')}</p>
			<CodeBlock code={codeExamples['auth-403'].code} />
		</div>
	</div>
</section>
