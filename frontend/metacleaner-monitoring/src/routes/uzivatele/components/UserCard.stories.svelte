<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UserCard from './UserCard.svelte';

	const { Story } = defineMeta({
		title: 'Uzivatele/UserCard',
		component: UserCard,
		tags: ['autodocs']
	});
</script>

<Story
	name="Online Admin"
	args={{
		user: {
			id: 1,
			name: 'Karolína Novotná',
			email: 'karolina.novotna@email.cz',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
			status: 'online',
			registered: '2. 1. 2024',
			lastLogin: 'Právě teď',
			sessions: 148,
			location: 'Praha, CZ',
			role: 'Admin'
		}
	}}
/>

<Story
	name="Online Editor"
	args={{
		user: {
			id: 2,
			name: 'Tomáš Kovář',
			email: 'tomas.kovar@firma.cz',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
			status: 'online',
			registered: '15. 3. 2024',
			lastLogin: 'Před 5 min',
			sessions: 87,
			location: 'Brno, CZ',
			role: 'Editor'
		}
	}}
/>

<Story
	name="Idle Viewer"
	args={{
		user: {
			id: 4,
			name: 'Lucie Horáčková',
			email: 'lucie.h@gmail.com',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
			status: 'idle',
			registered: '20. 6. 2024',
			lastLogin: 'Před 1 hod',
			sessions: 22,
			location: 'Plzeň, CZ',
			role: 'Viewer'
		}
	}}
/>

<Story
	name="Offline Developer"
	args={{
		user: {
			id: 3,
			name: 'Martin Blaha',
			email: 'martin.blaha@dev.io',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
			status: 'offline',
			registered: '8. 7. 2023',
			lastLogin: 'Před 2 dny',
			sessions: 312,
			location: 'Ostrava, CZ',
			role: 'Developer'
		}
	}}
/>
