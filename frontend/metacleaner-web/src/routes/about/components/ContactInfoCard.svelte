<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<div class="flex flex-col gap-4 p-6 rounded-xl bg-navy-card border border-border">
	<h3 class="text-base font-semibold">{m.about_contact_info_heading()}</h3>

	<div class="flex flex-col gap-3">
		<div class="flex items-start gap-3">
			<div class="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-blue/10 shrink-0 mt-0.5">
				<i class="fa-solid fa-envelope text-brand-blue text-xs"></i>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-text-muted">{m.about_contact_email_label()}</span>
				<a href="mailto:{m.about_contact_email()}" class="text-sm font-medium text-brand-blue hover:underline">
					{m.about_contact_email()}
				</a>
			</div>
		</div>

		<div class="flex items-start gap-3">
			<div class="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-orange/10 shrink-0 mt-0.5">
				<i class="fa-solid fa-shield-halved text-brand-orange text-xs"></i>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-text-muted">{m.about_contact_security_label()}</span>
				<a href="mailto:security@metacleaner.app" class="text-sm font-medium text-brand-orange hover:underline">
					security@metacleaner.app
				</a>
			</div>
		</div>

		<div class="flex items-start gap-3">
			<div class="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-green/10 shrink-0 mt-0.5">
				<i class="fa-solid fa-location-dot text-brand-green text-xs"></i>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-text-muted">{m.about_contact_address_label()}</span>
				<span class="text-sm font-medium">Václavské náměstí 12, 110 00 Praha 1</span>
			</div>
		</div>

		<div class="flex items-start gap-3">
			<div class="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-blue/10 shrink-0 mt-0.5">
				<i class="fa-solid fa-building text-brand-blue text-xs"></i>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-text-muted">{m.about_contact_company_id_label()}</span>
				<span class="text-sm font-medium">IČO: 12345678 · DIČ: CZ12345678</span>
			</div>
		</div>
	</div>
</div>
