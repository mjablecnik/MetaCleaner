<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { validateContactForm, type ValidationErrors } from '$lib/utils/contactFormValidation';
	import { sendContactEmail } from '$lib/utils/brevoClient';

	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let errors = $state<ValidationErrors>({});
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let submitError = $state<string | null>(null);

	function getErrorMessage(errorType: string | undefined): string | null {
		if (!errorType) return null;
		if (errorType === 'required') return m.about_contact_form_error_required();
		if (errorType === 'email') return m.about_contact_form_error_email();
		if (errorType === 'max_length') return m.about_contact_form_error_max_length();
		return null;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		submitError = null;

		const result = validateContactForm({ name, email, subject, message });
		if (!result.valid) {
			errors = result.errors;
			return;
		}

		errors = {};
		isSubmitting = true;

		const { success, error } = await sendContactEmail({
			senderName: name,
			senderEmail: email,
			subject,
			message
		});

		isSubmitting = false;

		if (success) {
			isSuccess = true;
		} else {
			submitError = error ?? m.about_contact_form_error();
		}
	}
</script>

<div class="flex flex-col gap-4 p-6 rounded-xl bg-navy-card border border-border">
	<h3 class="text-base font-semibold">{m.about_contact_form_heading()}</h3>

	{#if isSuccess}
		<div
			class="flex items-start gap-3 p-4 rounded-lg bg-brand-green/10 border border-brand-green/20"
		>
			<i class="fa-solid fa-circle-check text-brand-green mt-0.5"></i>
			<p class="text-sm text-brand-green">{m.about_contact_form_success()}</p>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="flex flex-col gap-4" novalidate>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="flex flex-col gap-1.5">
					<label for="contact-name" class="text-xs font-medium text-text-muted">
						{m.about_contact_form_name_label()}
					</label>
					<input
						id="contact-name"
						type="text"
						bind:value={name}
						placeholder={m.about_contact_form_name_placeholder()}
						maxlength={100}
						class="w-full px-3 py-2 text-sm rounded-lg bg-navy border border-border focus:outline-none focus:border-brand-blue/50 transition-colors
							{errors.name ? 'border-red-500/60' : ''}"
					/>
					{#if errors.name}
						<span class="text-xs text-red-400">{getErrorMessage(errors.name)}</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="contact-email" class="text-xs font-medium text-text-muted">
						{m.about_contact_form_email_label()}
					</label>
					<input
						id="contact-email"
						type="email"
						bind:value={email}
						placeholder={m.about_contact_form_email_placeholder()}
						maxlength={254}
						class="w-full px-3 py-2 text-sm rounded-lg bg-navy border border-border focus:outline-none focus:border-brand-blue/50 transition-colors
							{errors.email ? 'border-red-500/60' : ''}"
					/>
					{#if errors.email}
						<span class="text-xs text-red-400">{getErrorMessage(errors.email)}</span>
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="contact-subject" class="text-xs font-medium text-text-muted">
					{m.about_contact_form_subject_label()}
				</label>
				<input
					id="contact-subject"
					type="text"
					bind:value={subject}
					placeholder={m.about_contact_form_subject_placeholder()}
					maxlength={150}
					class="w-full px-3 py-2 text-sm rounded-lg bg-navy border border-border focus:outline-none focus:border-brand-blue/50 transition-colors
						{errors.subject ? 'border-red-500/60' : ''}"
				/>
				{#if errors.subject}
					<span class="text-xs text-red-400">{getErrorMessage(errors.subject)}</span>
				{/if}
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="contact-message" class="text-xs font-medium text-text-muted">
					{m.about_contact_form_message_label()}
				</label>
				<textarea
					id="contact-message"
					bind:value={message}
					placeholder={m.about_contact_form_message_placeholder()}
					maxlength={2000}
					rows={5}
					class="w-full px-3 py-2 text-sm rounded-lg bg-navy border border-border focus:outline-none focus:border-brand-blue/50 transition-colors resize-none
						{errors.message ? 'border-red-500/60' : ''}"></textarea>
				{#if errors.message}
					<span class="text-xs text-red-400">{getErrorMessage(errors.message)}</span>
				{/if}
			</div>

			{#if submitError}
				<div class="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
					<i class="fa-solid fa-circle-exclamation text-red-400 mt-0.5"></i>
					<p class="text-sm text-red-400">{m.about_contact_form_error()}</p>
				</div>
			{/if}

			<button
				type="submit"
				disabled={isSubmitting}
				class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-green text-white text-sm font-semibold
					hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{#if isSubmitting}
					<i class="fa-solid fa-spinner fa-spin text-xs"></i>
				{/if}
				{m.about_contact_form_submit()}
			</button>
		</form>
	{/if}
</div>
