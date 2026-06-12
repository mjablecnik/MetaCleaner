<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SocialLoginButtons from './SocialLoginButtons.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Auth/SocialLoginButtons',
		component: SocialLoginButtons,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		},
		args: {
			onGoogle: fn(),
			onApple: fn()
		}
	});
</script>

<Story name="Default">
	<div class="w-80 p-4">
		<SocialLoginButtons googleLabel="Continue with Google" appleLabel="Continue with Apple" />
	</div>
</Story>

<Story name="LoginLabels">
	<div class="w-80 p-4">
		<SocialLoginButtons googleLabel="Sign in with Google" appleLabel="Sign in with Apple" />
	</div>
</Story>

<Story name="RegisterLabels">
	<div class="w-80 p-4">
		<SocialLoginButtons googleLabel="Sign up with Google" appleLabel="Sign up with Apple" />
	</div>
</Story>
