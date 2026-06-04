<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UserDropdown from './UserDropdown.svelte';

	const { Story } = defineMeta({
		title: 'Components/UserDropdown',
		component: UserDropdown,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});

	const mockUser = { name: 'Jana Nováková', email: 'jana.novakova@email.cz' };
</script>

<Story name="Closed">
	<UserDropdown user={mockUser} open={false} />
</Story>

<Story name="Open">
	<UserDropdown user={mockUser} open={true} />
</Story>

<Story name="No User">
	<UserDropdown user={null} open={false} />
</Story>

<Story name="No User Open">
	<UserDropdown user={null} open={true} />
</Story>
