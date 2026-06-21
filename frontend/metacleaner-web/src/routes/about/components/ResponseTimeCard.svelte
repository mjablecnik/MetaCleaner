<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<div
	class="bg-navy-card rounded-2xl border border-brand-green/30 p-4 lg:p-5 flex items-start gap-4"
>
	<div
		class="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green shrink-0"
	>
		<i class="fa-solid fa-clock text-sm"></i>
	</div>
	<div>
		<p class="text-sm font-semibold text-white mb-1">{m.about_contact_response_title()}</p>
		<p class="text-xs text-text-muted leading-relaxed">{m.about_contact_response_desc()}</p>
	</div>
</div>
