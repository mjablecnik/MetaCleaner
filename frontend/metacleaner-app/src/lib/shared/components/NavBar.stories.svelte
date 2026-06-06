<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NavBar from './NavBar.svelte';

	const { Story } = defineMeta({
		title: 'Components/NavBar',
		component: NavBar,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			},
			layout: 'fullscreen'
		}
	});

	const mockUser = { name: 'Jana Nováková', email: 'jana.novakova@email.cz' };

	const mockLangOptions = [
		{ code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
		{ code: 'cs', flag: '🇨🇿', label: 'CS', name: 'Čeština' },
		{ code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
		{ code: 'sk', flag: '🇸🇰', label: 'SK', name: 'Slovenčina' }
	];
</script>

<Story name="Default">
	<NavBar user={mockUser} langOptions={mockLangOptions} />
</Story>

<Story name="With Back Button">
	<NavBar
		user={mockUser}
		langOptions={mockLangOptions}
		showBackButton={true}
		backHref="/reports"
		backLabel="Back to Reports"
	/>
</Story>

<Story name="Without Language Dropdown">
	<NavBar user={mockUser} langOptions={mockLangOptions} showLangDropdown={false} />
</Story>

<Story name="Compact">
	<NavBar user={mockUser} langOptions={mockLangOptions} compact={true} />
</Story>

<Story name="No User">
	<NavBar user={null} langOptions={mockLangOptions} />
</Story>
