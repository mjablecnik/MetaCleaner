<script lang="ts">
	interface Props {
		checked?: boolean;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
		class?: string;
	}

	const { checked = false, disabled = false, onchange, class: extraClass = '' }: Props = $props();

	function toggle() {
		if (!disabled) onchange?.(!checked);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	role="switch"
	tabindex="0"
	aria-checked={checked}
	class="relative flex h-6 w-12 cursor-pointer items-center rounded-full px-1 transition-colors duration-200
		{checked ? 'bg-brand-blue' : 'border border-gray-600 bg-navy-lighter'}
		{disabled ? 'cursor-not-allowed opacity-50' : ''}
		{extraClass}"
	onclick={toggle}
>
	<div
		class="h-4 w-4 rounded-full transition-all duration-200
			{checked ? 'ml-auto bg-white' : 'bg-gray-500'}"
	></div>
</div>
