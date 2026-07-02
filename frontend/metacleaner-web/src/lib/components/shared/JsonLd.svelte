<script lang="ts">
	let { data }: { data: object } = $props();
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<${'script'} type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</${'script'}>`}
</svelte:head>
