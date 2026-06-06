<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MobileHamburgerMenu from './MobileHamburgerMenu.svelte';

	const { Story } = defineMeta({
		title: 'Components/MobileHamburgerMenu',
		component: MobileHamburgerMenu,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const mockUser = { name: 'Jana Nováková', email: 'jana.novakova@email.cz' };

	const mockLangOptions = [
		{ code: 'cs', flag: '/flags/cs.svg', label: 'CS', name: 'Čeština' },
		{ code: 'en', flag: '/flags/en.svg', label: 'EN', name: 'English' },
		{ code: 'de', flag: '/flags/de.svg', label: 'DE', name: 'Deutsch' },
		{ code: 'sk', flag: '/flags/sk.svg', label: 'SK', name: 'Slovenčina' }
	];
</script>

<Story name="Closed">
	<MobileHamburgerMenu user={mockUser} langOptions={mockLangOptions} open={false} onSelect={() => {}} />
</Story>

<Story name="Open">
	<MobileHamburgerMenu user={mockUser} langOptions={mockLangOptions} open={true} onSelect={() => {}} />
</Story>

<Story name="Open With Language Options">
	<MobileHamburgerMenu
		user={mockUser}
		langOptions={mockLangOptions}
		open={true}
		onSelect={() => {}}
	/>
</Story>

<Story name="No User">
	<MobileHamburgerMenu user={null} langOptions={mockLangOptions} open={false} onSelect={() => {}} />
</Story>

<Story name="No User Open">
	<MobileHamburgerMenu user={null} langOptions={mockLangOptions} open={true} onSelect={() => {}} />
</Story>
