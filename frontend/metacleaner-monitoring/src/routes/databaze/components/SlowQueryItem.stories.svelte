<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SlowQueryItem from './SlowQueryItem.svelte';

	const { Story } = defineMeta({
		title: 'databaze/components/SlowQueryItem',
		component: SlowQueryItem,
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{
		query: {
			type: 'SELECT',
			typeClass: 'bg-blue/20 text-blue',
			sql: 'SELECT COUNT(*) FROM analytics WHERE date > NOW() - INTERVAL 7 DAY',
			table: 'analytics',
			calls: '312x',
			avgMs: 390,
			avgClass: 'text-blue',
			meta: 'Tabulka: analytics · Volání: 312x'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="SlowQuery"
	args={{
		query: {
			type: 'UPDATE',
			typeClass: 'bg-secondary/20 text-secondary',
			sql: 'UPDATE products SET stock = stock - 1 WHERE product_id = ? AND stock > 0',
			table: 'products',
			calls: '1,203x',
			avgMs: 620,
			avgClass: 'text-secondary',
			meta: 'Tabulka: products · Volání: 1,203x'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="VerySlowQuery"
	args={{
		query: {
			type: 'SELECT',
			typeClass: 'bg-error/20 text-error',
			sql: 'SELECT * FROM orders JOIN users ON orders.user_id = users.id WHERE ...',
			table: 'orders',
			calls: '842x',
			avgMs: 1240,
			avgClass: 'text-error',
			meta: 'Tabulka: orders · Volání: 842x'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="DefaultMobile"
	args={{
		query: {
			type: 'INSERT',
			typeClass: 'bg-green-muted/20 text-green-muted',
			sql: 'INSERT INTO events (user_id, type, meta) VALUES (?, ?, ?)',
			table: 'events',
			calls: '5,841x',
			avgMs: 84,
			avgClass: 'text-textMain',
			meta: 'Tabulka: events · Volání: 5,841x'
		},
		variant: 'mobile'
	}}
/>
