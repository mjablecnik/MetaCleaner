<script lang="ts">
	interface Props {
		keyName: string;
		onClose: () => void;
		onConfirm: () => void | Promise<void>;
	}

	let { keyName: _keyName, onClose, onConfirm }: Props = $props();
</script>

<!-- Task 4.6: full implementation pending -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
	<div class="w-full max-w-md rounded-2xl border border-gray-700 bg-navy-lighter p-6">
		<p class="text-white">Delete key modal — coming soon</p>
		<div class="mt-4 flex gap-3">
			<button type="button" class="text-sm text-text-muted hover:text-white" onclick={onClose}>
				Cancel
			</button>
			<button type="button" class="text-sm text-brand-red hover:text-red-400" onclick={onConfirm}>
				Confirm delete
			</button>
		</div>
	</div>
</div>
