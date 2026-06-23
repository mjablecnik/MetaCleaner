<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import DocsErrorCodesSection from '../sections/DocsErrorCodesSection.svelte';
</script>

<svelte:head>
	<title>{tx('docs.meta.title')} — {tx('docs.sidebar.errors')}</title>
</svelte:head>

<DocsErrorCodesSection />
