<script lang="ts">
	import BottomSheet from '$lib/shared/components/BottomSheet.svelte';
	import ToggleSwitch from '$lib/shared/elements/ToggleSwitch.svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		open: boolean;
		onClose: () => void;
		gpsEnabled?: boolean;
		dateTimeEnabled?: boolean;
		deviceInfoEnabled?: boolean;
		commentsEnabled?: boolean;
	}

	let {
		open,
		onClose,
		gpsEnabled = $bindable(true),
		dateTimeEnabled = $bindable(true),
		deviceInfoEnabled = $bindable(true),
		commentsEnabled = $bindable(false),
	}: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<BottomSheet {open} title={tx('options.title')} {onClose}>
	<div class="px-5 py-4 flex flex-col gap-4">
		<div class="flex items-center justify-between py-2">
			<div>
				<p class="text-sm font-semibold text-white">{tx('options.gpsLocation')}</p>
				<p class="text-xs text-text-muted mt-0.5">{tx('options.gpsDesc')}</p>
			</div>
			<ToggleSwitch
				checked={gpsEnabled}
				onchange={(v) => (gpsEnabled = v)}
			/>
		</div>
		<div class="flex items-center justify-between py-2">
			<div>
				<p class="text-sm font-semibold text-white">{tx('options.dateTime')}</p>
				<p class="text-xs text-text-muted mt-0.5">{tx('options.dateTimeDesc')}</p>
			</div>
			<ToggleSwitch
				checked={dateTimeEnabled}
				onchange={(v) => (dateTimeEnabled = v)}
			/>
		</div>
		<div class="flex items-center justify-between py-2">
			<div>
				<p class="text-sm font-semibold text-white">{tx('options.deviceInfo')}</p>
				<p class="text-xs text-text-muted mt-0.5">{tx('options.deviceInfoDesc')}</p>
			</div>
			<ToggleSwitch
				checked={deviceInfoEnabled}
				onchange={(v) => (deviceInfoEnabled = v)}
			/>
		</div>
		<div class="flex items-center justify-between py-2">
			<div>
				<p class="text-sm font-semibold text-white">{tx('options.comments')}</p>
				<p class="text-xs text-text-muted mt-0.5">{tx('options.commentsDesc')}</p>
			</div>
			<ToggleSwitch
				checked={commentsEnabled}
				onchange={(v) => (commentsEnabled = v)}
			/>
		</div>
	</div>
	<div class="px-5 pb-6 pt-2">
		<button
			onclick={onClose}
			class="w-full py-4 rounded-xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center gap-2"
		>
			<i class="fa-solid fa-check"></i>
			{tx('options.save')}
		</button>
	</div>
</BottomSheet>
