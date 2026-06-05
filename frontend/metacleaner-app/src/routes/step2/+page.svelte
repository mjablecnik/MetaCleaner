<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	if (browser) {
		goto(resolve('/' as Pathname), { replaceState: true });
	}
</script>
