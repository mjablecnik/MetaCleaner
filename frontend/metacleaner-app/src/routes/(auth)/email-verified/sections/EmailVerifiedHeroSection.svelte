<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import AnimatedCheckmark from '../components/AnimatedCheckmark.svelte';

	interface Props {
		userEmail: string;
	}

	const { userEmail }: Props = $props();
</script>

<!-- Mobile hero (standalone, outside card) -->
<div class="flex flex-col items-center gap-3 pb-2 pt-4 lg:hidden">
	<AnimatedCheckmark size="sm" />
	<div class="flex flex-col items-center gap-1.5 text-center">
		<h1 class="text-2xl font-black leading-tight text-white">
			{tx('auth.emailVerified.hero.title')}
		</h1>
		<p class="max-w-xs text-sm leading-relaxed text-text-muted">
			{tx('auth.emailVerified.hero.subtitle')}
		</p>
		<div
			class="mt-1 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-1.5"
		>
			<i class="fa-regular fa-envelope text-xs text-brand-green"></i>
			<span class="text-sm font-semibold text-white">{userEmail}</span>
			<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
		</div>
	</div>
</div>

<!-- Desktop hero (inside success card) -->
<div class="hidden flex-col items-center gap-4 py-2 lg:flex">
	<AnimatedCheckmark size="lg" />
	<div class="text-center">
		<h2 class="text-2xl font-bold text-white">
			{tx('auth.emailVerified.hero.title')}
		</h2>
		<p class="mt-1.5 text-sm leading-relaxed text-text-muted">
			{tx('auth.emailVerified.hero.subtitle')}
		</p>
		<div
			class="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-1.5"
		>
			<i class="fa-regular fa-envelope text-xs text-brand-green"></i>
			<span class="text-sm font-semibold text-white">{userEmail}</span>
			<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
		</div>
	</div>
</div>
