<script lang="ts">
	import { untrack } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import CodeBlock from '$lib/shared/elements/CodeBlock.svelte';
	import MethodBadge from '$lib/shared/elements/MethodBadge.svelte';
	import type { EndpointData } from '$lib/repositories/docsRepository';

	interface Props {
		endpoint: EndpointData;
		initialOpen?: boolean;
	}

	const { endpoint, initialOpen = false }: Props = $props();

	let open = $state(untrack(() => initialOpen));

	const statusBadgeColor: Record<string, string> = {
		pending: 'bg-gray-700/40 text-text-muted border-gray-700',
		processing: 'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
		completed: 'bg-brand-green/10 text-brand-green border-brand-green/30',
		failed: 'bg-brand-red/10 text-brand-red border-brand-red/30'
	};

	function responseBadgeColor(variant: 'success' | 'error'): string {
		return variant === 'success'
			? 'bg-brand-green/10 text-brand-green border-brand-green/30'
			: 'bg-brand-red/10 text-brand-red border-brand-red/30';
	}
</script>

<div
	id={endpoint.id}
	data-section-id={endpoint.id}
	class="mb-4 scroll-mt-24 overflow-hidden rounded-xl border transition-colors duration-200 {open
		? 'border-brand-blue'
		: 'border-gray-800'}"
>
	<!-- Collapsible header -->
	<button
		onclick={() => (open = !open)}
		class="flex w-full items-center gap-3 bg-navy-card px-5 py-4 text-left"
	>
		<MethodBadge method={endpoint.method} size="md" />
		<code class="min-w-0 flex-1 truncate font-mono text-sm text-white">{endpoint.path}</code>
		<span class="hidden text-xs text-text-muted lg:block">{tx(endpoint.descriptionKey)}</span>
		<i
			class="fa-solid fa-chevron-down ml-2 flex-shrink-0 text-xs text-text-muted transition-transform duration-200 {open
				? 'rotate-180'
				: ''}"
		></i>
	</button>

	<!-- Expanded content -->
	{#if open}
		<div class="border-t border-gray-800 p-5">
			<!-- Description -->
			<p class="mb-5 text-sm leading-relaxed text-text-muted">{tx(endpoint.descriptionKey)}</p>

			{#if endpoint.isMinimal}
				<!-- Minimal endpoints: placeholder only -->
				<div
					class="rounded-lg border border-dashed border-gray-700 bg-navy-card/40 p-4 text-center text-sm text-text-muted"
				>
					<i class="fa-solid fa-clock mb-2 block text-xl text-text-muted/40"></i>
					{tx(endpoint.placeholderKey ?? 'docs.common.placeholder')}
				</div>
			{:else}
				<!-- Full detail: headers -->
				<div class="mb-5">
					<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
						{tx('docs.common.requestHeaders')}
					</p>
					<CodeBlock code={endpoint.headers.code} />
				</div>

				<!-- Parameters table -->
				{#if endpoint.params.length > 0}
					<div class="mb-5">
						<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
							{tx('docs.common.parameters')}
						</p>
						<div class="overflow-x-auto rounded-lg border border-gray-800">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b border-gray-800 bg-navy-card">
										<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
											>{tx('docs.common.field')}</th
										>
										<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
											>{tx('docs.common.type')}</th
										>
										<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted">Req.</th>
										<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
											>{tx('docs.errors.table.description')}</th
										>
									</tr>
								</thead>
								<tbody>
									{#each endpoint.params as param (param.name)}
										<tr class="border-b border-gray-800/50 last:border-0">
											<td class="px-3 py-2">
												<code class="text-xs text-brand-blue">{param.name}</code>
											</td>
											<td class="px-3 py-2">
												<code class="text-xs text-brand-orange">{param.type}</code>
											</td>
											<td class="px-3 py-2">
												{#if param.required}
													<span class="text-xs font-medium text-brand-green"
														>{tx('docs.common.required')}</span
													>
												{:else}
													<span class="text-xs text-text-muted">{tx('docs.common.optional')}</span>
												{/if}
											</td>
											<td class="px-3 py-2 text-xs text-text-muted">{tx(param.descriptionKey)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				<!-- Options table (clean endpoint only) -->
				{#if endpoint.optionsParams && endpoint.optionsParams.length > 0}
					<div class="mb-5">
						<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
							{tx('docs.common.options')}
						</p>
						<div class="overflow-x-auto rounded-lg border border-gray-800">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b border-gray-800 bg-navy-card">
										<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
											>{tx('docs.common.field')}</th
										>
										<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
											>{tx('docs.common.type')}</th
										>
										<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
											>{tx('docs.common.defaultValue')}</th
										>
										<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
											>{tx('docs.errors.table.description')}</th
										>
									</tr>
								</thead>
								<tbody>
									{#each endpoint.optionsParams as opt (opt.name)}
										<tr class="border-b border-gray-800/50 last:border-0">
											<td class="px-3 py-2">
												<code class="text-xs text-brand-blue">{opt.name}</code>
											</td>
											<td class="px-3 py-2">
												<code class="text-xs text-brand-orange">{opt.type}</code>
											</td>
											<td class="px-3 py-2">
												<code class="text-xs text-text-muted">{opt.default ?? '—'}</code>
											</td>
											<td class="px-3 py-2 text-xs text-text-muted">{tx(opt.descriptionKey)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				<!-- Status values (status endpoint only) -->
				{#if endpoint.statusValues && endpoint.statusValues.length > 0}
					<div class="mb-5">
						<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
							{tx('docs.common.statusValues')}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each endpoint.statusValues as val (val)}
								<span
									class="rounded border px-2.5 py-1 font-mono text-xs font-medium {statusBadgeColor[
										val
									] ?? 'border-gray-700 bg-gray-700/40 text-text-muted'}">{val}</span
								>
							{/each}
						</div>
					</div>
				{/if}

				<!-- cURL example -->
				<div class="mb-5">
					<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
						{tx('docs.common.curlExample')}
					</p>
					<CodeBlock code={endpoint.curlExample.code} />
				</div>

				<!-- Responses -->
				{#if endpoint.responses.length > 0}
					<div>
						<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
							{tx('docs.common.successResponse')} / {tx('docs.common.errorResponse')}
						</p>
						<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
							{#each endpoint.responses as resp (resp.status)}
								<div>
									<div class="mb-1.5 flex items-center gap-2">
										<span
											class="rounded border px-1.5 py-0.5 font-mono text-xs font-semibold {responseBadgeColor(
												resp.variant
											)}"
										>
											{resp.status}
										</span>
										<span class="text-xs text-text-muted">{tx(resp.labelKey)}</span>
									</div>
									<CodeBlock code={resp.body} />
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
