<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthNavbar from './AuthNavbar.svelte';

	const { Story } = defineMeta({
		title: 'Auth/AuthNavbar',
		component: AuthNavbar,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="WithRegisterLink">
	<AuthNavbar
		rightText="Don't have an account?"
		rightHref="/register"
		rightLabel="Register"
	/>
</Story>

<Story name="WithLoginLink">
	<AuthNavbar
		rightText="Already have an account?"
		rightHref="/login"
		rightLabel="Login"
	/>
</Story>

<Story name="NoRightAction">
	<AuthNavbar />
</Story>
