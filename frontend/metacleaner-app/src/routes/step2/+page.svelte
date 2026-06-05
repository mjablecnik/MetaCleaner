<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	goto(resolve('/' as Pathname), { replaceState: true });
</script>
