<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Card from '$lib/shared/elements/Card.svelte';
	import AccordionCard from '$lib/shared/elements/AccordionCard.svelte';
</script>

<!-- Desktop: side-by-side grid (≥1024px) -->
<div class="hidden lg:block">
	<Card>
		<div class="mb-1 flex items-center gap-2">
			<i class="fa-solid fa-book-open text-sm text-brand-blue"></i>
			<p class="text-sm font-semibold text-white">{tx('apiKeys.guide.title')}</p>
		</div>
		<div class="mt-4 grid grid-cols-2 gap-4">
			<div>
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
					Authorization Header
				</p>
				<div class="rounded-xl border border-gray-800 bg-navy-main p-4 font-mono text-xs">
					<span class="text-brand-green">Authorization</span>
					<span class="text-white">: Bearer </span>
					<span class="text-brand-orange">YOUR_API_KEY</span>
				</div>
			</div>
			<div>
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
					cURL example
				</p>
				<div
					class="rounded-xl border border-gray-800 bg-navy-main p-4 font-mono text-xs leading-relaxed"
				>
					<span class="text-brand-orange">curl</span><span class="text-white"> -H </span><span
						class="text-brand-green">"Authorization: Bearer mtd_key_..."</span
					><br />
					<span class="text-white">&nbsp;&nbsp;</span><span class="text-brand-green"
						>"https://api.metacleaner.app/v1/..."</span
					>
				</div>
			</div>
			<div>
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
					JavaScript fetch
				</p>
				<div
					class="rounded-xl border border-gray-800 bg-navy-main p-4 font-mono text-xs leading-relaxed"
				>
					<span class="text-brand-orange">fetch</span><span class="text-white">(</span><span
						class="text-brand-green">"https://api.metacleaner.app/v1/..."</span
					><span class="text-white">, &#123;</span><br />
					<span class="text-white">&nbsp;&nbsp;headers: &#123;</span><br />
					<span class="text-white">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="text-brand-green"
						>Authorization</span
					><span class="text-white">: </span><span class="text-brand-green">`Bearer $&#123;apiKey&#125;`</span
					><br />
					<span class="text-white">&nbsp;&nbsp;&#125;</span><br />
					<span class="text-white">&#125;)</span>
				</div>
			</div>
		</div>
	</Card>
</div>

<!-- Mobile: accordion (below 1024px) -->
<div class="lg:hidden">
	<AccordionCard title={tx('apiKeys.guide.title')} icon="fa-solid fa-book-open" borderColor="blue">
		<div class="flex flex-col gap-4 pt-2">
			<div>
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
					Authorization Header
				</p>
				<div class="rounded-xl border border-gray-800 bg-navy-main p-3.5 font-mono text-xs">
					<span class="text-brand-green">Authorization</span>
					<span class="text-white">: Bearer </span>
					<span class="text-brand-orange">YOUR_API_KEY</span>
				</div>
			</div>
			<div>
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
					cURL example
				</p>
				<div
					class="rounded-xl border border-gray-800 bg-navy-main p-3.5 font-mono text-xs leading-relaxed"
				>
					<span class="text-brand-orange">curl</span><span class="text-white"> -H </span><span
						class="text-brand-green">"Authorization: Bearer mtd_key_..."</span
					><br />
					<span class="text-white">&nbsp;&nbsp;</span><span class="text-brand-green"
						>"https://api.metacleaner.app/v1/..."</span
					>
				</div>
			</div>
			<div>
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
					JavaScript fetch
				</p>
				<div
					class="rounded-xl border border-gray-800 bg-navy-main p-3.5 font-mono text-xs leading-relaxed"
				>
					<span class="text-brand-orange">fetch</span><span class="text-white">(url, &#123;</span><br
					/>
					<span class="text-white">&nbsp;&nbsp;headers: &#123; </span><span
						class="text-brand-green">Authorization</span
					><span class="text-white">: `Bearer $&#123;key&#125;` &#125;</span><br />
					<span class="text-white">&#125;)</span>
				</div>
			</div>
		</div>
	</AccordionCard>
</div>
