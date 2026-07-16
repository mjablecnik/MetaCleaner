export interface NavItem {
	href: string;
	labelKey: string;
	icon: string;
}

export interface NavSection {
	labelKey: string;
	items: NavItem[];
}

export function getNavSections(base: string): NavSection[] {
	return [
		{
			labelKey: 'layout_nav_overviews',
			items: [
				{ href: `${base}/dostupnost`, labelKey: 'layout_nav_availability', icon: 'fa-server' },
				{ href: `${base}/chyby`, labelKey: 'layout_nav_errors', icon: 'fa-triangle-exclamation' }
			]
		},
		{
			labelKey: 'layout_nav_infrastructure',
			items: [
				{ href: `${base}/databaze`, labelKey: 'layout_nav_database', icon: 'fa-database' },
				{ href: `${base}/runtime`, labelKey: 'layout_nav_runtime', icon: 'fa-microchip' },
				{ href: `${base}/edge`, labelKey: 'layout_nav_edge', icon: 'fa-cloud' }
			]
		},
		{
			labelKey: 'layout_nav_analytics',
			items: [
				{ href: `${base}/business`, labelKey: 'layout_nav_business', icon: 'fa-chart-line' },
				{ href: `${base}/uzivatele`, labelKey: 'layout_nav_users', icon: 'fa-users' }
			]
		}
	];
}
