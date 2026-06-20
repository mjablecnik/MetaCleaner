<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<div class="flex flex-col gap-3 p-6 rounded-xl bg-navy-card border border-border">
	<div class="flex items-center gap-2">
		<i class="fa-solid fa-clock text-brand-blue text-sm"></i>
		<h3 class="text-base font-semibold">{m.about_contact_response_title()}</h3>
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 rounded-full bg-brand-green shrink-0"></div>
			<span class="text-sm text-text-muted">Business inquiries: <span class="text-white font-medium">24h</span></span>
		</div>
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 rounded-full bg-brand-orange shrink-0"></div>
			<span class="text-sm text-text-muted">Security reports: <span class="text-white font-medium">4h</span></span>
		</div>
	</div>

	<p class="text-xs text-text-muted leading-relaxed">{m.about_contact_response_desc()}</p>
</div>
