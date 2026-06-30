<script lang="ts">
	const SITE = 'https://metacleaner.app';
	const DEFAULT_IMAGE = `${SITE}/og-default.png`;

	interface Props {
		title: string;
		description: string;
		path: string;
		image?: string;
	}

	let { title, description, path, image = DEFAULT_IMAGE }: Props = $props();

	const url = $derived(`${SITE}${path}`);
	const csUrl = $derived(`${SITE}/cs${path}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<link rel="alternate" hreflang="en" href={url} />
	<link rel="alternate" hreflang="cs" href={csUrl} />
	<link rel="alternate" hreflang="x-default" href={url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="MetaCleaner" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
</svelte:head>
