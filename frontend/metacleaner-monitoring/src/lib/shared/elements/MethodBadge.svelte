<script lang="ts">
	type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

	interface Props {
		method: HttpMethod;
	}

	let { method }: Props = $props();

	const methodConfig: Record<HttpMethod, string> = {
		GET: 'bg-blue/20 text-blue',
		POST: 'bg-secondary/20 text-secondary',
		PUT: 'bg-success/20 text-success',
		DELETE: 'bg-error/20 text-error'
	};

	const classes = $derived(methodConfig[method]);
</script>

<span class="px-2 py-0.5 text-xs font-mono rounded font-semibold {classes}">{method}</span>
