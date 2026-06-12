<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CountdownTimer from './CountdownTimer.svelte';

	const { Story } = defineMeta({
		title: 'Auth/CountdownTimer',
		component: CountdownTimer,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<!-- Running: OTP resend window (MM:SS format) -->
<Story name="Running">
	<div class="flex items-center gap-2 p-4">
		<i class="fa-regular fa-clock text-sm text-text-muted"></i>
		<span class="text-xs text-text-muted">Code expires in</span>
		<CountdownTimer durationSeconds={899} class="text-sm font-bold text-white" />
	</div>
</Story>

<!-- Expired: timer has reached zero -->
<Story name="Expired">
	<div class="flex items-center gap-2 p-4">
		<i class="fa-regular fa-clock text-sm text-text-muted"></i>
		<span class="text-xs text-text-muted">Code expires in</span>
		<CountdownTimer durationSeconds={0} class="text-sm font-bold text-brand-red" />
	</div>
</Story>

<!-- CustomDuration: long-running timer with HH:MM:SS format -->
<Story name="CustomDuration">
	<div class="flex items-center gap-2 p-4">
		<i class="fa-regular fa-clock text-sm text-text-muted"></i>
		<span class="text-xs text-text-muted">Link valid for</span>
		<CountdownTimer durationSeconds={86387} class="text-sm font-bold text-white" />
	</div>
</Story>
