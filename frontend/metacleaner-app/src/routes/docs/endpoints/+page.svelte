<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import DocsEndpointsSection from '../sections/DocsEndpointsSection.svelte';
</script>

<svelte:head>
	<title>{tx('docs.meta.title')} — {tx('docs.sidebar.endpointsHeading')}</title>
</svelte:head>

<DocsEndpointsSection />
