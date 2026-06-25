<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';

	interface Props {
		onSave?: () => void;
	}

	let { onSave }: Props = $props();
</script>

<!-- Avatar row -->
<div class="flex items-center gap-4">
	<div
		class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-brand-blue/40 bg-brand-blue/10"
	>
		<i class="fa-solid fa-user text-2xl text-brand-blue"></i>
	</div>
	<div>
		<div class="mt-1.5 flex items-center gap-1.5 lg:gap-2">
			<span
				class="rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[9px] font-bold text-brand-green uppercase"
				>{tx('settings.account.proBadge')}</span
			>
			<span
				class="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 py-0.5 text-[9px] font-bold text-brand-blue uppercase"
				>{tx('settings.account.verifiedBadge')}</span
			>
		</div>
	</div>
</div>

<!-- Form fields -->
<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
	<div class="flex flex-col gap-1.5">
		<label
			for="settings-first-name"
			class="text-xs font-semibold tracking-wider text-text-muted uppercase"
			>{tx('settings.account.firstNameLabel')}</label
		>
		<input
			id="settings-first-name"
			type="text"
			class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
		/>
	</div>
	<div class="flex flex-col gap-1.5">
		<label
			for="settings-last-name"
			class="text-xs font-semibold tracking-wider text-text-muted uppercase"
			>{tx('settings.account.lastNameLabel')}</label
		>
		<input
			id="settings-last-name"
			type="text"
			class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
		/>
	</div>
</div>
<div class="flex flex-col gap-1.5">
	<label for="settings-email" class="text-xs font-semibold tracking-wider text-text-muted uppercase"
		>{tx('settings.account.emailLabel')}</label
	>
	<input
		id="settings-email"
		type="email"
		class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
	/>
</div>
<button
	type="button"
	onclick={onSave}
	class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-sm font-bold text-white shadow-glow-blue transition-all hover:bg-blue-400 active:scale-95 lg:py-2.5"
>
	<i class="fa-solid fa-floppy-disk"></i>
	{tx('settings.account.saveButton')}
</button>
