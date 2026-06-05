<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getUploadedFiles, type UploadedFile } from '$lib/repositories/fileRepository';

	let riskAccordionOpen = $state(false);
	let uploadedFiles = $state<UploadedFile[]>([]);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	onMount(() => {
		getUploadedFiles().then((files) => {
			uploadedFiles = files;
		});
	});
</script>

<svelte:head>
	<title>{tx('step2.meta.title')}</title>
</svelte:head>

<!-- Main -->
<main
	class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-32 lg:pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0"
>
	<!-- Page Header -->
	<div class="flex flex-col gap-1 mb-0 lg:mb-2">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
			<div>
				<h1 class="text-2xl lg:text-3xl font-bold text-white">{tx('step1.header.title')}</h1>
				<p class="text-text-muted text-sm mt-1">
					{tx('step1.header.description')}
				</p>
			</div>
			<!-- Ready pill badge -->
			<div
				class="flex items-center gap-2 bg-navy-card border border-gray-700 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 self-start sm:self-auto"
			>
				<div class="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></div>
				<span class="text-[10px] lg:text-xs font-semibold text-text-muted">
					<span class="hidden lg:inline">{tx('step2.header.readyDesktop')}</span>
					<span class="inline lg:hidden">{tx('step2.header.readyMobile')}</span>
				</span>
			</div>
		</div>
	</div>

	<!-- Mobile: Risk Banner Accordion -->
	<div
		class="lg:hidden bg-navy-card rounded-2xl border border-brand-red/30 shadow-card overflow-hidden"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<button
			onclick={() => (riskAccordionOpen = !riskAccordionOpen)}
			class="w-full flex items-center justify-between px-4 py-3.5"
		>
			<div class="flex items-center gap-3">
				<!-- Mini ring -->
				<div class="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
					<svg viewBox="0 0 36 36" class="absolute inset-0 w-full h-full -rotate-90">
						<circle cx="18" cy="18" r="15.9" fill="none" style="stroke: var(--color-navy-lighter)" stroke-width="3"
						></circle>
						<circle
							cx="18"
							cy="18"
							r="15.9"
							fill="none"
							stroke-width="3.5"
							stroke-dasharray="72 28"
							stroke-linecap="round"
							style="stroke: var(--color-brand-red); filter: var(--shadow-drop-red)"
						></circle>
					</svg>
					<span class="text-sm font-black text-brand-red z-10">72</span>
				</div>
				<div>
					<div class="flex items-center gap-2 mb-0.5">
						<span class="text-sm font-bold text-white">{tx('step2.risk.title')}</span>
						<span
							class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase flex items-center gap-1"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse inline-block"
							></span>{tx('step2.risk.highRisk')}
						</span>
					</div>
					<div class="flex items-center gap-1.5">
						<span
							class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-red/25 bg-brand-red/15 text-brand-red">GPS</span
						>
						<span
							class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-orange/25 bg-brand-orange/15 text-brand-orange">{tx('step2.risk.chipIdentity')}</span
						>
						<span
							class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-orange/25 bg-brand-orange/15 text-brand-orange">{tx('step2.risk.chipDevice')}</span
						>
					</div>
				</div>
			</div>
			<i
				class="fa-solid fa-chevron-down text-text-muted text-sm transition-transform"
				style="transform: {riskAccordionOpen ? 'rotate(180deg)' : ''}"
			></i>
		</button>
		{#if riskAccordionOpen}
			<div class="px-4 pb-4 flex flex-col gap-4">
				<p class="text-xs text-text-muted leading-relaxed">
					{tx('step2.risk.description')}
				</p>
				<!-- Risk Bars -->
				<div class="flex flex-col gap-3">
					<p class="text-[10px] font-bold uppercase tracking-widest text-text-muted">
						{tx('step2.risk.analysisTitle')}
					</p>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="flex items-center gap-1.5 text-white font-medium">
								<i class="fa-solid fa-location-dot text-brand-red text-[10px]"></i>{tx('step2.risk.gpsCoordinates')}
							</span>
							<span class="text-brand-red font-bold">{tx('step2.risk.critical')}</span>
						</div>
						<div class="w-full bg-navy-lighter rounded-full h-2">
							<div
								class="h-2 rounded-full bg-gradient-to-r from-brand-red to-red-400"
								style="width:92%"
							></div>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="flex items-center gap-1.5 text-white font-medium">
								<i class="fa-solid fa-mobile-screen text-brand-orange text-[10px]"></i>{tx('step2.risk.deviceIdentity')}
							</span>
							<span class="text-brand-orange font-bold">{tx('step2.risk.high')}</span>
						</div>
						<div class="w-full bg-navy-lighter rounded-full h-2">
							<div class="h-2 rounded-full bg-brand-orange" style="width:68%"></div>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="flex items-center gap-1.5 text-white font-medium">
								<i class="fa-solid fa-user text-brand-blue text-[10px]"></i>{tx('step2.risk.personalData')}
							</span>
							<span class="text-brand-orange font-bold">{tx('step2.risk.medium')}</span>
						</div>
						<div class="w-full bg-navy-lighter rounded-full h-2">
							<div
								class="h-2 rounded-full bg-gradient-to-r from-brand-orange to-yellow-400"
								style="width:48%"
							></div>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="flex items-center gap-1.5 text-white font-medium">
								<i class="fa-solid fa-clock text-text-muted text-[10px]"></i>{tx('step2.risk.timestamp')}
							</span>
							<span class="text-text-muted font-bold">{tx('step2.risk.low')}</span>
						</div>
						<div class="w-full bg-navy-lighter rounded-full h-2">
							<div class="h-2 rounded-full bg-gray-500" style="width:22%"></div>
						</div>
					</div>
				</div>
				<!-- Before/After -->
				<div class="grid grid-cols-2 gap-3">
					<div
						class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-brand-red/25 bg-brand-red/6"
					>
						<span class="text-[10px] font-bold uppercase tracking-widest text-brand-red"
							>{tx('step2.risk.now')}</span
						>
						<span class="text-2xl font-black text-brand-red">72</span>
						<span class="text-[10px] text-text-muted">{tx('step2.risk.score')}</span>
					</div>
					<div
						class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-brand-green/25 bg-brand-green/6"
					>
						<span class="text-[10px] font-bold uppercase tracking-widest text-brand-green"
							>{tx('step2.risk.afterCleaning')}</span
						>
						<span class="text-2xl font-black text-brand-green">100</span>
						<span class="text-[10px] text-text-muted">{tx('step2.risk.cleanScore')}</span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Main Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-4 lg:gap-6">
		<!-- Left Column -->
		<div class="flex flex-col gap-4 lg:gap-5">
			<!-- Upload Zone Card -->
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 flex flex-col gap-4 shadow-card"
			>
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.upload.title')}</h3>
					<div class="flex gap-1 lg:gap-1.5 flex-wrap justify-end">
						{#each ['JPG', 'PNG', 'HEIC', 'MP4', 'MOV'] as ext}
							<span
								class="px-1.5 lg:px-2 py-0.5 lg:py-1 rounded bg-navy-lighter text-[9px] lg:text-[10px] font-bold text-white uppercase"
								>{ext}</span
							>
						{/each}
					</div>
				</div>

				<!-- Compact Drop Zone -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="dashed-border-anim rounded-xl flex flex-col items-center justify-center gap-2.5 lg:gap-3 cursor-pointer py-5 lg:py-6 relative bg-navy-main/50"
					onclick={() => document.getElementById('fileInput')?.click()}
				>
					<div
						class="w-10 h-10 rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue text-lg shadow-glow-blue"
					>
						<i class="fa-solid fa-plus"></i>
					</div>
					<p class="text-xs text-text-muted">{tx('step2.files.addMore')}</p>
					<input
						type="file"
						id="fileInput"
						multiple
						accept="image/*,video/*"
						class="hidden"
					/>
				</div>

				<!-- File List -->
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between mb-1">
						<span class="text-sm font-semibold text-white"
							>{tx('step1.files.title')} <span class="text-text-muted font-normal">({uploadedFiles.length})</span></span
						>
						<button
							class="text-xs text-text-muted hover:text-brand-red transition-colors flex items-center gap-1 min-h-[44px] lg:min-h-0 px-2 lg:px-0"
						>
							<i class="fa-solid fa-trash mr-1 lg:mr-0"></i>{tx('step1.files.clearAll')}
						</button>
					</div>
					<div
						class="flex flex-col gap-2 max-h-[260px] lg:max-h-[240px] overflow-y-auto pr-1"
					>
						{#each uploadedFiles as file (file.id)}
							<div
								class="group flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border cursor-default bg-navy-main/60 {file.hasGps ? 'border-red-900/30' : 'border-gray-800'}"
							>
								<div
									class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border {file.hasGps ? 'border-brand-red/20 bg-brand-red/10' : file.type === 'video' ? 'border-brand-orange/20 bg-brand-orange/10' : 'border-brand-blue/20 bg-brand-blue/10'}"
								>
									<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {file.hasGps ? 'text-brand-red' : file.type === 'video' ? 'text-brand-orange' : 'text-brand-blue'} text-sm"></i>
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-white truncate">{file.name}</p>
									<div class="flex items-center gap-2 mt-0.5">
										<span class="text-[11px] text-text-muted">{file.size}</span>
										<span class="w-1 h-1 rounded-full bg-gray-600"></span>
										{#if file.hasGps}
											<span class="text-[11px] text-brand-red font-medium flex items-center gap-1">
												<i class="fa-solid fa-location-dot text-[9px]"></i>{tx('step2.files.gpsFound')}
											</span>
										{:else if file.metadataFieldCount > 5}
											<span class="text-[11px] text-brand-orange font-medium flex items-center gap-1">
												<i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
												<span class="hidden lg:inline">{tx('step2.files.metadataFields', {count: file.metadataFieldCount})}</span>
												<span class="inline lg:hidden">{tx('step2.files.metadataFieldsMobile', {count: file.metadataFieldCount})}</span>
											</span>
										{:else}
											<span class="text-[11px] text-text-muted flex items-center gap-1">
												<i class="fa-solid fa-circle-check text-brand-green text-[9px]"></i>
												<span class="hidden lg:inline">{tx('step2.files.metadataFields', {count: file.metadataFieldCount})}</span>
												<span class="inline lg:hidden">{tx('step2.files.metadataFieldsMobile', {count: file.metadataFieldCount})}</span>
											</span>
										{/if}
									</div>
								</div>
								<div class="flex items-center gap-2">
									<span
										class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
										>{file.extension}</span
									>
									<button
										class="text-gray-600 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
									>
										<i class="fa-solid fa-xmark text-sm"></i>
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Action Buttons (desktop only) -->
				<div class="hidden lg:flex gap-3 mt-1">
					<a
						href="/step3"
						class="flex-1 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-500 transition-all shadow-glow-green flex items-center justify-center gap-2"
					>
						<i class="fa-solid fa-wand-magic-sparkles"></i> {tx('step1.actions.startCleaning')}
					</a>
					<button
						class="px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
					>
						<i class="fa-solid fa-sliders"></i> {tx('step1.actions.options')}
					</button>
				</div>
			</div>
		</div>

		<!-- Right Column (desktop only) — Risk Scanner Card -->
		<div class="hidden lg:flex flex-col gap-5">
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5"
			>
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-lg text-white">{tx('step2.risk.title')}</h3>
					<span
						class="text-xs font-bold px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5"
					>
						<span class="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse inline-block"
						></span>{tx('step2.risk.highRisk')}
					</span>
				</div>

				<!-- Risk Score Ring -->
				<div class="flex items-center gap-6">
					<div
						class="relative w-28 h-28 flex-shrink-0 flex items-center justify-center"
					>
						<svg viewBox="0 0 36 36" class="absolute inset-0 w-full h-full -rotate-90">
							<circle cx="18" cy="18" r="15.9" fill="none" style="stroke: var(--color-navy-lighter)" stroke-width="3"
							></circle>
							<circle
								cx="18"
								cy="18"
								r="15.9"
								fill="none"
								stroke-width="3.5"
								stroke-dasharray="72 28"
								stroke-linecap="round"
								style="stroke: var(--color-brand-red); filter: var(--shadow-drop-red)"
							></circle>
						</svg>
						<div class="text-center z-10">
							<span class="text-3xl font-black text-brand-red leading-none">72</span>
							<p class="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">
								{tx('step2.risk.score')}
							</p>
						</div>
					</div>
					<div class="flex flex-col gap-2 flex-1">
						<p class="text-sm font-bold text-white">{tx('step2.risk.leakProbable')}</p>
						<p class="text-xs text-text-muted leading-relaxed">
							{tx('step2.risk.description')}
						</p>
						<div class="flex items-center gap-1.5 mt-1">
							<span
								class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-red/25 bg-brand-red/15 text-brand-red">GPS</span
							>
							<span
								class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-orange/25 bg-brand-orange/15 text-brand-orange">{tx('step2.risk.chipIdentity')}</span
							>
							<span
								class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-orange/25 bg-brand-orange/15 text-brand-orange">{tx('step2.risk.chipDevice')}</span
							>
						</div>
					</div>
				</div>

				<!-- Risk Breakdown -->
				<div class="flex flex-col gap-3">
					<p class="text-xs font-bold uppercase tracking-widest text-text-muted">
						{tx('step2.risk.analysisTitle')}
					</p>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="flex items-center gap-1.5 text-white font-medium">
								<i class="fa-solid fa-location-dot text-brand-red text-[10px]"></i>{tx('step2.risk.gpsCoordinates')}
							</span>
							<span class="text-brand-red font-bold">{tx('step2.risk.critical')}</span>
						</div>
						<div class="w-full bg-navy-lighter rounded-full h-2">
							<div
								class="h-2 rounded-full bg-gradient-to-r from-brand-red to-red-400"
								style="width:92%"
							></div>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="flex items-center gap-1.5 text-white font-medium">
								<i class="fa-solid fa-mobile-screen text-brand-orange text-[10px]"></i>{tx('step2.risk.deviceIdentity')}
							</span>
							<span class="text-brand-orange font-bold">{tx('step2.risk.high')}</span>
						</div>
						<div class="w-full bg-navy-lighter rounded-full h-2">
							<div class="h-2 rounded-full bg-brand-orange" style="width:68%"></div>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="flex items-center gap-1.5 text-white font-medium">
								<i class="fa-solid fa-user text-brand-blue text-[10px]"></i>{tx('step2.risk.personalData')}
							</span>
							<span class="text-brand-orange font-bold">{tx('step2.risk.medium')}</span>
						</div>
						<div class="w-full bg-navy-lighter rounded-full h-2">
							<div
								class="h-2 rounded-full bg-gradient-to-r from-brand-orange to-yellow-400"
								style="width:48%"
							></div>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="flex items-center gap-1.5 text-white font-medium">
								<i class="fa-solid fa-clock text-text-muted text-[10px]"></i>{tx('step2.risk.timestamp')}
							</span>
							<span class="text-text-muted font-bold">{tx('step2.risk.low')}</span>
						</div>
						<div class="w-full bg-navy-lighter rounded-full h-2">
							<div class="h-2 rounded-full bg-gray-500" style="width:22%"></div>
						</div>
					</div>
				</div>

				<!-- Before/After preview -->
				<div class="grid grid-cols-2 gap-3">
					<div
						class="flex flex-col items-center gap-2 px-3 py-3 rounded-xl border border-brand-red/25 bg-brand-red/8"
					>
						<span class="text-[10px] font-bold uppercase tracking-widest text-brand-red"
							>{tx('step2.risk.now')}</span
						>
						<span class="text-2xl font-black text-brand-red">72</span>
						<span class="text-[10px] text-text-muted">{tx('step2.risk.score')}</span>
					</div>
					<div
						class="flex flex-col items-center gap-2 px-3 py-3 rounded-xl border border-brand-green/25 bg-brand-green/8"
					>
						<span class="text-[10px] font-bold uppercase tracking-widest text-brand-green"
							>{tx('step2.risk.afterCleaning')}</span
						>
						<span class="text-2xl font-black text-brand-green">100</span>
						<span class="text-[10px] text-text-muted">{tx('step2.risk.cleanScore')}</span>
					</div>
				</div>

				<!-- CTA hint -->
				<div
					class="flex items-start gap-3 px-4 py-3 rounded-xl border border-brand-green/20 bg-brand-green/8"
				>
					<i class="fa-solid fa-shield-halved text-brand-green text-sm mt-0.5"></i>
					<p class="text-xs text-text-muted">
						{tx('step2.risk.reducePre')} <span class="text-brand-green font-semibold">{tx('step2.risk.reduceHighlight')}</span>
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile CTA hint -->
	<div
		class="lg:hidden flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-green/20 bg-brand-green/6"
	>
		<i class="fa-solid fa-shield-halved text-brand-green text-sm"></i>
		<p class="text-xs text-text-muted">
			{tx('step2.risk.reducePre')} <span class="text-brand-green font-semibold">{tx('step2.risk.reduceHighlight')}</span>
		</p>
	</div>
</main>

<!-- Mobile Fixed Bottom CTA -->
<div
	class="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-4 z-50 border-t border-gray-800 bg-navy-main"
>
	<div class="flex gap-3">
		<a
			href="/step3"
			class="flex-1 py-4 rounded-xl bg-brand-green text-white font-bold text-sm shadow-glow-green flex items-center justify-center gap-2 active:scale-95 transition-transform"
		>
			<i class="fa-solid fa-wand-magic-sparkles"></i> {tx('step1.actions.startCleaning')}
		</a>
		<button
			class="px-5 py-4 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm flex items-center gap-2 active:scale-95 transition-transform"
		>
			<i class="fa-solid fa-sliders"></i>
		</button>
	</div>
</div>
