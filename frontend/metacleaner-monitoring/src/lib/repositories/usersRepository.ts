export type UserStatus = 'online' | 'idle' | 'offline';
export type UserRole = 'Admin' | 'Editor' | 'Developer' | 'Viewer';

export interface User {
	id: number;
	name: string;
	email: string;
	avatar: string;
	status: UserStatus;
	registered: string;
	lastLogin: string;
	sessions: number;
	location: string;
	role: UserRole;
}

export interface UserStat {
	key: string;
	labelKey: string;
	value: string;
	trendKey: string;
	trendValue: string;
	trendPositive: boolean;
	icon: string;
	iconColor: string;
	iconBg: string;
	subtextKey?: string;
	pulse?: boolean;
	pulseColor?: string;
}

export interface UserStatusConfig {
	dot: string;
	labelKey: string;
	text: string;
	bg: string;
}

export const userStatusConfig: Record<UserStatus, UserStatusConfig> = {
	online: {
		dot: 'bg-success',
		labelKey: 'users_status_online',
		text: 'text-success',
		bg: 'bg-success/10'
	},
	idle: {
		dot: 'bg-secondary',
		labelKey: 'users_status_idle',
		text: 'text-secondary',
		bg: 'bg-secondary/10'
	},
	offline: {
		dot: 'bg-[#475569]',
		labelKey: 'users_status_offline',
		text: 'text-textSec',
		bg: 'bg-badge'
	}
};

export interface UserChartData {
	registrationValues: number[];
	sessionValues: number[];
}

export const userRoleColors: Record<UserRole, string> = {
	Admin: 'bg-primary/10 text-primary border border-primary/20',
	Editor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
	Developer: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
	Viewer: 'bg-badge text-textSec border border-[#334155]'
};

export function getUserStats(): UserStat[] {
	return [
		{
			key: 'totalUsers',
			labelKey: 'users_stats_totalUsers',
			value: '2 100',
			trendKey: 'users_stats_vsLastMonth',
			trendValue: '+1.6%',
			trendPositive: true,
			icon: 'fa-users',
			iconColor: 'text-primary',
			iconBg: 'bg-primary/10'
		},
		{
			key: 'loggedIn',
			labelKey: 'users_stats_currentlyLoggedIn',
			value: '210',
			trendKey: 'users_stats_activeSessionsNow',
			trendValue: '',
			trendPositive: true,
			icon: 'fa-circle-dot',
			iconColor: 'text-blue-400',
			iconBg: 'bg-blue-500/10',
			pulse: true,
			pulseColor: 'bg-blue-400'
		},
		{
			key: 'newRegistrations',
			labelKey: 'users_stats_newRegistrations',
			value: '34',
			trendKey: 'users_stats_vsPreviousPeriod',
			trendValue: '+6.3%',
			trendPositive: true,
			icon: 'fa-user-plus',
			iconColor: 'text-secondary',
			iconBg: 'bg-secondary/10'
		},
		{
			key: 'avgSessionDuration',
			labelKey: 'users_stats_avgSessionDuration',
			value: '18',
			trendKey: 'users_stats_vsLastMonth',
			trendValue: '+12.5%',
			trendPositive: true,
			icon: 'fa-bolt',
			iconColor: 'text-purple-400',
			iconBg: 'bg-purple-500/10',
			subtextKey: 'users_stats_powerUsers'
		}
	];
}

export interface UserTab {
	key: 'all' | 'online' | 'new' | 'inactive';
	labelKey: string;
	count: string;
}

export function getUserTabs(): UserTab[] {
	return [
		{ key: 'all', labelKey: 'users_tabs_all', count: '2 100' },
		{ key: 'online', labelKey: 'users_tabs_online', count: '210' },
		{ key: 'new', labelKey: 'users_tabs_new', count: '34' },
		{ key: 'inactive', labelKey: 'users_tabs_inactive', count: '1 856' }
	];
}

export function getUsers(): User[] {
	return [
		{
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
		},
		{
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
		},
		{
			id: 3,
			name: 'Martin Blaha',
			email: 'martin.blaha@dev.io',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
			status: 'online',
			registered: '8. 7. 2023',
			lastLogin: 'Před 12 min',
			sessions: 312,
			location: 'Ostrava, CZ',
			role: 'Developer'
		},
		{
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
		},
		{
			id: 5,
			name: 'Jakub Procházka',
			email: 'j.prochazka@corp.eu',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
			status: 'offline',
			registered: '3. 11. 2023',
			lastLogin: 'Před 2 dny',
			sessions: 55,
			location: 'Liberec, CZ',
			role: 'Editor'
		},
		{
			id: 6,
			name: 'Tereza Málková',
			email: 'tereza.m@startup.cz',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
			status: 'online',
			registered: '1. 5. 2024',
			lastLogin: 'Před 8 min',
			sessions: 63,
			location: 'Praha, CZ',
			role: 'Viewer'
		},
		{
			id: 7,
			name: 'Ondřej Šimánek',
			email: 'ondrej.simanek@tech.cz',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
			status: 'offline',
			registered: '14. 2. 2024',
			lastLogin: 'Před 5 dny',
			sessions: 19,
			location: 'Olomouc, CZ',
			role: 'Viewer'
		},
		{
			id: 8,
			name: 'Petra Veselá',
			email: 'petra.vesela@media.cz',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
			status: 'online',
			registered: '29. 9. 2024',
			lastLogin: 'Před 3 min',
			sessions: 11,
			location: 'Hradec Králové, CZ',
			role: 'Editor'
		},
		{
			id: 9,
			name: 'Radek Horák',
			email: 'radek.horak@business.cz',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
			status: 'idle',
			registered: '7. 4. 2023',
			lastLogin: 'Před 45 min',
			sessions: 204,
			location: 'Zlín, CZ',
			role: 'Admin'
		},
		{
			id: 10,
			name: 'Simona Křížková',
			email: 'simona.k@freelance.eu',
			avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
			status: 'offline',
			registered: '18. 8. 2024',
			lastLogin: 'Před 1 týdnem',
			sessions: 7,
			location: 'České Budějovice, CZ',
			role: 'Viewer'
		}
	];
}
