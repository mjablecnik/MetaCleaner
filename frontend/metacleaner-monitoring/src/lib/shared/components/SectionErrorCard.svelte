<script lang="ts">
	import { t } from '$lib/i18n';

	type ErrorCategory = 'timeout' | 'unauthorized' | 'service_unavailable' | 'request_error';

	interface Props {
		category: ErrorCategory;
		message: string;
		onretry: () => void;
	}

	let { category, message, onretry }: Props = $props();

	const categoryConfig: Record<
		ErrorCategory,
		{ icon: string; iconColor: string; bgColor: string; titleKey: string; descriptionKey: string }
	> = {
		timeout: {
			icon: 'fa-clock',
			iconColor: 'text-amber',
			bgColor: 'bg-amber/10',
			titleKey: 'common_sectionError_timeout_title',
			descriptionKey: 'common_sectionError_timeout_description'
		},
		unauthorized: {
			icon: 'fa-lock',
			iconColor: 'text-error',
			bgColor: 'bg-error/10',
			titleKey: 'common_sectionError_unauthorized_title',
			descriptionKey: 'common_sectionError_unauthorized_description'
		},
		service_unavailable: {
			icon: 'fa-cloud-slash',
			iconColor: 'text-secondary',
			bgColor: 'bg-secondary/10',
			titleKey: 'common_sectionError_service_unavailable_title',
			descriptionKey: 'common_sectionError_service_unavailable_description'
		},
		request_error: {
			icon: 'fa-triangle-exclamation',
			iconColor: 'text-amber',
			bgColor: 'bg-amber/10',
			titleKey: 'common_sectionError_request_error_title',
			descriptionKey: 'common_sectionError_request_error_description'
		}
	};

	const config = $derived(categoryConfig[category] ?? categoryConfig.request_error);
</script>

<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-5 shadow-sm">
	<div class="flex items-start gap-3">
		<div
			class="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full {config.bgColor} flex items-center justify-center"
		>
			<i class="fa-solid {config.icon} {config.iconColor} text-sm"></i>
		</div>
		<div class="flex-1 min-w-0">
			<h3 class="text-sm font-semibold text-textMain">{t(config.titleKey)}</h3>
			<p class="text-xs text-textSec mt-1">{t(config.descriptionKey)}</p>
			{#if message}
				<p class="text-xs text-textSec mt-1 font-mono truncate" title={message}>{message}</p>
			{/if}
			<button
				onclick={onretry}
				class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-xs font-medium text-textMain transition-colors"
			>
				<i class="fa-solid fa-rotate-right text-xs"></i>
				{t('common_sectionError_retry')}
			</button>
		</div>
	</div>
</div>
