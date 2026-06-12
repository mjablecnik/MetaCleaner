<script lang="ts">
	interface Props {
		values?: string[];
		error?: string;
	}

	let { values = $bindable(['', '', '', '', '', '']), error = '' }: Props = $props();

	let inputEls: HTMLInputElement[] = $state([]);
	let shaking = $state(false);

	$effect(() => {
		if (error) {
			shaking = true;
			const t = setTimeout(() => {
				shaking = false;
			}, 400);
			return () => clearTimeout(t);
		}
	});

	export function focus() {
		inputEls[0]?.focus();
	}

	function handleInput(idx: number, e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const digit = input.value.replace(/[^0-9]/g, '').slice(0, 1);
		const next = [...values];
		next[idx] = digit;
		values = next;
		if (digit && idx < 5) {
			inputEls[idx + 1]?.focus();
		}
	}

	function handleKeydown(idx: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !values[idx] && idx > 0) {
			inputEls[idx - 1]?.focus();
		}
	}

	function handlePaste(e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text') ?? '';
		const digits = text
			.replace(/[^0-9]/g, '')
			.slice(0, 6)
			.split('');
		const next = [...values];
		digits.forEach((d, i) => {
			next[i] = d;
		});
		values = next;
		const focusIdx = Math.min(digits.length, 5);
		inputEls[focusIdx]?.focus();
		e.preventDefault();
	}
</script>

<div class="flex flex-col gap-1.5">
	<div class="otp-wrapper {shaking ? 'shake' : ''}">
		{#each values as val, idx (idx)}
			<input
				bind:this={inputEls[idx]}
				type="text"
				inputmode="numeric"
				pattern="[0-9]*"
				maxlength={1}
				value={val}
				oninput={(e) => handleInput(idx, e)}
				onkeydown={(e) => handleKeydown(idx, e)}
				onpaste={handlePaste}
				class="otp-input text-center font-bold text-white transition-[border-color,box-shadow] focus:outline-none"
				style="background: var(--color-navy-main); border-color: {val
					? 'var(--color-brand-green)'
					: 'var(--color-navy-lighter)'}; box-shadow: {val
					? '0 0 8px var(--color-brand-green-20)'
					: 'none'};"
				onfocus={(ev) => {
					const el = ev.currentTarget as HTMLInputElement;
					if (!el.value) el.style.borderColor = 'var(--color-brand-blue)';
				}}
				onblur={(ev) => {
					const el = ev.currentTarget as HTMLInputElement;
					el.style.borderColor = el.value
						? 'var(--color-brand-green)'
						: 'var(--color-navy-lighter)';
				}}
			/>
		{/each}
	</div>

	{#if error}
		<span class="text-[12px] text-brand-red">
			<i class="fa-solid fa-circle-exclamation mr-1"></i>{error}
		</span>
	{/if}
</div>

<style>
	.otp-wrapper {
		display: flex;
		gap: 0.375rem;
	}

	@media (min-width: 1024px) {
		.otp-wrapper {
			gap: 0.5rem;
		}
	}

	.otp-input {
		border: 1px solid var(--color-navy-lighter);
		border-radius: 10px;
		height: 52px;
		font-size: 1.25rem;
		flex: 1;
	}

	@media (min-width: 1024px) {
		.otp-input {
			border-radius: 12px;
			width: 52px;
			height: 60px;
			font-size: 1.5rem;
			flex: none;
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-6px);
		}
		40% {
			transform: translateX(6px);
		}
		60% {
			transform: translateX(-4px);
		}
		80% {
			transform: translateX(4px);
		}
	}

	.otp-wrapper.shake {
		animation: shake 0.4s ease;
	}
</style>
