<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		durationSeconds: number;
		onExpire?: () => void;
		class?: string;
	}

	let { durationSeconds, onExpire, class: className = '' }: Props = $props();

	let remaining = $state(durationSeconds);

	function formatTime(seconds: number): string {
		if (durationSeconds >= 3600) {
			const h = Math.floor(seconds / 3600);
			const min = Math.floor((seconds % 3600) / 60);
			const s = seconds % 60;
			return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
		}
		const min = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${min}:${String(s).padStart(2, '0')}`;
	}

	const formatted = $derived(formatTime(remaining));

	onMount(() => {
		const interval = setInterval(() => {
			if (remaining > 0) {
				remaining--;
			} else {
				clearInterval(interval);
				onExpire?.();
			}
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<span class="tabular-nums {className}">{formatted}</span>
