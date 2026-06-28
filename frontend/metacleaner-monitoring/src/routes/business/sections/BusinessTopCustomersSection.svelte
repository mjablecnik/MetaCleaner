<script lang="ts">
	import { t } from '$lib/i18n';
	import TopCustomerRow from '../components/TopCustomerRow.svelte';

	const topCustomers = [
		{ name: 'Acme Corp', plan: 'Enterprise', mrr: '$2,800', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg' },
		{ name: 'TechVision', plan: 'Enterprise', mrr: '$1,960', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg' },
		{ name: 'DataFlow GmbH', plan: 'Business', mrr: '$1,200', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' },
		{ name: 'Nexo Solutions', plan: 'Business', mrr: '$960', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg' },
		{ name: 'Sparkly Media', plan: 'Pro', mrr: '$750', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' }
	];
</script>

<!-- ===== DESKTOP TOP CUSTOMERS ===== -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('business_topCustomers_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('business_topCustomers_subtitle')}</p>
		</div>
	</div>
	<div class="space-y-3">
		{#each topCustomers as customer}
			<TopCustomerRow name={customer.name} plan={customer.plan} mrr={customer.mrr} avatar={customer.avatar} />
		{/each}
	</div>
</section>

<!-- ===== MOBILE TOP CUSTOMERS ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-3">{t('business_topCustomers_title')}</h3>
	<div class="space-y-2.5">
		{#each topCustomers as customer}
			<div class="flex items-center gap-3">
				<img src={customer.avatar} alt={customer.name} class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
				<div class="flex-1 min-w-0">
					<p class="text-textMain text-xs font-semibold">{customer.name}</p>
					<p class="text-xs text-textSec">{customer.plan}</p>
				</div>
				<span class="text-textMain text-xs font-bold">{customer.mrr}<span class="text-textSec font-normal">/mo</span></span>
			</div>
		{/each}
	</div>
</section>
