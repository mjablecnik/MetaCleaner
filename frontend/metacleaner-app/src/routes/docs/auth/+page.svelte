<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import DocsAuthSection from '../sections/DocsAuthSection.svelte';
</script>

<svelte:head>
	<title>{tx('docs.meta.title')} — {tx('docs.sidebar.auth')}</title>
</svelte:head>

<DocsAuthSection />
