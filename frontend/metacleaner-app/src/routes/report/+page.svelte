<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	onMount(() => {
		void goto(resolve('/reports' as Pathname), { replaceState: true });
	});
</script>
