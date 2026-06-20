<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	interface Props {
		currentPath: string;
	}

	let { currentPath }: Props = $props();

	const now = new Date();
	const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);
</script>

<div
	class="w-full max-w-md bg-navy-card rounded-2xl border border-gray-800 overflow-hidden shadow-card"
>
	<!-- Terminal Header -->
	<div class="flex items-center gap-2 px-4 py-3 bg-navy-lighter border-b border-gray-800">
		<div class="w-3 h-3 rounded-full bg-brand-red/70"></div>
		<div class="w-3 h-3 rounded-full bg-brand-orange/70"></div>
		<div class="w-3 h-3 rounded-full bg-brand-green/70"></div>
		<span class="ml-3 text-xs font-mono text-text-muted">{m.error_404_terminal_title()}</span>
		<span class="ml-auto flex items-center gap-1.5 text-xs font-mono text-brand-red">
			<span class="live-dot"></span>
			{m.error_404_terminal_live()}
		</span>
	</div>

	<!-- Terminal Body -->
	<div class="px-5 py-5 font-mono text-xs space-y-2">
		<div class="terminal-line terminal-line--1 flex items-start gap-2">
			<span class="text-brand-blue shrink-0">$</span>
			<span class="text-text-muted">fetch <span class="text-white">{currentPath}</span></span>
		</div>
		<div class="terminal-line terminal-line--2 flex items-start gap-2">
			<span class="text-brand-red shrink-0">✗</span>
			<span class="text-text-muted"
				>Status: <span class="text-brand-red font-bold">{m.error_404_terminal_status()}</span></span
			>
		</div>
		<div class="terminal-line terminal-line--3 flex items-start gap-2">
			<span class="text-brand-green shrink-0">✓</span>
			<span class="text-text-muted"
				>Privacy: <span class="text-brand-green">{m.error_404_terminal_privacy()}</span></span
			>
		</div>
		<div class="terminal-line terminal-line--4 flex items-start gap-2">
			<span class="text-brand-blue shrink-0">i</span>
			<span class="text-text-muted">Time: <span class="text-white">{timestamp}</span></span>
		</div>
		<div class="terminal-line terminal-line--5 flex items-start gap-2">
			<span class="text-brand-orange shrink-0">!</span>
			<span class="text-text-muted"
				>Suggested: <span class="text-brand-orange">{m.error_404_terminal_suggestion()}</span></span
			>
		</div>
		<div class="terminal-line terminal-line--cursor flex items-start gap-2 pt-1">
			<span class="text-brand-green shrink-0">$</span>
			<span class="text-text-muted">_<span class="blink text-brand-green">|</span></span>
		</div>
	</div>

	<!-- Footer -->
	<div class="border-t border-gray-800 px-5 py-3 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<span class="flex items-center gap-1.5 text-xs text-text-muted">
				<i class="fa-solid fa-shield-halved text-brand-green text-[10px]"></i>
				{m.error_404_terminal_secure()}
			</span>
			<span class="flex items-center gap-1.5 text-xs text-text-muted">
				<i class="fa-solid fa-server text-brand-blue text-[10px]"></i>
				{m.error_404_terminal_server_ok()}
			</span>
		</div>
		<span
			class="px-2 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red text-[10px] font-bold uppercase tracking-wider"
			>404</span
		>
	</div>
</div>

<style>
	@keyframes fade-in-line {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes pulse-dot {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.7);
		}
	}

	@keyframes blink-cursor {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	.live-dot {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #ef4444;
		box-shadow: 0 0 8px #ef4444;
		animation: pulse-dot 1.5s ease-in-out infinite;
	}

	.terminal-line {
		opacity: 0;
		animation: fade-in-line 0.4s forwards;
	}

	.terminal-line--1 {
		animation-delay: 0.2s;
	}
	.terminal-line--2 {
		animation-delay: 0.7s;
	}
	.terminal-line--3 {
		animation-delay: 1.2s;
	}
	.terminal-line--4 {
		animation-delay: 1.7s;
	}
	.terminal-line--5 {
		animation-delay: 2.2s;
	}
	.terminal-line--cursor {
		animation-delay: 2.7s;
	}

	.blink {
		animation: blink-cursor 1.4s step-end 2.7s infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.terminal-line,
		.terminal-line--cursor {
			opacity: 1 !important;
			animation-duration: 0ms !important;
		}

		.blink,
		.live-dot {
			animation-duration: 0ms !important;
		}
	}
</style>
