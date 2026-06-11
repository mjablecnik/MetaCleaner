<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthFormCard from './AuthFormCard.svelte';

	const { Story } = defineMeta({
		title: 'Auth/AuthFormCard',
		component: AuthFormCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="WithTitle">
	<div class="w-96 p-4">
		<AuthFormCard title="Welcome back">
			{#snippet children()}
				<p class="text-sm text-text-muted">Form content goes here.</p>
			{/snippet}
		</AuthFormCard>
	</div>
</Story>

<Story name="WithTitleAndSubtitle">
	<div class="w-96 p-4">
		<AuthFormCard title="Welcome back" subtitle="Sign in to your account to continue.">
			{#snippet children()}
				<p class="text-sm text-text-muted">Form content goes here.</p>
			{/snippet}
		</AuthFormCard>
	</div>
</Story>

<Story name="WithContent">
	<div class="w-96 p-4">
		<AuthFormCard title="Create account" subtitle="Fill in the details below to get started.">
			{#snippet children()}
				<div class="flex flex-col gap-3">
					<input
						type="email"
						placeholder="Email address"
						class="w-full rounded-xl border border-navy-lighter bg-navy-main px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none"
					/>
					<button
						type="button"
						class="w-full rounded-xl bg-brand-green py-3 text-sm font-bold text-white shadow-glow-green"
					>
						Continue
					</button>
				</div>
			{/snippet}
		</AuthFormCard>
	</div>
</Story>
