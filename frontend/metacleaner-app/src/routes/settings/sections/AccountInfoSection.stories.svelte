<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AccountInfoSection from './AccountInfoSection.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Sections/AccountInfoSection',
		component: AccountInfoSection,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<script>
	const mockProfile = {
		name: 'Jana Nováková',
		email: 'jana.novakova@email.cz',
		avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
		plan: 'pro',
		verified: true,
		company: '',
		lastLogin: 'today, 09:41'
	};

	const mockProfileWithCompany = {
		...mockProfile,
		company: 'Acme Corp'
	};
</script>

<Story name="Default">
	<div class="max-w-md p-4">
		<AccountInfoSection profile={mockProfile} />
	</div>
</Story>

<Story name="With Company">
	<div class="max-w-md p-4">
		<AccountInfoSection profile={mockProfileWithCompany} />
	</div>
</Story>
