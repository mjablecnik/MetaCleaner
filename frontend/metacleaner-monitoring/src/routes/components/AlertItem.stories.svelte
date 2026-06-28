<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AlertItem from './AlertItem.svelte';

	const { Story } = defineMeta({
		title: 'Dashboard/AlertItem',
		component: AlertItem,
		tags: ['autodocs']
	});
</script>

<Story
	name="Error"
	args={{
		severity: 'error',
		title: 'Zvýšený počet 500 chyb na API',
		descriptionMobile: 'Detekován spike chyb na endpointu /api/v1/checkout. Restartováno 1x.',
		descriptionDesktop: 'Detekován spike chyb na endpointu /api/v1/checkout. Restartováno 1x.',
		timeMobile: '15 min',
		timeDesktop: 'Před 15 min'
	}}
/>

<Story
	name="Warning"
	args={{
		severity: 'warning',
		title: 'Zpomalené dotazy v DB',
		descriptionMobile: 'Průměrná latence stoupla nad 500ms.',
		descriptionDesktop: 'Uživatelé hlásí pomalé načítání. Průměrná latence stoupla nad 500ms.',
		timeMobile: '2 hod',
		timeDesktop: 'Před 2 hod'
	}}
/>

<Story
	name="Resolved"
	args={{
		severity: 'resolved',
		title: 'Frontend Deployment Timeout',
		descriptionMobile: 'Vyřešeno po restartu pipeliny.',
		descriptionDesktop: 'Vyřešeno automaticky po restartu CI/CD pipeliny.',
		timeMobile: 'Včera',
		timeDesktop: 'Včera, 14:30'
	}}
/>
