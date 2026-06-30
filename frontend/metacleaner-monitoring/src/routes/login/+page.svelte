<script lang="ts">
	import type { ActionData } from './$types.js';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign in — Monitorly</title>
</svelte:head>

<div class="flex items-center justify-center p-6" style="min-height: calc(100vh - 4rem)">
	<div class="bg-card border border-surface rounded-2xl p-8 w-full max-w-sm shadow-xl">
		<div class="text-center mb-8">
			<div
				class="inline-flex w-12 h-12 rounded-xl bg-primary items-center justify-center text-white font-bold text-xl mb-4"
			>
				M
			</div>
			<h1 class="text-xl font-bold text-textMain">Dashboard Access</h1>
			<p class="text-sm text-textSec mt-1">Enter the password to continue</p>
		</div>

		{#if form?.error}
			<div class="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
				Invalid password. Please try again.
			</div>
		{/if}

		<form method="POST">
			<div class="mb-4">
				<label for="password" class="block text-sm font-medium text-textSec mb-1.5">Password</label>
				<input
					id="password"
					type="password"
					name="password"
					autocomplete="current-password"
					required
					class="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-textMain text-sm placeholder-textSec focus:outline-none focus:border-primary transition-colors"
					placeholder="Dashboard password"
				/>
			</div>
			<button
				type="submit"
				class="w-full py-2.5 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
			>
				Sign in
			</button>
		</form>
	</div>
</div>
