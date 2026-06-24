<script lang="ts">
	type Method = 'GET' | 'POST' | 'DEL' | 'PATCH' | 'PUT' | 'WS';
	type Size = 'sm' | 'md';

	interface Props {
		method: Method;
		size?: Size;
	}

	const { method, size = 'md' }: Props = $props();

	const colorMap: Record<Method, string> = {
		POST: 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue',
		GET: 'bg-brand-green/10 border-brand-green/30 text-brand-green',
		DEL: 'bg-brand-red/10 border-brand-red/30 text-brand-red',
		PATCH: 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange',
		PUT: 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange',
		WS: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
	};

	const sizeMap: Record<Size, string> = {
		sm: 'px-1.5 py-0.5 text-[9px]',
		md: 'px-2 py-0.5 text-xs'
	};
</script>

<span
	class="inline-flex items-center rounded border font-bold tracking-wider uppercase {colorMap[
		method
	]} {sizeMap[size]}"
>
	{method}
</span>
