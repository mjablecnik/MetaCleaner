<script lang="ts">
	interface Props {
		message: string;
		show: boolean;
		icon?: string;
	}

	const { message, show, icon = 'fa-solid fa-circle-check' }: Props = $props();
</script>

<!-- Desktop (bottom-right, hidden on mobile) -->
<div class="toast-desktop" class:show>
	<i class="{icon} text-brand-green"></i>
	<span class="text-sm font-semibold text-white">{message}</span>
</div>

<!-- Mobile (bottom-center, hidden on desktop) -->
<div class="toast-mobile" class:show>
	<i class="{icon} text-brand-green"></i>
	<span class="text-sm font-semibold text-white">{message}</span>
</div>

<style>
	.toast-desktop {
		display: none;
		position: fixed;
		bottom: 32px;
		right: 32px;
		z-index: 999;
		background: var(--color-navy-card);
		border: 1px solid var(--color-brand-green);
		border-radius: 12px;
		padding: 14px 20px;
		align-items: center;
		gap: 12px;
		box-shadow: var(--shadow-dropdown);
		transform: translateY(100px);
		opacity: 0;
		transition: all 0.3s ease;
	}

	.toast-desktop.show {
		display: flex;
		transform: translateY(0);
		opacity: 1;
	}

	.toast-mobile {
		display: none;
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%) translateY(100px);
		z-index: 999;
		background: var(--color-navy-card);
		border: 1px solid var(--color-brand-green);
		border-radius: 12px;
		padding: 12px 18px;
		align-items: center;
		gap: 10px;
		box-shadow: var(--shadow-dropdown);
		opacity: 0;
		transition: all 0.3s ease;
		white-space: nowrap;
	}

	.toast-mobile.show {
		display: flex;
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}

	@media (min-width: 1024px) {
		.toast-mobile {
			display: none !important;
		}
	}

	@media (max-width: 1023px) {
		.toast-desktop {
			display: none !important;
		}
	}
</style>
