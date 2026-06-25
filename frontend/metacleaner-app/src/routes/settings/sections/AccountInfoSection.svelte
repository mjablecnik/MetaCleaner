<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { SettingsProfile } from '$lib/repositories/settingsRepository';

	interface Props {
		profile: SettingsProfile;
		onSave?: () => void;
	}

	let { profile, onSave }: Props = $props();
</script>

<!-- Avatar row -->
<div class="flex items-center gap-4">
	<div class="relative flex-shrink-0">
		<img
			src={profile.avatarUrl}
			alt={profile.name}
			class="h-16 w-16 rounded-2xl border-2 border-brand-blue/40 object-cover"
		/>
		<button
			type="button"
			class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-navy-main bg-brand-blue"
		>
			<i class="fa-solid fa-pen text-[9px] text-white"></i>
		</button>
	</div>
	<div>
		<p class="text-sm font-bold text-white lg:text-base">{profile.name}</p>
		<p class="text-xs text-text-muted">{profile.email}</p>
		<div class="mt-1.5 flex items-center gap-1.5 lg:gap-2">
			<span
				class="rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[9px] font-bold uppercase text-brand-green"
				>{tx('settings.account.proBadge')}</span
			>
			<span
				class="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 py-0.5 text-[9px] font-bold uppercase text-brand-blue"
				>{tx('settings.account.verifiedBadge')}</span
			>
		</div>
	</div>
</div>

<!-- Form fields -->
<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
	<div class="flex flex-col gap-1.5">
		<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
			>{tx('settings.account.nameLabel')}</label
		>
		<input
			type="text"
			value={profile.name}
			class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
		/>
	</div>
	<div class="flex flex-col gap-1.5">
		<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
			>{tx('settings.account.emailLabel')}</label
		>
		<input
			type="email"
			value={profile.email}
			class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
		/>
	</div>
</div>
<div class="flex flex-col gap-1.5">
	<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
		>{tx('settings.account.companyLabel')}</label
	>
	<input
		type="text"
		placeholder={tx('settings.account.companyPlaceholder')}
		class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
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
