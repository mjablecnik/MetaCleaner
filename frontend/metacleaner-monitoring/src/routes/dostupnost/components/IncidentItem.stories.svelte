<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IncidentItem from './IncidentItem.svelte';

	const { Story } = defineMeta({
		title: 'Availability/IncidentItem',
		component: IncidentItem,
		tags: ['autodocs']
	});
</script>

<Story
	name="Active Desktop"
	args={{
		incident: {
			id: 'inc-1',
			status: 'active',
			title: 'Zvýšená latence Edge CDN',
			descriptionDesktop:
				'Cloudflare edge uzly v regionu EU reportují zvýšenou latenci. Tým zkoumá příčinu.',
			descriptionMobile: 'Cloudflare edge uzly v regionu EU reportují zvýšenou latenci.',
			service: 'Cloudflare Edge',
			serviceIcon: 'fa-cloud',
			timestamp: 'Dnes, 08:14',
			duration: '2h 18m'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Resolved Desktop"
	args={{
		incident: {
			id: 'inc-2',
			status: 'resolved',
			title: 'Backend API restart (500 errors)',
			descriptionDesktop: 'Instance crashla kvůli OOM. Automatický restart obnovil provoz za 43s.',
			descriptionMobile: 'OOM crash. Automatický restart za 43s.',
			service: 'Fly.io Backend',
			serviceIcon: 'fa-server',
			timestamp: 'Včera, 22:45',
			duration: '43s'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Active Mobile"
	args={{
		incident: {
			id: 'inc-1',
			status: 'active',
			title: 'Zvýšená latence Edge CDN',
			descriptionDesktop:
				'Cloudflare edge uzly v regionu EU reportují zvýšenou latenci. Tým zkoumá příčinu.',
			descriptionMobile: 'Cloudflare edge uzly v regionu EU reportují zvýšenou latenci.',
			service: 'Cloudflare Edge',
			serviceIcon: 'fa-cloud',
			timestamp: 'Dnes, 08:14',
			duration: '2h 18m'
		},
		variant: 'mobile'
	}}
/>
