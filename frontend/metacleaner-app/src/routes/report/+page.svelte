<script lang="ts">
	import '../layout.css';
	import { onMount } from 'svelte';

	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);

	let accordionOpen = $state([true, false, false, false]);

	function toggleAccordion(index: number) {
		accordionOpen[index] = !accordionOpen[index];
	}

	let allOpen = $derived(accordionOpen.every((v) => v));

	function toggleAll() {
		const next = !allOpen;
		accordionOpen = [next, next, next, next];
	}

	function handleClickOutside(e: MouseEvent) {
		const t = e.target as Element;
		if (!t.closest('#userDropdown')) userDropdownOpen = false;
		if (!t.closest('#hamburgerDropdown')) hamburgerMenuOpen = false;
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:head>
	<title>MetaCleaner — Detailní report čištění</title>
</svelte:head>

<div class="flex flex-col min-h-screen bg-navy-main text-white font-sans">
	<!-- Navigation -->
	<nav
		class="w-full sticky lg:static top-0 bg-navy-main border-b border-gray-800/50 lg:border-0 z-50 no-print"
	>
		<div
			class="max-w-[1100px] mx-auto px-4 lg:px-6 py-4 lg:py-5 flex justify-between items-center"
		>
			<!-- Logo / Back -->
			<div class="flex items-center gap-2 lg:gap-3">
				<!-- Mobile: back arrow + logo -->
				<a
					href="/step5"
					class="flex lg:hidden w-9 h-9 rounded-lg bg-navy-lighter border border-gray-700 items-center justify-center text-text-muted"
				>
					<i class="fa-solid fa-arrow-left text-sm"></i>
				</a>
				<a href="/" class="flex items-center gap-2 lg:gap-3">
					<div
						class="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
					>
						<i class="fa-solid fa-shield-halved text-sm lg:text-xl"></i>
					</div>
					<span class="text-base lg:text-xl font-bold tracking-tight">MetaCleaner</span>
				</a>
			</div>

			<!-- Desktop right side -->
			<div class="hidden lg:flex items-center gap-3">
				<a
					href="/step5"
					class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-text-muted hover:text-white hover:bg-gray-800 transition-colors"
				>
					<i class="fa-solid fa-arrow-left text-xs"></i>
					<span>Zpět na výsledky</span>
				</a>

				<div id="userDropdown" class="relative inline-block">
					<button
						onclick={() => (userDropdownOpen = !userDropdownOpen)}
						class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
					>
						<div
							class="w-7 h-7 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center"
						>
							<i class="fa-solid fa-user text-brand-blue text-xs"></i>
						</div>
						<span class="hidden md:block">Jana Nováková</span>
						<i
							class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
							style="transform: {userDropdownOpen ? 'rotate(180deg)' : 'none'}"
						></i>
					</button>
					<div class="lang-dropdown-menu" class:open={userDropdownOpen} style="min-width:200px">
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-xs text-text-muted">Přihlášen jako</p>
							<p class="text-sm font-semibold text-white mt-0.5">jana.novakova@email.cz</p>
						</div>
						<div class="lang-option" role="button" tabindex="0">
							<i class="fa-solid fa-gear text-text-muted text-sm"></i>
							<span>Nastavení</span>
						</div>
						<div class="lang-option" style="color:#ef4444" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm" style="color:#ef4444"></i>
							<span>Odhlásit se</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Mobile: user avatar -->
			<div id="hamburgerDropdown" class="flex lg:hidden items-center">
				<div class="relative inline-block">
					<button
						onclick={() => (hamburgerMenuOpen = !hamburgerMenuOpen)}
						class="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center"
					>
						<i class="fa-solid fa-user text-brand-blue text-sm"></i>
					</button>
					<div
						class="lang-dropdown-menu"
						class:open={hamburgerMenuOpen}
						style="min-width:220px"
					>
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-xs text-text-muted">Přihlášen jako</p>
							<p class="text-sm font-semibold text-white mt-0.5 truncate">jana.novakova@email.cz</p>
						</div>
						<div class="lang-option" role="button" tabindex="0">
							<i class="fa-solid fa-gear text-text-muted text-sm"></i>
							<span>Nastavení</span>
						</div>
						<div class="lang-option" style="color:#ef4444" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm" style="color:#ef4444"></i>
							<span>Odhlásit se</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main -->
	<main class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-24 flex flex-col gap-4 lg:gap-6 pt-4 lg:pt-0">

		<!-- Report Header -->
		<div class="fade-in-up flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 mb-0 lg:mb-2">
			<div class="flex items-center gap-3 lg:gap-4">
				<div
					class="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-brand-blue/10 border-2 border-brand-blue/40 flex items-center justify-center flex-shrink-0"
				>
					<i class="fa-solid fa-file-lines text-brand-blue text-xl lg:text-3xl"></i>
				</div>
				<div>
					<h1 class="text-xl lg:text-3xl font-bold text-white leading-tight">Detailní report čištění</h1>
					<p class="text-text-muted text-xs lg:text-sm mt-0.5 lg:mt-1">
						<span class="hidden lg:inline">Vygenerováno: </span>2. června 2025 · 4 soubory · 87 polí odstraněno
					</p>
				</div>
			</div>
			<!-- Mobile: full-width PDF button -->
			<button
				class="no-print lg:hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm shadow-glow-green active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-file-pdf"></i>
				<span>Stáhnout PDF report</span>
			</button>
			<!-- Desktop: action buttons -->
			<div class="no-print hidden lg:flex items-center gap-3 self-start lg:self-auto">
				<button
					class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-400 transition-all shadow-glow-green"
				>
					<i class="fa-solid fa-file-pdf"></i>
					<span>Stáhnout PDF</span>
				</button>
				<button
					onclick={() => window.print()}
					class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all"
				>
					<i class="fa-solid fa-print"></i>
					<span class="hidden sm:inline">Tisknout</span>
				</button>
			</div>
		</div>

		<!-- Report Meta Info Bar -->
		<div class="fade-in-up delay-1 bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card">
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
				<div class="flex flex-col gap-0.5 lg:gap-1">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">ID reportu</p>
					<p class="text-xs lg:text-sm font-mono text-white">#MCR-2025-0602-A1</p>
				</div>
				<div class="flex flex-col gap-0.5 lg:gap-1">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Datum čištění</p>
					<p class="text-xs lg:text-sm font-semibold text-white">2. 6. 2025, 10:22</p>
				</div>
				<div class="flex flex-col gap-0.5 lg:gap-1">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Uživatel</p>
					<p class="text-xs lg:text-sm font-semibold text-white truncate">jana.novakova@email.cz</p>
				</div>
				<div class="flex flex-col gap-0.5 lg:gap-1">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Status</p>
					<div class="flex items-center gap-1.5 lg:gap-2">
						<div class="w-2 h-2 rounded-full bg-brand-green flex-shrink-0"></div>
						<p class="text-xs lg:text-sm font-semibold text-brand-green">
							<span class="hidden lg:inline">100% Úspěšně dokončeno</span>
							<span class="inline lg:hidden">100% Dokončeno</span>
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Summary Stats -->
		<div class="fade-in-up delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-1 lg:mb-2">
					<i class="fa-solid fa-file-circle-check text-brand-green text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-white">4</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">Souborů zpracováno</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-brand-green/20 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-1 lg:mb-2">
					<i class="fa-solid fa-eraser text-brand-green text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-brand-green">87</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">Polí metadat odstraněno</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-1 lg:mb-2">
					<i class="fa-solid fa-location-dot text-brand-blue text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-brand-blue">3</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">GPS lokací odstraněno</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mb-1 lg:mb-2">
					<i class="fa-solid fa-clock text-brand-orange text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-white">28s</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">Celková doba čištění</p>
			</div>
		</div>

		<!-- Charts Section -->
		<div class="fade-in-up delay-2 grid grid-cols-1 lg:grid-cols-2 gap-4">

			<!-- Metadata Distribution -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card">
				<h3 class="font-semibold text-base lg:text-lg text-white mb-0.5 lg:mb-1">Rozložení odstraněných metadat</h3>
				<p class="text-[11px] lg:text-xs text-text-muted mb-4">Podle typu metadat napříč všemi soubory</p>
				<!-- Legend grid -->
				<div class="grid grid-cols-3 gap-2 mb-4">
					<div class="flex flex-col items-center gap-1 bg-navy-main/60 rounded-xl p-3 border border-gray-800">
						<div class="flex items-center gap-1 lg:gap-1.5 mb-1">
							<div class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-brand-red"></div>
							<span class="text-[9px] lg:text-[10px] text-text-muted font-semibold uppercase">GPS</span>
						</div>
						<p class="text-lg lg:text-xl font-black text-brand-red">9</p>
						<p class="text-[9px] lg:text-[10px] text-text-muted">polí</p>
					</div>
					<div class="flex flex-col items-center gap-1 bg-navy-main/60 rounded-xl p-3 border border-gray-800">
						<div class="flex items-center gap-1 lg:gap-1.5 mb-1">
							<div class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-brand-orange"></div>
							<span class="text-[9px] lg:text-[10px] text-text-muted font-semibold uppercase">EXIF</span>
						</div>
						<p class="text-lg lg:text-xl font-black text-brand-orange">51</p>
						<p class="text-[9px] lg:text-[10px] text-text-muted">polí</p>
					</div>
					<div class="flex flex-col items-center gap-1 bg-navy-main/60 rounded-xl p-3 border border-gray-800">
						<div class="flex items-center gap-1 lg:gap-1.5 mb-1">
							<div class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-brand-blue"></div>
							<span class="text-[9px] lg:text-[10px] text-text-muted font-semibold uppercase">XMP</span>
						</div>
						<p class="text-lg lg:text-xl font-black text-brand-blue">27</p>
						<p class="text-[9px] lg:text-[10px] text-text-muted">polí</p>
					</div>
				</div>
				<!-- Bar breakdown -->
				<div class="flex flex-col gap-2.5">
					<div>
						<div class="flex justify-between mb-1">
							<span class="text-xs text-text-muted flex items-center gap-1 lg:gap-1.5">
								<i class="fa-solid fa-location-dot text-brand-red text-[10px]"></i>GPS Data
							</span>
							<span class="text-xs font-bold text-brand-red">9 polí · 10%</span>
						</div>
						<div class="w-full h-2 rounded-full bg-navy-main/80">
							<div class="h-2 rounded-full bg-brand-red" style="width:10%"></div>
						</div>
					</div>
					<div>
						<div class="flex justify-between mb-1">
							<span class="text-xs text-text-muted flex items-center gap-1 lg:gap-1.5">
								<i class="fa-solid fa-camera text-brand-orange text-[10px]"></i>EXIF Data
							</span>
							<span class="text-xs font-bold text-brand-orange">51 polí · 59%</span>
						</div>
						<div class="w-full h-2 rounded-full bg-navy-main/80">
							<div class="h-2 rounded-full bg-brand-orange" style="width:59%"></div>
						</div>
					</div>
					<div>
						<div class="flex justify-between mb-1">
							<span class="text-xs text-text-muted flex items-center gap-1 lg:gap-1.5">
								<i class="fa-solid fa-tag text-brand-blue text-[10px]"></i>XMP Data
							</span>
							<span class="text-xs font-bold text-brand-blue">27 polí · 31%</span>
						</div>
						<div class="w-full h-2 rounded-full bg-navy-main/80">
							<div class="h-2 rounded-full bg-brand-blue" style="width:31%"></div>
						</div>
					</div>
				</div>
				<div class="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
					<span class="text-xs text-text-muted">Celkem odstraněno</span>
					<span class="text-sm font-black text-white">87 polí</span>
				</div>
			</div>

			<!-- Per-File Breakdown -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card">
				<h3 class="font-semibold text-base lg:text-lg text-white mb-0.5 lg:mb-1">Pole odstraněna dle souboru</h3>
				<p class="text-[11px] lg:text-xs text-text-muted mb-3 lg:mb-4">Počet odstraněných metadatových polí na soubor</p>
				<div class="flex flex-col gap-2.5 lg:gap-3">
					<!-- File 1 -->
					<div class="bg-navy-main/60 rounded-xl p-3 border border-gray-800">
						<div class="flex items-center gap-2.5 lg:gap-3 mb-2">
							<div class="w-7 h-7 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-image text-brand-green text-[11px]"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-semibold text-white truncate">IMG_4821.jpg</p>
								<p class="text-[10px] text-text-muted">JPEG · Canon EOS R5</p>
							</div>
							<span class="text-sm font-black text-white">12</span>
						</div>
						<div class="w-full h-1.5 lg:h-2 rounded-full bg-navy-card mb-2">
							<div class="h-1.5 lg:h-2 rounded-full bg-gradient-to-r from-brand-green to-green-400" style="width:14%"></div>
						</div>
						<div class="flex gap-1.5 flex-wrap">
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red">GPS ×3</span>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">EXIF ×5</span>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">XMP ×4</span>
						</div>
					</div>
					<!-- File 2 -->
					<div class="bg-navy-main/60 rounded-xl p-3 border border-gray-800">
						<div class="flex items-center gap-2.5 lg:gap-3 mb-2">
							<div class="w-7 h-7 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-image text-brand-green text-[11px]"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-semibold text-white truncate">photo_holiday_2024.heic</p>
								<p class="text-[10px] text-text-muted">HEIC · iPhone 15 Pro</p>
							</div>
							<span class="text-sm font-black text-white">18</span>
						</div>
						<div class="w-full h-1.5 lg:h-2 rounded-full bg-navy-card mb-2">
							<div class="h-1.5 lg:h-2 rounded-full bg-gradient-to-r from-brand-blue to-blue-400" style="width:21%"></div>
						</div>
						<div class="flex gap-1.5 flex-wrap">
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red">GPS ×3</span>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">EXIF ×8</span>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">XMP ×7</span>
						</div>
					</div>
					<!-- File 3 -->
					<div class="bg-navy-main/60 rounded-xl p-3 border border-gray-800">
						<div class="flex items-center gap-2.5 lg:gap-3 mb-2">
							<div class="w-7 h-7 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-video text-brand-orange text-[11px]"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-semibold text-white truncate">video_prague_walk.mp4</p>
								<p class="text-[10px] text-text-muted">MP4 · H.264</p>
							</div>
							<span class="text-sm font-black text-brand-orange">43</span>
						</div>
						<div class="w-full h-1.5 lg:h-2 rounded-full bg-navy-card mb-2">
							<div class="h-1.5 lg:h-2 rounded-full bg-gradient-to-r from-brand-orange to-orange-400" style="width:49%"></div>
						</div>
						<div class="flex gap-1.5 flex-wrap">
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red">GPS ×3</span>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">EXIF ×30</span>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">XMP ×10</span>
						</div>
					</div>
					<!-- File 4 -->
					<div class="bg-navy-main/60 rounded-xl p-3 border border-gray-800">
						<div class="flex items-center gap-2.5 lg:gap-3 mb-2">
							<div class="w-7 h-7 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-image text-brand-green text-[11px]"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-semibold text-white truncate">IMG_4822.jpg</p>
								<p class="text-[10px] text-text-muted">JPEG · Canon EOS R5</p>
							</div>
							<span class="text-sm font-black text-white">14</span>
						</div>
						<div class="w-full h-1.5 lg:h-2 rounded-full bg-navy-card mb-2">
							<div class="h-1.5 lg:h-2 rounded-full bg-gradient-to-r from-brand-green to-green-400" style="width:16%"></div>
						</div>
						<div class="flex gap-1.5 flex-wrap">
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red">GPS ×3</span>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">EXIF ×8</span>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">XMP ×3</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Detailed File Reports -->
		<div class="fade-in-up delay-3 lg:bg-navy-card lg:rounded-2xl lg:border lg:border-gray-800 lg:p-6 lg:shadow-card flex flex-col gap-3 lg:gap-4">
			<div class="flex items-center justify-between">
				<h3 class="font-semibold text-base lg:text-lg text-white">Detailní přehled souborů</h3>
				<button
					onclick={toggleAll}
					class="text-xs text-brand-blue font-semibold flex items-center gap-1 py-2 px-3 rounded-lg bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue/20 transition-colors"
				>
					<i class="fa-solid fa-list text-[10px]"></i>
					{allOpen ? 'Sbalit vše' : 'Rozbalit vše'}
				</button>
			</div>

			<!-- File 1 -->
			<div class="rounded-xl border border-brand-green/20 bg-navy-card lg:bg-navy-main/60 overflow-hidden shadow-card lg:shadow-none">
				<button
					onclick={() => toggleAccordion(0)}
					class="w-full flex items-center gap-3 px-4 py-3.5 lg:py-4 text-left hover:bg-navy-lighter/30 transition-colors"
				>
					<div class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-image text-brand-green text-sm"></i>
					</div>
					<div class="flex-1 min-w-0">
						<!-- Mobile layout -->
						<div class="flex items-center gap-2 mb-0.5 lg:hidden">
							<p class="text-sm font-semibold text-white truncate">IMG_4821.jpg</p>
							<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">JPG</span>
						</div>
						<p class="text-[10px] text-text-muted lg:hidden">3.2 MB · Canon EOS R5 · <span class="text-white font-semibold">12 polí</span></p>
						<!-- Desktop layout -->
						<p class="hidden lg:block text-sm font-semibold text-white truncate">IMG_4821.jpg</p>
						<p class="hidden lg:block text-[11px] text-text-muted">3.2 MB · JPEG · Canon EOS R5 · 12 polí odstraněno</p>
					</div>
					<div class="hidden lg:flex items-center gap-2 flex-shrink-0">
						<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted">JPG</span>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
						<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
					<!-- Mobile: GPS + check -->
					<div class="flex lg:hidden items-center gap-2 flex-shrink-0">
						<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
						<div class="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[9px]"></i>
						</div>
					</div>
					<i
						class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform ml-1"
						style="transform: {accordionOpen[0] ? 'rotate(180deg)' : 'none'}"
					></i>
				</button>
				{#if accordionOpen[0]}
					<div class="border-t border-gray-800">
						<div class="p-4 flex flex-col gap-3">
							<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-location-dot text-brand-red"></i> GPS Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Latitude</span><span class="text-xs font-mono text-brand-red line-through">50.0755° N</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Longitude</span><span class="text-xs font-mono text-brand-red line-through">14.4378° E</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Altitude</span><span class="text-xs font-mono text-brand-red line-through">202 m</span></div>
									</div>
								</div>
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-camera text-brand-orange"></i> EXIF Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">Make</span><span class="text-xs font-mono text-brand-red line-through">Canon</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Model</span><span class="text-xs font-mono text-brand-red line-through">EOS R5</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">DateTime</span><span class="text-xs font-mono text-brand-red line-through">2024:08:14</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Software</span><span class="text-xs font-mono text-brand-red line-through">Canon DPP</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">+ 5 dalších</span><span class="text-xs font-mono text-brand-red line-through">odstraněno</span></div>
									</div>
								</div>
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-tag text-brand-blue"></i> XMP Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">Creator</span><span class="text-xs font-mono text-brand-red line-through">Jana N.</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Rights</span><span class="text-xs font-mono text-brand-red line-through">© 2024</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Description</span><span class="text-xs font-mono text-brand-red line-through">Praha foto</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">+ 1 dalších</span><span class="text-xs font-mono text-brand-red line-through">odstraněno</span></div>
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-green/5 border border-brand-green/20">
								<i class="fa-solid fa-circle-check text-brand-green text-sm"></i>
								<p class="text-xs text-brand-green font-medium">Celkem odstraněno: <strong>12 polí metadat</strong> · Soubor je bezpečný ke sdílení.</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- File 2 -->
			<div class="rounded-xl border border-brand-green/20 bg-navy-card lg:bg-navy-main/60 overflow-hidden shadow-card lg:shadow-none">
				<button
					onclick={() => toggleAccordion(1)}
					class="w-full flex items-center gap-3 px-4 py-3.5 lg:py-4 text-left hover:bg-navy-lighter/30 transition-colors"
				>
					<div class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-image text-brand-green text-sm"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-0.5 lg:hidden">
							<p class="text-sm font-semibold text-white truncate">photo_holiday_2024.heic</p>
							<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">HEIC</span>
						</div>
						<p class="text-[10px] text-text-muted lg:hidden">8.7 MB · iPhone 15 Pro · <span class="text-white font-semibold">18 polí</span></p>
						<p class="hidden lg:block text-sm font-semibold text-white truncate">photo_holiday_2024.heic</p>
						<p class="hidden lg:block text-[11px] text-text-muted">8.7 MB · HEIC · iPhone 15 Pro · 18 polí odstraněno</p>
					</div>
					<div class="hidden lg:flex items-center gap-2 flex-shrink-0">
						<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted">HEIC</span>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
						<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
					<div class="flex lg:hidden items-center gap-2 flex-shrink-0">
						<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
						<div class="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[9px]"></i>
						</div>
					</div>
					<i
						class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform ml-1"
						style="transform: {accordionOpen[1] ? 'rotate(180deg)' : 'none'}"
					></i>
				</button>
				{#if accordionOpen[1]}
					<div class="border-t border-gray-800">
						<div class="p-4 flex flex-col gap-3">
							<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-location-dot text-brand-red"></i> GPS Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Latitude</span><span class="text-xs font-mono text-brand-red line-through">48.8566° N</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Longitude</span><span class="text-xs font-mono text-brand-red line-through">2.3522° E</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Speed</span><span class="text-xs font-mono text-brand-red line-through">0 km/h</span></div>
									</div>
								</div>
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-camera text-brand-orange"></i> EXIF Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">Make</span><span class="text-xs font-mono text-brand-red line-through">Apple</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Model</span><span class="text-xs font-mono text-brand-red line-through">iPhone 15 Pro</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Lens</span><span class="text-xs font-mono text-brand-red line-through">2.2mm f/2.2</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">DateTime</span><span class="text-xs font-mono text-brand-red line-through">2024:07:22</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">+ 8 dalších</span><span class="text-xs font-mono text-brand-red line-through">odstraněno</span></div>
									</div>
								</div>
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-tag text-brand-blue"></i> XMP Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">Subject</span><span class="text-xs font-mono text-brand-red line-through">Dovolená</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Rating</span><span class="text-xs font-mono text-brand-red line-through">5</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Label</span><span class="text-xs font-mono text-brand-red line-through">Red</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">+ 3 dalších</span><span class="text-xs font-mono text-brand-red line-through">odstraněno</span></div>
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-green/5 border border-brand-green/20">
								<i class="fa-solid fa-circle-check text-brand-green text-sm"></i>
								<p class="text-xs text-brand-green font-medium">Celkem odstraněno: <strong>18 polí metadat</strong> · Soubor je bezpečný ke sdílení.</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- File 3 -->
			<div class="rounded-xl border border-brand-green/20 bg-navy-card lg:bg-navy-main/60 overflow-hidden shadow-card lg:shadow-none">
				<button
					onclick={() => toggleAccordion(2)}
					class="w-full flex items-center gap-3 px-4 py-3.5 lg:py-4 text-left hover:bg-navy-lighter/30 transition-colors"
				>
					<div class="w-9 h-9 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-video text-brand-orange text-sm"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-0.5 lg:hidden">
							<p class="text-sm font-semibold text-white truncate">video_prague_walk.mp4</p>
							<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">MP4</span>
						</div>
						<p class="text-[10px] text-text-muted lg:hidden">142 MB · H.264 · <span class="text-white font-semibold">43 polí</span></p>
						<p class="hidden lg:block text-sm font-semibold text-white truncate">video_prague_walk.mp4</p>
						<p class="hidden lg:block text-[11px] text-text-muted">142 MB · MP4 · H.264 · 43 polí odstraněno</p>
					</div>
					<div class="hidden lg:flex items-center gap-2 flex-shrink-0">
						<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted">MP4</span>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
						<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
					<div class="flex lg:hidden items-center gap-2 flex-shrink-0">
						<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
						<div class="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[9px]"></i>
						</div>
					</div>
					<i
						class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform ml-1"
						style="transform: {accordionOpen[2] ? 'rotate(180deg)' : 'none'}"
					></i>
				</button>
				{#if accordionOpen[2]}
					<div class="border-t border-gray-800">
						<div class="p-4 flex flex-col gap-3">
							<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-location-dot text-brand-red"></i> GPS Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Latitude</span><span class="text-xs font-mono text-brand-red line-through">50.0500° N</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Longitude</span><span class="text-xs font-mono text-brand-red line-through">14.4000° E</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Altitude</span><span class="text-xs font-mono text-brand-red line-through">150 m</span></div>
									</div>
								</div>
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-camera text-brand-orange"></i> EXIF Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">Make</span><span class="text-xs font-mono text-brand-red line-through">Canon</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Model</span><span class="text-xs font-mono text-brand-red line-through">EOS R5</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">DateTime</span><span class="text-xs font-mono text-brand-red line-through">2024:07:20</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Software</span><span class="text-xs font-mono text-brand-red line-through">Canon DPP</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">+ 20 dalších</span><span class="text-xs font-mono text-brand-red line-through">odstraněno</span></div>
									</div>
								</div>
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-tag text-brand-blue"></i> XMP Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">Creator</span><span class="text-xs font-mono text-brand-red line-through">Jana N.</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Rights</span><span class="text-xs font-mono text-brand-red line-through">© 2024</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Description</span><span class="text-xs font-mono text-brand-red line-through">Praha video</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">+ 10 dalších</span><span class="text-xs font-mono text-brand-red line-through">odstraněno</span></div>
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-green/5 border border-brand-green/20">
								<i class="fa-solid fa-circle-check text-brand-green text-sm"></i>
								<p class="text-xs text-brand-green font-medium">Celkem odstraněno: <strong>43 polí metadat</strong> · Soubor je bezpečný ke sdílení.</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- File 4 -->
			<div class="rounded-xl border border-brand-green/20 bg-navy-card lg:bg-navy-main/60 overflow-hidden shadow-card lg:shadow-none">
				<button
					onclick={() => toggleAccordion(3)}
					class="w-full flex items-center gap-3 px-4 py-3.5 lg:py-4 text-left hover:bg-navy-lighter/30 transition-colors"
				>
					<div class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-image text-brand-green text-sm"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-0.5 lg:hidden">
							<p class="text-sm font-semibold text-white truncate">IMG_4822.jpg</p>
							<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">JPG</span>
						</div>
						<p class="text-[10px] text-text-muted lg:hidden">3.2 MB · Canon EOS R5 · <span class="text-white font-semibold">14 polí</span></p>
						<p class="hidden lg:block text-sm font-semibold text-white truncate">IMG_4822.jpg</p>
						<p class="hidden lg:block text-[11px] text-text-muted">3.2 MB · JPEG · Canon EOS R5 · 14 polí odstraněno</p>
					</div>
					<div class="hidden lg:flex items-center gap-2 flex-shrink-0">
						<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted">JPG</span>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
						<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
					<div class="flex lg:hidden items-center gap-2 flex-shrink-0">
						<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
						<div class="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[9px]"></i>
						</div>
					</div>
					<i
						class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform ml-1"
						style="transform: {accordionOpen[3] ? 'rotate(180deg)' : 'none'}"
					></i>
				</button>
				{#if accordionOpen[3]}
					<div class="border-t border-gray-800">
						<div class="p-4 flex flex-col gap-3">
							<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-location-dot text-brand-red"></i> GPS Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Latitude</span><span class="text-xs font-mono text-brand-red line-through">50.0755° N</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Longitude</span><span class="text-xs font-mono text-brand-red line-through">14.4378° E</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">GPS Altitude</span><span class="text-xs font-mono text-brand-red line-through">202 m</span></div>
									</div>
								</div>
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-camera text-brand-orange"></i> EXIF Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">Make</span><span class="text-xs font-mono text-brand-red line-through">Canon</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Model</span><span class="text-xs font-mono text-brand-red line-through">EOS R5</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">DateTime</span><span class="text-xs font-mono text-brand-red line-through">2024:08:14</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Software</span><span class="text-xs font-mono text-brand-red line-through">Canon DPP</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">+ 5 dalších</span><span class="text-xs font-mono text-brand-red line-through">odstraněno</span></div>
									</div>
								</div>
								<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
									<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
										<i class="fa-solid fa-tag text-brand-blue"></i> XMP Data
									</p>
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between"><span class="text-xs text-text-muted">Creator</span><span class="text-xs font-mono text-brand-red line-through">Jana N.</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Rights</span><span class="text-xs font-mono text-brand-red line-through">© 2024</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">Description</span><span class="text-xs font-mono text-brand-red line-through">Praha foto</span></div>
										<div class="flex justify-between"><span class="text-xs text-text-muted">+ 1 dalších</span><span class="text-xs font-mono text-brand-red line-through">odstraněno</span></div>
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-green/5 border border-brand-green/20">
								<i class="fa-solid fa-circle-check text-brand-green text-sm"></i>
								<p class="text-xs text-brand-green font-medium">Celkem odstraněno: <strong>14 polí metadat</strong> · Soubor je bezpečný ke sdílení.</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Footer -->
		<div class="fade-in-up delay-4 text-center text-text-muted text-sm mt-4 lg:mt-8 pb-4">
			<p>© 2025 MetaCleaner. Všechna práva vyhrazena.</p>
		</div>
	</main>
</div>

<style>
	@media print {
		.no-print {
			display: none !important;
		}
	}
</style>
