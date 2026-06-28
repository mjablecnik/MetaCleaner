<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MobileBottomNav from './MobileBottomNav.svelte';

	const defaultItems = [
		{ href: '/', icon: 'fa-gauge-high', label: 'Dashboard' },
		{ href: '/dostupnost', icon: 'fa-server', label: 'Availability' },
		{ href: '/chyby', icon: 'fa-triangle-exclamation', label: 'Errors' },
		{ href: '/performance', icon: 'fa-bolt', label: 'Performance' },
		{ href: '/nastaveni', icon: 'fa-gear', label: 'Settings' }
	];

	const { Story } = defineMeta({
		title: 'Components/MobileBottomNav',
		component: MobileBottomNav,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div style="min-height:120px;position:relative">
		<MobileBottomNav items={defaultItems} activeHref="/dostupnost" />
	</div>
</Story>

<Story name="DifferentActiveItem">
	<div style="min-height:120px;position:relative">
		<MobileBottomNav
			items={[
				{ href: '/', icon: 'fa-gauge-high', label: 'Dashboard' },
				{ href: '/runtime', icon: 'fa-server', label: 'Runtime' },
				{
					href: '/chyby',
					icon: 'fa-triangle-exclamation',
					label: 'Errors',
					activeClass: 'text-error'
				},
				{ href: '/performance', icon: 'fa-bolt', label: 'Performance' },
				{ href: '/nastaveni', icon: 'fa-gear', label: 'Settings' }
			]}
			activeHref="/chyby"
		/>
	</div>
</Story>

<Story name="WithBadge">
	<div style="min-height:120px;position:relative">
		<MobileBottomNav
			items={[
				{ href: '/', icon: 'fa-gauge-high', label: 'Dashboard' },
				{ href: '/runtime', icon: 'fa-server', label: 'Runtime' },
				{
					href: '/security',
					icon: 'fa-shield-halved',
					label: 'Security',
					activeClass: 'text-error',
					badge: 3
				},
				{ href: '/business', icon: 'fa-chart-line', label: 'Business' },
				{ href: '/nastaveni', icon: 'fa-gear', label: 'Settings' }
			]}
			activeHref="/security"
		/>
	</div>
</Story>
