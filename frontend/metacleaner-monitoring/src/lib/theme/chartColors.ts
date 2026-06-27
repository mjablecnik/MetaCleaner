export const chartColors = {
	background: '#0a1628',
	card: '#111d33',
	primary: '#22c55e',
	secondary: '#f97316',
	textMain: '#ffffff',
	textSec: '#94a3b8',
	error: '#ef4444',
	success: '#22c55e',
	surface: '#1e293b',
	border: '#334155',
	blue: '#3b82f6',
	greenMuted: '#3ecf8e',
	purple: '#8b5cf6',
	amber: '#f59e0b',
	purpleLight: '#a78bfa',
	surfaceHover: '#2d3748',
	surfaceDeep: '#0f172a',
	blueLight: '#60a5fa',
	cfOrange: '#f6821f'
} as const;

export type ChartColor = keyof typeof chartColors;
