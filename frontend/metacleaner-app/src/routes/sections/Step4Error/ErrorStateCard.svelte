<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { CleaningError } from '$lib/services/cleaningService';

	export type ErrorType = 'cleaning' | 'connection' | 'timeout';

	export interface SimpleLogEntry {
		text: string;
		isError: boolean;
	}

	interface Props {
		error: CleaningError;
		selectedErrorType: ErrorType;
		onSelectErrorType: (type: ErrorType) => void;
		logEntries: SimpleLogEntry[];
	}

	const { error, selectedErrorType, onSelectErrorType, logEntries }: Props = $props();

	const errorTypes: { id: ErrorType; icon: string; title: string; description: string }[] = [
		{
			id: 'cleaning',
			icon: 'fa-circle-xmark',
			title: 'step4.type.cleaning.title',
			description: 'step4.type.cleaning.description'
		},
		{
			id: 'connection',
			icon: 'fa-wifi',
			title: 'step4.type.connection.title',
			description: 'step4.type.connection.description'
		},
		{
			id: 'timeout',
			icon: 'fa-clock',
			title: 'step4.type.timeout.title',
			description: 'step4.type.timeout.description'
		}
	];
</script>

<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-white">{tx('step3.status.title')}</h3>
		<span
			class="flex items-center gap-1.5 rounded-full border border-brand-red/20 bg-brand-red/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-red uppercase"
		>
			<i class="fa-solid fa-circle-xmark text-[10px]"></i>
			{tx('step4.badge.errorMobile')}
		</span>
	</div>

	<!-- Error Visual -->
	<div class="flex flex-col items-center justify-center gap-4 py-4">
		<div class="relative flex items-center justify-center">
			<div class="pulse-ring absolute h-24 w-24 rounded-full border-2 border-brand-red/20"></div>
			<div
				class="shake flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-red/40 bg-brand-red/10"
			>
				<i class="fa-solid fa-triangle-exclamation text-4xl text-brand-red"></i>
			</div>
			<div
				class="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-red"
			>
				<i class="fa-solid fa-xmark text-[10px] text-white"></i>
			</div>
		</div>
		<div class="text-center">
			<p class="text-base font-bold text-white">{tx('step4.error.cleaningFailed')}</p>
			{#if error?.fileName}
				<p class="mx-auto mt-1 max-w-[220px] text-xs leading-relaxed text-text-muted">
					{tx('step4.detail.file')}
					<span class="font-semibold text-brand-red">{error.fileName}</span>
					{tx('step4.error.couldNotProcess')}.
				</p>
			{/if}
		</div>
	</div>

	<!-- Error Detail Box -->
	<div class="flex flex-col gap-3 rounded-xl border border-brand-red/20 bg-navy-main/80 p-4">
		<div class="flex items-center justify-between">
			<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">
				{tx('step4.detail.title')}
			</p>
			<span
				class="rounded border border-brand-red/25 bg-brand-red/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-red uppercase"
			>
				{error?.code}
			</span>
		</div>
		<div class="flex flex-col gap-2">
			<div class="flex items-start gap-2.5">
				<i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
				<p class="text-xs leading-relaxed text-text-muted">{tx('step4.detail.description')}</p>
			</div>
			<div class="my-1 h-px bg-gray-800"></div>
			<div class="grid grid-cols-2 gap-2">
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] tracking-wider text-text-muted uppercase"
						>{tx('step4.detail.errorCode')}</span
					>
					<span class="font-mono text-xs font-semibold text-white">{error?.hexCode}</span>
				</div>
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] tracking-wider text-text-muted uppercase"
						>{tx('step4.detail.errorTime')}</span
					>
					<span class="font-mono text-xs font-semibold text-white">{error?.timestamp}</span>
				</div>
				{#if error?.fileName}
					<div class="flex flex-col gap-0.5">
						<span class="text-[10px] tracking-wider text-text-muted uppercase"
							>{tx('step4.detail.file')}</span
						>
						<span class="truncate font-mono text-xs font-semibold text-white">{error?.fileName}</span
						>
					</div>
				{/if}
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] tracking-wider text-text-muted uppercase"
						>{tx('step4.detail.phase')}</span
					>
					<span class="font-mono text-xs font-semibold text-white">{error?.phase}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Error Type Selector -->
	<div class="flex flex-col gap-2">
		<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">
			{tx('step4.type.title')}
		</p>
		<div class="flex flex-col gap-1.5">
			{#each errorTypes as errorType (errorType.id)}
				{@const isActive = selectedErrorType === errorType.id}
				<button
					onclick={() => onSelectErrorType(errorType.id)}
					class="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all {isActive
						? 'border-brand-red/30 bg-brand-red/10'
						: 'border-gray-800 bg-navy-main/60 hover:border-gray-700'}"
				>
					<div
						class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border {isActive
							? 'border-brand-red/25 bg-brand-red/15'
							: 'border-gray-700 bg-navy-lighter'}"
					>
						<i
							class="fa-solid {errorType.icon} text-xs {isActive
								? 'text-brand-red'
								: 'text-text-muted'}"
						></i>
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-xs font-semibold {isActive ? 'text-white' : 'text-text-muted'}">
							{tx(errorType.title)}
						</p>
						<p class="text-[10px] text-text-muted">{tx(errorType.description)}</p>
					</div>
					<i
						class="fa-solid {isActive
							? 'fa-circle-dot text-brand-red'
							: 'fa-circle text-gray-700'} text-xs"
					></i>
				</button>
			{/each}
		</div>
	</div>

	<!-- Error Log -->
	<div class="flex flex-col gap-1">
		<p class="mb-1 text-xs font-semibold tracking-wider text-text-muted uppercase">
			{tx('step4.log.title')}
		</p>
		<div
			class="flex max-h-[130px] flex-col gap-1.5 overflow-y-auto rounded-xl border border-gray-800 bg-navy-main/80 p-3 font-mono"
		>
			{#each (logEntries ?? []) as entry, i (i)}
				<div class="flex items-start gap-2">
					<span class="mt-0.5 flex-shrink-0 text-[10px] text-text-muted">—</span>
					<span class="text-[11px] {entry.isError ? 'text-brand-red' : 'text-brand-green'}">
						{entry.text}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
