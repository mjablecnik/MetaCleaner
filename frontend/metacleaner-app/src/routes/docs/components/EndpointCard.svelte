<script lang="ts">
	import { untrack } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import CodeBlock from '$lib/shared/elements/CodeBlock.svelte';
	import MethodBadge from '$lib/shared/elements/MethodBadge.svelte';
	import type { EndpointData } from '$lib/repositories/docsRepository';

	interface Props {
		endpoint: EndpointData;
		initialOpen?: boolean;
		forceOpen?: boolean;
		onToggle?: (id: string, isOpen: boolean) => void;
	}

	const { endpoint, initialOpen = false, forceOpen = false, onToggle }: Props = $props();

	let open = $state(untrack(() => initialOpen));

	$effect(() => {
		if (forceOpen && !open) {
			open = true;
			onToggle?.(endpoint.id, true);
		}
	});

	function toggle() {
		open = !open;
		onToggle?.(endpoint.id, open);
	}

	const isWebSocket = $derived(endpoint.protocol === 'websocket');

	const statusBadgeColor: Record<string, string> = {
		pending: 'bg-gray-700/40 text-text-muted border-gray-700',
		processing: 'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
		completed: 'bg-brand-green/10 text-brand-green border-brand-green/30',
		failed: 'bg-brand-red/10 text-brand-red border-brand-red/30',
		file_progress: 'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
		file_complete: 'bg-brand-green/10 text-brand-green border-brand-green/30',
		file_error: 'bg-brand-red/10 text-brand-red border-brand-red/30',
		job_complete: 'bg-brand-green/10 text-brand-green border-brand-green/30',
		job_error: 'bg-brand-red/10 text-brand-red border-brand-red/30',
		report_ready: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
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
		onclick={toggle}
		class="flex w-full items-center gap-3 bg-navy-card px-5 py-4 text-left"
	>
		<MethodBadge method={endpoint.method} size="md" />
		<code class="min-w-0 flex-1 truncate font-mono text-sm text-white">{endpoint.path}</code>
		<span class="hidden text-xs text-text-muted lg:block">{tx(endpoint.shortDescriptionKey)}</span>
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
			{:else if isWebSocket}
				<!-- WebSocket protocol layout -->

				<!-- Connection info -->
				<div class="mb-5">
					<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
						{tx('docs.ws.connection')}
					</p>
					<CodeBlock
						code={`wss://your-server.com${endpoint.path.replace('{id}', '<job_id>')}?token=YOUR_API_KEY`}
					/>
				</div>

				<!-- Authentication note -->
				<div class="mb-5 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
					<div class="flex items-start gap-2">
						<i class="fa-solid fa-circle-info mt-0.5 text-xs text-purple-400"></i>
						<p class="text-xs leading-relaxed text-text-muted">
							{tx('docs.ws.authNote')}
						</p>
					</div>
				</div>

				<!-- Parameters -->
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
											<td class="px-3 py-2"
												><code class="text-xs text-brand-blue">{param.name}</code></td
											>
											<td class="px-3 py-2"
												><code class="text-xs text-brand-orange">{param.type}</code></td
											>
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

				<!-- Lifecycle -->
				{#if endpoint.wsLifecycle && endpoint.wsLifecycle.length > 0}
					<div class="mb-5">
						<p class="mb-3 text-xs font-semibold tracking-wider text-text-muted uppercase">
							{tx('docs.ws.lifecycle')}
						</p>
						<div class="relative ml-3 border-l border-gray-700 pl-5">
							{#each endpoint.wsLifecycle as step (step.number)}
								<div class="relative mb-4 last:mb-0">
									<div
										class="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/20 text-[10px] font-bold text-purple-400"
									>
										{step.number}
									</div>
									<p class="text-sm font-medium text-white">{tx(step.titleKey)}</p>
									<p class="text-xs text-text-muted">{tx(step.descriptionKey)}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Event types (statusValues) -->
				{#if endpoint.statusValues && endpoint.statusValues.length > 0}
					<div class="mb-5">
						<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
							{tx('docs.ws.eventTypes')}
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

				<!-- Message types with examples -->
				{#if endpoint.wsMessages && endpoint.wsMessages.length > 0}
					<div class="mb-5">
						<p class="mb-3 text-xs font-semibold tracking-wider text-text-muted uppercase">
							{tx('docs.ws.messageReference')}
						</p>
						<div class="space-y-4">
							{#each endpoint.wsMessages as msg (msg.type)}
								<div class="rounded-lg border border-gray-800 bg-navy-card/50 p-4">
									<div class="mb-2 flex items-center gap-2">
										<span
											class="rounded border px-2 py-0.5 font-mono text-xs font-bold {statusBadgeColor[
												msg.type
											] ?? 'border-gray-700 bg-gray-700/40 text-text-muted'}">{msg.type}</span
										>
										<span class="text-xs text-text-muted">{tx(msg.descriptionKey)}</span>
									</div>
									<CodeBlock code={msg.exampleBody} />
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- JavaScript example -->
				<div class="mb-5">
					<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
						{tx('docs.ws.usageExample')}
					</p>
					<CodeBlock code={endpoint.curlExample.code} />
				</div>

				<!-- Error responses (pre-upgrade HTTP errors) -->
				{#if endpoint.responses.length > 0}
					<div>
						<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
							{tx('docs.ws.connectionErrors')}
						</p>
						<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
							{#each endpoint.responses as resp (resp.labelKey)}
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
			{:else}
				<!-- REST endpoint layout -->

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
