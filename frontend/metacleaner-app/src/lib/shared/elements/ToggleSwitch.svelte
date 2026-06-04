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
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	role="switch"
	aria-checked={checked}
	class="w-12 h-6 rounded-full relative cursor-pointer flex items-center px-1 transition-colors duration-200
		{checked ? 'bg-brand-blue' : 'bg-navy-lighter border border-gray-600'}
		{disabled ? 'opacity-50 cursor-not-allowed' : ''}
		{extraClass}"
	onclick={toggle}
>
	<div
		class="w-4 h-4 rounded-full transition-all duration-200
			{checked ? 'bg-white ml-auto' : 'bg-gray-500'}"
	></div>
</div>
