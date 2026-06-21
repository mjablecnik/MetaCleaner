<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<div class="bg-navy-card rounded-2xl border border-gray-800 p-5 lg:p-6 flex flex-col gap-5">
	<h3 class="font-bold text-white text-base">{m.about_contact_info_heading()}</h3>

	<div class="flex flex-col gap-4">
		<div class="flex items-start gap-4">
			<div
				class="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0"
			>
				<i class="fa-solid fa-envelope text-sm"></i>
			</div>
			<div>
				<p class="text-xs text-text-muted mb-1">{m.about_contact_email_label()}</p>
				<a
					href="mailto:hello@metacleaner.app"
					class="text-sm text-white hover:text-brand-blue transition-colors"
				>
					hello@metacleaner.app
				</a>
			</div>
		</div>

		<div class="flex items-start gap-4">
			<div
				class="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green shrink-0"
			>
				<i class="fa-solid fa-shield-halved text-sm"></i>
			</div>
			<div>
				<p class="text-xs text-text-muted mb-1">{m.about_contact_security_label()}</p>
				<a
					href="mailto:security@metacleaner.app"
					class="text-sm text-white hover:text-brand-green transition-colors"
				>
					security@metacleaner.app
				</a>
			</div>
		</div>

		<div class="flex items-start gap-4">
			<div
				class="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0"
			>
				<i class="fa-solid fa-location-dot text-sm"></i>
			</div>
			<div>
				<p class="text-xs text-text-muted mb-1">{m.about_contact_address_label()}</p>
				<p class="text-sm text-white">Václavské náměstí 12<br />110 00 Praha 1</p>
			</div>
		</div>

		<div class="flex items-start gap-4">
			<div
				class="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0"
			>
				<i class="fa-solid fa-building text-sm"></i>
			</div>
			<div>
				<p class="text-xs text-text-muted mb-1">{m.about_contact_company_id_label()}</p>
				<p class="text-sm text-white">IČO: 12345678 · DIČ: CZ12345678</p>
			</div>
		</div>
	</div>
</div>
