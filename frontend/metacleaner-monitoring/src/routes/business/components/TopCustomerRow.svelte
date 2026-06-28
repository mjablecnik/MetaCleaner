<script lang="ts">
	interface Props {
		name: string;
		plan: string;
		mrr: string;
		avatar: string;
	}

	let { name, plan, mrr, avatar }: Props = $props();
</script>

<div
	class="flex items-center gap-4 p-3 rounded-xl bg-surface/40 border border-border/40 hover:border-border transition-colors"
>
	<img src={avatar} alt={name} class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
	<div class="flex-1 min-w-0">
		<p class="text-textMain text-sm font-semibold">{name}</p>
		<p class="text-xs text-textSec">{plan}</p>
	</div>
	<div class="text-right">
		<p class="text-textMain text-sm font-bold">
			{mrr}<span class="text-textSec font-normal text-xs">/mo</span>
		</p>
	</div>
</div>
