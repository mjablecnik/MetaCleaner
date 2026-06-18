<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CheckBullet from './CheckBullet.svelte';

	const { Story } = defineMeta({
		title: 'Elements/CheckBullet',
		component: CheckBullet,
		tags: ['autodocs'],
		argTypes: {
			color: {
				control: { type: 'select' },
				options: ['green', 'blue']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'xs']
			}
		},
		args: {
			text: 'Remove hidden GPS and camera metadata',
			emphasis: false,
			color: 'green',
			size: 'sm'
		}
	});
</script>

<!-- Color variants -->
<Story name="Green (default)" args={{ color: 'green', text: 'Remove hidden GPS and camera metadata' }} />
<Story name="Blue" args={{ color: 'blue', text: 'Clean metadata from unlimited files' }} />

<!-- Emphasis -->
<Story name="Emphasized" args={{ color: 'green', emphasis: true, text: 'Everything in Free, plus:' }} />
<Story name="Blue Emphasized" args={{ color: 'blue', emphasis: true, text: 'Everything in Free, plus:' }} />

<!-- Size variants -->
<Story name="Small (sm)" args={{ size: 'sm', text: 'Supports all major image formats' }} />
<Story name="Extra small (xs)" args={{ size: 'xs', text: 'Compact bullet for tight layouts' }} />
