<script lang="ts">
	import BrandLogo from './BrandLogo.svelte';

	interface Props {
		tagline: string;
	}

	const { tagline }: Props = $props();
</script>

<div class="flex flex-col gap-5">
	<BrandLogo size="lg" />
	<p class="text-sm text-text-muted leading-relaxed">{tagline}</p>
</div>
