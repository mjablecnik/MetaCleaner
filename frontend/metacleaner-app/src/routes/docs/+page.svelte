<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import DocsIntroSection from './sections/DocsIntroSection.svelte';
</script>

<svelte:head>
	<title>{tx('docs.meta.title')}</title>
</svelte:head>

<DocsIntroSection />
