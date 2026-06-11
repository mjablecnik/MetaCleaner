<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthLayout from './AuthLayout.svelte';

	const { Story } = defineMeta({
		title: 'Auth/AuthLayout',
		component: AuthLayout,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="Default">
	<AuthLayout>
		{#snippet children()}
			<div class="flex flex-1 items-center justify-center p-8">
				<p class="text-sm text-text-muted">Page content goes here</p>
			</div>
		{/snippet}
	</AuthLayout>
</Story>

<Story name="WithContent">
	<AuthLayout>
		{#snippet children()}
			<nav
				class="mx-auto flex w-full max-w-[1100px] items-center justify-between px-6 py-6"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue"
					>
						<i class="fa-solid fa-shield-halved text-xl"></i>
					</div>
					<span class="text-xl font-bold tracking-tight text-white">MetaCleaner</span>
				</div>
			</nav>
			<main
				class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-6 pb-16"
			>
				<div class="w-full max-w-md rounded-2xl border border-gray-800 bg-navy-card p-8">
					<h2 class="text-xl font-bold text-white">Sign in to your account</h2>
					<p class="mt-2 text-sm text-text-muted">
						The layout provides the background gradient and min-h-screen container.
					</p>
				</div>
			</main>
		{/snippet}
	</AuthLayout>
</Story>
