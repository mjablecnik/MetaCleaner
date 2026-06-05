<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IconContainer from './IconContainer.svelte';

	const { Story } = defineMeta({
		title: 'Elements/IconContainer',
		component: IconContainer,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<!-- Color variants — tinted (default) -->

<Story name="Blue Tinted">
	<IconContainer color="blue" icon="fa-solid fa-shield-halved" />
</Story>

<Story name="Green Tinted">
	<IconContainer color="green" icon="fa-solid fa-check" />
</Story>

<Story name="Red Tinted">
	<IconContainer color="red" icon="fa-solid fa-circle-exclamation" />
</Story>

<Story name="Orange Tinted">
	<IconContainer color="orange" icon="fa-solid fa-triangle-exclamation" />
</Story>

<Story name="Muted Tinted">
	<IconContainer color="muted" icon="fa-solid fa-file" />
</Story>

<!-- Color variants — solid -->

<Story name="Blue Solid">
	<IconContainer color="blue" variant="solid" icon="fa-solid fa-shield-halved" />
</Story>

<Story name="Green Solid">
	<IconContainer color="green" variant="solid" icon="fa-solid fa-check" />
</Story>

<Story name="Red Solid">
	<IconContainer color="red" variant="solid" icon="fa-solid fa-circle-exclamation" />
</Story>

<Story name="Orange Solid">
	<IconContainer color="orange" variant="solid" icon="fa-solid fa-triangle-exclamation" />
</Story>

<Story name="Muted Solid">
	<IconContainer color="muted" variant="solid" icon="fa-solid fa-file" />
</Story>

<!-- Sizes -->

<Story name="Size xs">
	<IconContainer color="blue" size="xs" icon="fa-solid fa-shield-halved" />
</Story>

<Story name="Size sm">
	<IconContainer color="blue" size="sm" icon="fa-solid fa-shield-halved" />
</Story>

<Story name="Size md">
	<IconContainer color="blue" size="md" icon="fa-solid fa-shield-halved" />
</Story>

<Story name="Size lg">
	<IconContainer color="blue" size="lg" icon="fa-solid fa-shield-halved" />
</Story>

<Story name="Size xl">
	<IconContainer color="blue" size="xl" icon="fa-solid fa-shield-halved" />
</Story>

<Story name="Size 2xl">
	<IconContainer color="blue" size="2xl" icon="fa-solid fa-shield-halved" />
</Story>

<!-- Shapes -->

<Story name="Square Shape">
	<IconContainer color="green" shape="square" icon="fa-solid fa-check" />
</Story>

<Story name="Circle Shape">
	<IconContainer color="green" shape="circle" icon="fa-solid fa-check" />
</Story>

<!-- All sizes row -->

<Story name="All Sizes">
	<div class="flex items-end gap-3">
		<IconContainer color="blue" size="xs" icon="fa-solid fa-shield-halved" />
		<IconContainer color="blue" size="sm" icon="fa-solid fa-shield-halved" />
		<IconContainer color="blue" size="md" icon="fa-solid fa-shield-halved" />
		<IconContainer color="blue" size="lg" icon="fa-solid fa-shield-halved" />
		<IconContainer color="blue" size="xl" icon="fa-solid fa-shield-halved" />
		<IconContainer color="blue" size="2xl" icon="fa-solid fa-shield-halved" />
	</div>
</Story>

<!-- All colors row -->

<Story name="All Colors Tinted">
	<div class="flex items-center gap-3">
		<IconContainer color="blue" icon="fa-solid fa-circle" />
		<IconContainer color="green" icon="fa-solid fa-circle" />
		<IconContainer color="red" icon="fa-solid fa-circle" />
		<IconContainer color="orange" icon="fa-solid fa-circle" />
		<IconContainer color="muted" icon="fa-solid fa-circle" />
	</div>
</Story>

<Story name="All Colors Solid">
	<div class="flex items-center gap-3">
		<IconContainer color="blue" variant="solid" icon="fa-solid fa-circle" />
		<IconContainer color="green" variant="solid" icon="fa-solid fa-circle" />
		<IconContainer color="red" variant="solid" icon="fa-solid fa-circle" />
		<IconContainer color="orange" variant="solid" icon="fa-solid fa-circle" />
		<IconContainer color="muted" variant="solid" icon="fa-solid fa-circle" />
	</div>
</Story>
