# AI Log

## 2026-06-29 18:12 — manual
- Project: frontend (metacleaner-app), plus monorepo-wide shell scripts
- Ran a full **MetaCleaner frontend code review** against `.kiro/specs/` (`.agents/tmp/CODE_REVIEW.md` — 1 CRITICAL, 4 HIGH, 8 MEDIUM, 14 LOW findings) and implemented the top 13 (`.agents/tmp/TASKS.md` items 1–13); LOW items 14–27 left open as backlog
- **Critical/high fixes** (`9c40e4a`): re-enabled the commented-out mobile drawer credit section in `MobileHamburgerMenu.svelte`; added copy button + eye-toggle + masked-by-default reveal to API key rows (`KeyRow.svelte`, `ApiKeysSection.svelte`) wiring the unused `apiKeys.action.showKey/hideKey/copyKey` keys; threaded the new key plaintext (`_fullKey`) through `handleKeyCreated` into a `newKeyValues` map so created keys stay revealable; fixed Pro+ `monthlyAllowance` 300→100 in `planStyleMap.ts`; replaced hardcoded English with `tx()` in `CreateKeyModal`, `UpgradeModal` reports branch, `KeyRow`, and `EmptyState`
- **Medium fixes** (`321f6b3`): added missing i18n keys `auth.common.validation.passwordMax72` and `auth.common.error.unknown` to `en.json`/`cs.json`; resolved docs Pro+ gate; reconciled risk-scoring weights in `scanner/constants.ts`; guarded the free plan in checkout (`subscription/+page.svelte`); fixed `CountdownCard.getProgress()` to use the real billing period; removed the non-spec `PATCH /api/keys/{id}/activate` activate flow; added an inline desktop "Docs" nav link + enabled the docs back button (`NavBar.svelte`); routed hardcoded `aria-label`/`title`/`placeholder` text through `tx()`
- Earlier same-day work also captured by git log: **steering-compliant script migration** across the monorepo (`890e2ee`, `842a0d3` — moved scripts into per-project `scripts/` dirs per `.agents/tmp/SPEC.md`), Stripe checkout/webhook + customer-deletion plumbing, billing cancel-downgrade flow, mobile navigation dropdown, settings page billing/danger-zone enhancements, and auth improvements (remember-me default, code resend cooldown, account auto-reactivation)

## 2026-06-28 08:27 — manual
- Project: frontend (metacleaner-monitoring)
- Completed the **full UI decomposition refactor** of the Monitorly monitoring app (`.agents/tmp/REFACTORING.md` / `TASKS.md`, all 67 tasks done), breaking the 10 monolithic page files (~8,200 lines) into a Theme → Elements → Components → Sections → Page hierarchy with no visual change; net removed ~7,800 lines of duplicated markup
- **Phase 0 — theme tokens** (`ec0fa75`): extended `src/routes/layout.css` `@theme` with 10 missing color tokens (`--color-surface`, `--color-border`, `--color-blue`, `--color-green-muted`, `--color-purple`, `--color-amber`, `--color-purple-light`, `--color-surface-hover`, `--color-surface-deep`, `--color-blue-light`), added `src/lib/theme/chartColors.ts` for Plotly, and replaced ~770 hardcoded hex utilities (`bg-[#1e293b]` etc.) with theme tokens across all pages
- **Phase 1 — shared elements** (`2c24f02`, `8dab7ea`, `3e805d6`, `b12de2f`): created 8 reusable elements under `src/lib/shared/elements/` with Storybook stories — `StatCard`, `ChartCard`, `AccordionSection`, `StatusBadge`, `MethodBadge`, `ProgressBar`, `FilterPill`, `DataTable`
- **Phase 2 — shared components** (`5abe3c0`, `cb034a3`): created 6 components under `src/lib/shared/components/` with stories — `MobileBottomNav`, `PageHeader`, `KpiGrid`, `PlotlyChart` (Plotly init/resize/cleanup wrapper), `EventLogTable`, `TabSwitcher`
- **Phase 3 — page-specific components & sections** (`13bbb02`, `bb77aa1`, `90b82ca`, `ba83f5a`, `4f349c2`, `726e4fb`, `7e5715e`, `0ec1a4a`, `936b0df`, `0eaf6ff`, `277fef9`, `996d513`): built per-page `components/` (e.g. `AlertItem`, `ServiceUptimeCard`, `UptimeTimeline`, `InstanceCard`, `DeployItem`, `FunnelStep`, `CohortCell`, `UserRow`, `PaginationControls`) and `sections/` (KPI, charts, log, and feature sections for Dashboard, Availability, Errors, Database, Runtime, Edge, Performance, Security, Business, Users), each with stories
- **Phase 4 — page refactors** (`7e953f7`, `4d2c90a`): rewrote all 10 `+page.svelte` files to thin compositions of `PageHeader` + sections + `MobileBottomNav`, removing ~7,880 lines of inline markup
- **Storybook fix** (`bbe6b47`): corrected invalid `exportName` values in story files whose names start with numbers (`CohortCell`, `ErrorLogRow`)

## 2026-06-27 23:36 — manual
- Project: frontend (metacleaner-monitoring)
- Completed the **i18n + repository refactor** of the Monitorly monitoring app (`.agents/tmp/TASKS.md` / `DATA_SPEC.md`, all 41 tasks done), extracting ~1,500 hardcoded Czech/English strings into Paraglide translation keys and moving all mock data out of components into a typed repository layer
- **i18n infrastructure** (`da62a4e`): added `src/lib/i18n.ts` (`t()` helper wrapping Paraglide messages), `src/lib/locale.svelte.ts` (reactive locale `$state` with localStorage persistence under `monitorly-locale`), and populated `messages/en.json` / `cs.json` with the `common.*` and `layout.*` key namespaces
- **Repository layer** (`d07bdb3`, `7dec6ef`): created 11 typed repositories under `src/lib/repositories/` — `navigation`, `dashboard`, `availability`, `errors`, `database`, `runtime`, `edge`, `performance`, `security`, `business`, `users` — plus an `index.ts` barrel export; each returns typed mock data ready to swap for real API calls
- **String extraction** (`ee4c597`, `35d7359`, `d365207`, `88ee311`, `255c6a9`, `9ae2fc3`, `d960314`): replaced hardcoded UI text across `+layout.svelte` and all 10 page routes (Dashboard, Availability, Errors, Database, Runtime, Edge, Performance, Security, Business, Users) with `t()` translation keys, growing `en.json` / `cs.json` to ~500+ keys each
- **Data wiring** (`be94371`, `40ae4e6`, `819eab6`, `0678476`, `89daa3a`, `4fb0692`): replaced inline mock data in every page with repository calls — stats, charts, tables, logs, funnels, and OKR goals now sourced from their repositories, removing hundreds of lines of duplicated data from the components
- **Language switching** (`4fb0692`): added `src/lib/components/LanguageSwitcher.svelte` (EN/CS toggle) and wired it into the desktop sidebar and mobile drawer in `+layout.svelte`

## 2026-06-27 17:41 — manual
- Project: frontend (metacleaner-monitoring)
- Built the **Monitorly monitoring app** from scratch (`.agents/tmp/TASKS.md` / `PAGES.md`, all 11 tasks done), implementing 10 dashboard pages from the `.design/monitoring-*-desktop.html` / `-mobile.html` mockups plus shared layout and navigation
- Scaffolded the shared shell (`5ae1feb`): `app.html`, `+layout.svelte` (sidebar + mobile drawer/bottom nav), and `layout.css`, then built the **Dashboard** (`+page.svelte`) with uptime stats (Frontend 99.99%, Backend 99.95%, Error Rate 0.12%, DB Health), API response-time chart, errors bar chart, server-resource (CPU/RAM) chart, and active alerts list
- Created the **Dostupnost / Availability** page (`98ed79c`): 4 service uptime cards, dual-line response chart, 5 health-check endpoints, 90-day uptime timeline, incidents log with filter tabs, SLA progress bars, and MTTR/MTBF/outage quick stats
- Created **Chyby & Pády / Errors** (`4feaa89`): KPI cards (5xx, JS, backend exceptions, timeouts), 5xx timeline, JS-vs-Backend bar chart, error-type donut, top error endpoints, and a filterable error-log table
- Created **Databáze / Supabase** (`fa054c9`): connection-pool (87/100), query-latency (24ms), storage (6.2/8 GB) and error stats, latency/connections charts, query-type pie, slowest queries, table sizes, and DB error log
- Created **Runtime / Fly.io** (`3da59b1`): CPU/RAM/uptime/restart/instance stats, CPU/RAM/response/network charts, instance-status panel, deploy history, runtime error log, HTTP-status distribution, and requests/min chart
- Created **Edge / Cloudflare** (`dcf04af`): cache hit rate (94.2%), total requests (48.3M), saved bandwidth, blocked threats, PoP/TTFB/WAF/SSL stats, request & bandwidth charts, threat-type pie, TTFB-by-region, cache-rule performance, and WAF security log
- Created **Performance** (`3be5f0b`): Apdex (0.94), avg response (187ms), throughput, error rate, response/throughput/CPU-RAM charts, error-type donut, slowest endpoints, Core Web Vitals (LCP/FID/CLS), and event log
- Created **Security Signály** (`ef6c909`): threat score (74/100), failed-logins/blocked-IPs/anomalies stats, events timeline, geographic origins, attack-type pie, active-threats panel, blocked-IP list, and a 47-record security event log
- Added agent notes `PAGES.md` and `package-lock.json` (`31cc14e`), then created **Business Metriky** (`1977d4d`): MRR/ARR/active-users/churn KPIs plus MRR development, user growth, LTV-vs-CAC, ARPU, cohort retention, conversion funnel, OKR goals, and other revenue/customer analytics
- Created **Uživatelé / Users** (`9286cfd`): total/online/new/inactive user stats, registration & active-session charts, and a tabbed (All/Online/New/Inactive), paginated user table
- **Wired up navigation** (`55363f4`): linked all pages via desktop sidebar and mobile drawer/bottom nav with correct active states (final fixes to `business` and `edge` pages)

## 2026-06-25 08:23 — manual
- Project: frontend (metacleaner-app)
- Completed the **UI decomposition refactor of the Settings page** (`.agents/tmp/REFACTORING.md` / `TASKS.md`, all 19 tasks done), breaking the 656-line `settings/+page.svelte` monolith into a Page → Sections → Components hierarchy with no visual change
- Phase 0 — tokenized remaining hardcoded hex: replaced the 4 strength-meter colors in `settings/+page.svelte` (`#ef4444`/`#f97316`/`#3b82f6`/`#22c55e`) with `var(--color-brand-red/orange/blue/green)`, and added a new `--color-navy-deep: #080f1e` token to `layout.css` replacing `bg-[#080f1e]` in `docs/components/QuickStartFlow.svelte` (`e6a17e4`)
- Created `settings/components/SettingsAccordionCard.svelte` — reusable mobile-collapsible / desktop-always-open accordion wrapper (icon, title, subtitle, rotating chevron) — plus its `.stories.svelte` (`8bf0bf5`)
- Created five section components under `settings/sections/`: `SettingsHeaderSection`, `AccountInfoSection`, `ChangePasswordSection` (reusing shared `PasswordInput` + `PasswordStrengthMeter` from auth instead of inline copies), `ApiKeysSection`, and `AffiliateProgramSection`, each with a co-located Storybook story (`fcf0c8f`, `6791b16`)
- Refactored `settings/+page.svelte` to compose `SettingsHeaderSection` + the 4 section cards, using the shared `Toast` component and removing the inline `<style>` block (`123ff6c`)
- Split the 424-line `docs/components/EndpointCard.svelte` into `EndpointParamsTable`, `EndpointResponsesGrid`, and `EndpointCodeSection` sub-components (`b4a4727`)
- Marked all refactoring tasks complete in `TASKS.md` (`1a9fe44`)

## 2026-06-25 07:58 — manual
- Project: frontend (metacleaner-app)
- Completed the **i18n + repository data refactor of the Settings page** (`.agents/tmp/TASKS.md` / `DATA_SPEC.md`, all 6 tasks done), the one remaining file (`src/routes/settings/+page.svelte`) that still held hardcoded strings after the page was first built
- Extracted ~45 hardcoded (mostly Czech) UI strings into new `settings.*` Paraglide keys, added to both `messages/en.json` and `messages/cs.json` — covering account-info, change-password (incl. strength labels Weak/Average/Good/Strong), affiliate, and API-keys sections plus all toast/badge/button copy
- Created `src/lib/repositories/settingsRepository.ts` with `getSettingsProfile()`, `getAffiliateStats()`, and `getApiKeys()` returning mock data (user name/email/avatar/plan/lastLogin, affiliate referrals/conversions/earnings/link, production + test API keys with created/last-used dates) — designed to be swapped for real API calls later
- Replaced hardcoded text in `+page.svelte` with `tx()` calls and hardcoded data values with `settingsRepository` calls (~10 data fields); verified no hardcoded user-facing text remains and language switching works via the existing `LanguageDropdown`
- Commits: `ee63240` (i18n + repository data layer for settings page), `ba2ffb0` (mark all settings i18n tasks complete after verification)

## 2026-06-25 07:45 — manual
- Project: frontend (metacleaner-app)
- Built the **Account Settings page** (`.agents/tmp/TASKS.md` / `PAGES.md`, both tasks done) from the `.design/metacleaner-settings-desktop.html` and `metacleaner-settings-mobile.html` mockups, with a desktop two-column grid (all sections visible) and a mobile single-column accordion (only "Account Info" open by default, others collapsible with rotating chevrons)
- Implemented four section cards: **Account Info** (avatar with edit button, Pro/Ověřen badges, name/email/company form fields, "Uložit změny" save), **Change Password** (current/new/confirm password inputs with eye toggles and a realtime password-strength meter, green "Uložit nové heslo" save), **API Keys** (Production key with pulsing green dot + "Aktivní" badge and Test/Sandbox key with dashed border, each with eye-toggle, copy-to-clipboard, and metadata), and **Affiliate Program** (3-stat grid, readonly affiliate link with copy button, 20%-commission info box)
- Added the settings navbar with MetaCleaner brand logo, "Zpět na čištění" back button, and user dropdown (email, "Nastavení" gear link, red "Odhlásit se" logout), plus copy-to-clipboard toast notifications (success/error, auto-dismiss 3s)
- **Wired up navigation** (`0999347`): Settings reachable from the user dropdown menu, "Zpět na čištění" returns to the main cleaning page, and all internal links verified working
- Commits: `20a7f9b` (desktop + mobile settings pages), `719a14c` (account/password/API-keys/affiliate sections), `0999347` (Settings page navigation wiring)

## 2026-06-18 10:32 — manual
- Project: frontend (metacleaner-web)
- Completed the full UI decomposition refactor of the marketing site (REFACTORING.md / TASKS.md, all 85 tasks done), breaking the three monolithic page files (Home 867 lines, Features 539, Pricing 398) into a Page → Sections → Components → Elements hierarchy with **no visual change** to any page
- Phase 0 — centralized remaining hardcoded visual constants into Tailwind v4 `@theme` tokens in `src/routes/layout.css`: added `--color-border` (#1f2937), `--color-border-strong` (#374151), `--color-watermark`, `--container-site` (1100px), and blur tokens; replaced `border-gray-800` (×60), `border-gray-700` (×13), `text-gray-800`, `max-w-[1100px]` (×11), and raw hex in the `.lang-*` CSS with `var(--color-*)` references
- Phase 1 — created 12 shared **elements** under `src/lib/components/elements/`: `BrandLogo`, `IconBadge`, `SectionHeading`, `CtaButton`, `CheckBullet`, `NavLink`, `GradientText`, `FormatBadge`, `SocialIconLink`, `FooterBrand`, `FooterColumn`, `FooterBottomBar`
- Phase 2 — created shared **components** under `src/lib/components/shared/`: `SiteNavbar`, `MobileNavbar`, and `MobileMenu` (unifying the Home slide-in drawer and the byte-identical Features/Pricing dropdowns behind a `variant` prop); added a story for the existing `LanguageSwitcher`
- Phase 3 — created page-specific components & sections: Home (`UploadCard`, `MetadataFieldRow`, `MetadataComparisonCard`, `RiskStatCard`, `StepCard`, `AudienceCard`, `FaqAccordionItem` with internal `$state` replacing DOM-class toggling; sections `HeroSection`, `WhyItMattersSection`, `HowItWorksSection`, `AudienceSection`, `FaqSection`, `HomeFooter`); Features (`FormatPill`, `ExifIllustration`, `C2paIllustration`, `FeatureRow`, `FeatureCard`; sections `FeaturesHeaderSection`, `FeaturesShowcaseSection`, `FeaturesCtaSection`, `FeaturesFooter`); Pricing (`BillingToggle`, `PricingCard`, `EnterpriseBanner`; sections `PricingHeaderSection`, `PricingPlansSection`, `PricingFooter`)
- Phase 4 — moved `src/routes/+page.svelte` → `src/routes/(home)/+page.svelte` (route group, same URL) and rewrote all three pages as short composition files importing shared navbar/menu + their sections, keeping `mobileMenuOpen` and `currentBilling`/`isYearly` `$state` in the pages and passing down
- Added a co-located `*.stories.svelte` for every new element and component (Storybook 10 + `@storybook/addon-svelte-csf`)
- Verified clean `npm run check` (0 type errors) and `vite build`, `npm run build-storybook` (all stories build), and visual parity on Home/Features/Pricing desktop + mobile — language switch, billing toggle, FAQ accordion, and mobile menu all still work, no duplicated UI code remains

## 2026-06-18 07:36 — manual
- Project: frontend (metacleaner-web)
- Completed the full i18n + repository refactor of the marketing site (DATA_SPEC.md / TASKS.md, all 28 tasks done), converting ~300 hardcoded (mostly Czech) strings across the Home, Features, and Pricing pages into Paraglide JS messages with `en` as base locale
- Set the Paraglide runtime locale strategy to `["localStorage", "cookie", "preferredLanguage", "baseLocale"]` and added an `src/lib/i18n.ts` `t(key)` resolver mirroring the app's `tx()` pattern
- Seeded `messages/en.json` and `messages/cs.json` with the namespaced key set (`nav_*`, `cta_*`, `footer_*`, `home_*`, `features_*`, `pricing_*`, `meta_*`) and verified complete en/cs key parity
- Created `src/lib/repositories/` data layer — `featuresRepository`, `pricingRepository` (+ `getEnterprise()`/billing helpers), `audienceRepository`, `faqRepository`, `stepsRepository`, `statsRepository`, `metadataDemoRepository`, and an `index.ts` re-exporting all — sourcing structured content (feature cards, plans, audience cards, FAQ, steps, risk stats, EXIF demo) once for both desktop and mobile layouts
- Replaced the duplicated hardcoded markup in all three pages with `#each repository(...)` loops resolving copy via `t(key)`
- Created `src/lib/components/LanguageSwitcher.svelte` driven by Paraglide `getLocale`/`setLocale`/`locales` (en/cs), mounted in every page's desktop navbar and mobile drawer, and removed the per-page `langConfig`/`setLang`/`localStorage('lang')` code
- Verified clean `vite build`, no remaining hardcoded user-facing copy (only brand/product/format/`−20%` literals), and language choice persisting across reload

## 2026-06-18 — data-refactor
- Project: frontend (metacleaner-web)
- Task: i18n + repository refactor verification (task 28)
- Verified en/cs key parity: both `messages/en.json` and `messages/cs.json` contain exactly 229 keys with identical key sets (zero missing in either direction)
- Verified zero hardcoded Czech characters remain in any of the three page components (`+page.svelte`, `features/+page.svelte`, `pricing/+page.svelte`)
- Ran `vite build` — clean build, 0 errors, 0 type errors; `svelte-check` reports 0 errors (43 pre-existing accessibility warnings for placeholder `#` hrefs, unchanged from before this refactor)
- All repositories (`featuresRepository`, `pricingRepository`, `audienceRepository`, `faqRepository`, `stepsRepository`, `statsRepository`, `metadataDemoRepository`) confirmed in place under `src/lib/repositories/`
- `LanguageSwitcher.svelte` confirmed in `src/lib/components/`, driven by Paraglide `getLocale`/`setLocale`

## 2026-06-18 06:02 — manual
- Project: frontend (metacleaner-web)
- Built the MetaCleaner Web marketing site from the `.design/` mockups, reproducing each design pixel-perfectly with responsive mobile + desktop variants and Czech-default `data-cs`/`data-en` multilingual text (PAGES.md documents the shared design system — colors, Inter font, navbar, footer, language switcher)
- Implemented the **Home** page (`69ed1ef`): navbar, gradient hero with animated dashed upload card and Try-free/Download CTAs, "Why It Matters" before/after metadata comparison + risk stats, "How It Works" 3 steps, "Who Is It For" cards, FAQ accordion, footer, plus a mobile sticky navbar and slide-in menu drawer with overlay
- Implemented the **Features** page (`688b2e8`): responsive showcase of 6 tools (EXIF Metadata Removal, AI Tool Detection, C2PA Removal, Risk Scanner, Batch Processing, PDF Report) with alternating 2-column rows + PNG illustrations on desktop and stacked cards + "Začněte zdarma" CTA on mobile
- Implemented the **Pricing** (Ceník) page (`77f815e`): monthly/yearly billing toggle (−20%), 4 plan cards (Zdarma, 50 fotek, Pro featured w/ glow, Pro+ "Připravujeme"), Enterprise banner, and `setBilling()` wiring to swap yearly prices and reveal struck-through originals + green savings
- Wired up cross-page navigation and the language switcher (`10af231`): shared navbar/footer links, mobile menu drawer, per-page active link highlighting, and site-wide language switching with localStorage persistence
- Added desktop and mobile feature page assets (`6e28129`) and scaffolded the metacleaner-web project (`92d4aaf`)

## 2026-06-16 07:26 — manual
- Project: frontend, backend, terminal (full stack — unit/integration test pipeline)
- Generated test spec (TEST_SPEC.md) and task list (TASKS.md) targeting remaining uncovered logic; all tasks completed
- Added unit tests for `backend/metacleaner-server/source/supabase_auth.go` pure helpers — `authURL`/`restURL` path concatenation, `GetOAuthURL` PKCE query params (`code_challenge`, `code_challenge_method=S256`), and `SupabaseAuthError.Error()` formatting (`source/supabase_auth_url_test.go`)
- Added unit tests for `frontend/.../lib/repositories/userRepository.ts` `getCurrentUser` — unauthenticated/non-ok fallbacks and `first_name`+`last_name` → `name` composition (`userRepository.test.ts`)
- Added unit tests for `terminal/.../src/polyfills.ts` `FileReaderPolyfill` — `readAsArrayBuffer`/`readAsText` result + event dispatch, error path, and `EMPTY/LOADING/DONE` constants (`tests/polyfills.test.ts`)
- Added unit tests for `frontend/.../lib/repositories/authRepository.ts` (`getAuthStats`/`getAuthPlans`) and `languageRepository.ts` (`getLanguages`) static shapes (`authRepository.test.ts`, `languageRepository.test.ts`)
- Ran full suite (TEST_RESULTS.md): frontend 482/482, CLI 154/154, backend `source` 24/24 passing; identified 18 backend `tests` failures rooted in auth middleware rejecting HS256 test JWTs
- Fixed auth middleware to support HS256 tokens, corrected file ID validation, and fixed PDF report redirect (commit `bbede58`), resolving the 18 failures
- Updated UNIT_TEST_REPORT.md

## 2026-06-15 14:05 — manual
- Project: backend (metacleaner-server)
- Performed full security audit of the codebase, identifying 15 findings (4 HIGH, 6 MEDIUM, 5 LOW)
- Implemented all 9 actionable security fixes from the audit:
  - Validated fileID against localIDPattern in HandleCreateJob and HandleFileDownload to prevent path traversal (handlers.go)
  - Rejected CORS requests when FRONTEND_ORIGIN is empty instead of allowing wildcard (router.go)
  - Deleted old-code/ecosystem.config.js and old-code/.env containing live Stripe/Brevo keys
  - Added security headers middleware: X-Content-Type-Options, X-Frame-Options, HSTS (router.go)
  - Restricted WebSocket Upgrader CheckOrigin to configured FRONTEND_ORIGIN (websocket.go)
  - Added rate limiting to file and job download endpoints (router.go)
  - Added http.MaxBytesReader to HandleCreateJob to cap JSON body size (handlers.go)
  - Increased generateFileID entropy from 4 bytes to 16 bytes (handlers.go)
- Performed full code review against .kiro/specs/ specifications, identifying 1 CRITICAL, 2 HIGH, 3 MEDIUM, 3 LOW issues
- Generated CODE_REVIEW.md and SECURITY_AUDIT.md reports in .agents/tmp/

## 2026-06-15 13:32 — manual
- Project: frontend, backend, terminal (full stack)
- Applied code review improvements from IMPROVEMENTS.md analysis (15 of 20 tasks completed, remaining 5 LOW deferred)
- [CRITICAL] Added error logging and retry logic for DB updates in background job goroutine (`backend/handlers.go`)
- [CRITICAL] Increased `MAX_POLLS` in `apiCleaningService.ts` polling fallback and added exponential backoff
- [CRITICAL] Added `reportId` polling fallback when `report_ready` WS event is missed — polls `GET /api/jobs/{id}` after job completion
- [HIGH] Added runtime validation in `dispatchWsMessage` before unsafe type casts on WebSocket message fields (`metaCleanerApi.ts`)
- [HIGH] Fixed `HandleUpload` to process each file independently with per-file errors (`backend/handlers.go`, `models.go`, `supabase.go`)
- [HIGH] Created unit tests for `deep-link.ts` covering Capacitor URL interception and token extraction (`deepLink.test.ts`)
- [HIGH] Added file format validation in CLI `clean` command before uploading (`terminal/commands.ts`)
- [HIGH] Fixed `callAuthApi` return type for 204/empty responses — uses `null` return instead of `{} as T` cast (`auth.svelte.ts`)
- [MEDIUM] Added input format validation in `extractDate`/`extractTime` with `new Date()` fallback (`apiCleaningService.ts`)
- [MEDIUM] Added localID format validation in `HandleJobDownload` with fallback strategy (`backend/handlers.go`)
- [MEDIUM] Fixed CLI `executeCompare` format field to use `IMAGE_EXTENSIONS[ext] ?? VIDEO_EXTENSIONS[ext]` (`terminal/commands.ts`)
- [MEDIUM] Made `api-config.ts` throw a clear error when `PUBLIC_API_URL` is empty instead of silent console.warn
- [MEDIUM] Refactored `LoadConfig` to return errors instead of calling `log.Fatal` (`backend/config.go`, `main.go`)
- [MEDIUM] Batched dead connection removal in `WebSocketHub.Broadcast` to reduce lock contention (`backend/websocket.go`)
- [MEDIUM] Added dedicated tests for `token-utils.ts` `extractCallbackParams` with edge-case URL formats (`tokenUtils.test.ts`)

## 2026-06-15 12:17 — manual
- Project: frontend, backend, terminal (full stack)
- Implemented code review fixes from full-codebase audit (8 of 12 tasks completed)
- [HIGH] Secured WebSocket `/api/jobs/{id}/progress` endpoint with JWT authentication — removed `/progress` exemption from `isExemptPath()`, token passed as query param and validated before upgrade
- [HIGH] Fixed Storybook story mock data to use `iconColor: 'blue'` for image type entries across ReportTableRow, ReportCard, ReportsList, ReportsTable stories
- [MEDIUM] Added `onSettings`/`onLogout` callback props and `onclick` handlers to `MobileHamburgerMenu.svelte`
- [MEDIUM] Wrapped all `goto('/path')` and `href="/path"` in auth route components with `resolve()` from `$app/paths`
- [MEDIUM] Replaced local `riskScoreLabel()` in `RiskScoreRing.svelte` with shared `tx()` i18n import
- [MEDIUM] Removed 28 dead i18n keys from `messages/en.json` and `messages/cs.json`
- [MEDIUM] Added client-side format validation in CLI `clean` command before uploading
- [MEDIUM] Fixed CLI `compare` command temp file path to preserve original file extension
- Fixed `authGuard.test.ts` — resolved `window is not defined` ReferenceError by moving to client test environment
- Created E2E test for `/email-verified` page (responsive checks, navigation, hero, stepper, stats, action cards)
- Created 24 new Storybook stories for sections across Step1, Step3, Step4, Step5, Report, and Reports pages

## 2026-06-14 14:05 — manual
- Project: metacleaner-app (frontend)
- Refactored `src/routes/(auth)/email-verified/+page.svelte` — decomposed monolithic ~520-line page into 4 sections (EmailVerifiedHeroSection, EmailVerifiedProgressSection, EmailVerifiedStatsSection, EmailVerifiedActionsSection)
- Created 3 page-specific components with Storybook stories: AnimatedCheckmark, VerificationStepper, ActionCard
- Added 5 missing theme tokens to `layout.css`: `brand-green-10`, `brand-green-35`, `brand-green-darker`, `brand-blue-15`, `brand-orange-10`
- Replaced ~30 hardcoded inline color values and `<style>` block hex colors with theme token references
- Verified Storybook builds successfully with all new stories

## 2026-06-14 13:15 — manual
- Project: metacleaner-app (frontend)
- Extracted 3 hardcoded strings from `src/routes/+error.svelte` to i18n keys (`error.page.title`, `error.page.defaultMessage`, `error.page.goHome`) with Czech translations
- Replaced 6 hardcoded stat values (50K+, 2M+, 100%) in `src/routes/(auth)/email-verified/+page.svelte` with `getAuthStats()` from authRepository
- Replaced hardcoded `demoEmail` in email-verified page with `getCurrentUser()` from userRepository
- Verified all strings are translated and no hardcoded text remains across the project

## 2026-06-14 13:02 — manual
- Project: metacleaner-app (frontend)
- Created Auth Email Verification success page with responsive layout (mobile single-column, desktop two-column with left info panel and right success card)
- Added design reference files: `.design/auth-email-verification-mobile.html`, `.design/auth-email-verification-desktop.html`
- Implemented animated checkmark hero, horizontal/vertical progress stepper, stats row, "what's next" action cards, CTA buttons, and trust badges
- Wired up navigation so all pages link correctly to the new `/email-verified` route
- Key commits: `feat: add email verified success page with responsive layout`, `feat: wire up email verification navigation to /email-verified page`

## 2026-06-13 01:52 — ui-tests
- Project: metacleaner-app
- Created Storybook story for `PasswordRecoveryProgressCards` component (states: Step2Active, Step3Active, AllDone) in `src/routes/(auth)/components/PasswordRecoveryProgressCards.stories.svelte`
- Created Storybook story for `TrustBadges` component (states: Default) in `src/routes/(auth)/components/TrustBadges.stories.svelte`
- Fixed `report-detail.spec.ts` — resolved accordion toggle test timeout by adding wait for animation completion
- Created E2E test for `/login` page (`e2e/login.spec.ts`) — email input, password input, social login buttons, submit button, error messages
- Created E2E test for `/register` page (`e2e/register.spec.ts`) — registration form, password strength meter, terms checkbox, check-email transition
- Created E2E test for `/forgot-password` page (`e2e/forgot-password.spec.ts`) — step progress, email/OTP/new-password multi-step flow
- Created E2E test for auth navigation (`e2e/auth-navigation.spec.ts`) — cross-page link verification between login, register, forgot-password
- Created E2E test for auth responsive layout (`e2e/auth-responsive.spec.ts`) — mobile 375px and desktop 1280px viewport assertions

## 2026-06-12 17:39 — create-code
- Project: metacleaner-app
- Spec: user-authentication
- Implemented backend auth infrastructure: Supabase Auth client (`supabase_auth.go`), JWT validation middleware (`auth_middleware.go` task 1.2), auth rate limiter (`auth_rate_limiter.go` task 1.3), auth models and error codes (`auth_models.go` task 1.4)
- Implemented backend auth handlers: POST `/api/auth/register` (task 2.1), POST `/api/auth/login` (task 2.2), POST `/api/auth/logout`, POST `/api/auth/refresh`, GET `/api/auth/me` (task 2.3), POST `/api/auth/forgot-password`, POST `/api/auth/verify-reset-code`, POST `/api/auth/reset-password` (task 2.4), GET `/api/auth/oauth/{provider}`, GET `/api/auth/oauth/callback` (task 2.5), POST `/api/auth/magic-link`, GET `/api/auth/magic-link/callback` (task 2.6), `/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association` (task 2.7), wired auth middleware and `user_id` into router (task 2.8)
- Implemented database migration with profiles table and RLS policies (`scripts/migration002.sql` task 4.1)
- Implemented frontend auth store with reactive state and token management (`auth.svelte.ts` task 5.1)
- Implemented auth API client with proactive token refresh (`api-client.ts` task 5.2)
- Implemented token extraction utility for OAuth/magic link callbacks (`token-utils.ts` task 5.3)
- Wired auth logic into login page (task 6.1), refactored registration into single-page multi-step flow (task 6.2), refactored password reset into single-page multi-step flow (task 6.3)
- Implemented auth guard for protected and auth-only routes (`auth-guard.ts` task 7.1)
- Implemented Capacitor deep link handler for auth callbacks (`deep-link.ts` task 7.2)
- Wired auth into existing pages with NavBar user state and logout (task 7.3)
- Fixed all failing frontend tests (task 8 checkpoint)
- Created backend unit tests: auth middleware (`auth_middleware_test.go` task 9.1), auth handlers (`auth_handlers_test.go` task 9.2), auth rate limiter (`auth_rate_limiter_test.go` task 9.3)
- Created backend property tests: input validation (`auth_property_input_validation_test.go` task 9.4), middleware rejection (`auth_property_middleware_test.go` task 9.5), error format consistency (`auth_property_error_format_test.go` task 9.6), trial credits assignment (`auth_property_credits_test.go` task 9.7)
- Created frontend unit tests: auth store (`authStore.test.ts` task 10.1), API client (`apiClient.test.ts` task 10.2), auth guard (`authGuard.test.ts` task 10.3)
- Created frontend property tests: anti-enumeration consistency (`antiEnumeration.test.ts` task 10.4), concurrent refresh deduplication (`concurrentRefreshProperty.test.ts` task 10.5)
- Fixed lint/type errors for final checkpoint (task 11)
- Code review fixes (CRITICAL/HIGH): Added password field autocomplete attributes in `LoginFormSection.svelte`, fixed auth store `clearTokens` to clear all storage keys, added CSRF-safe OAuth state parameter validation, fixed `NavBar.svelte` conditional user display, added error boundary in `ForgotPasswordFormSection.svelte`, fixed `CheckEmailContent.svelte` resend cooldown
- Code review fixes (MEDIUM): Added `aria-live` to `RegisterFormSection.svelte` error messages, fixed `register/+page.svelte` step transition accessibility, improved `auth-guard.ts` redirect loop prevention, added token expiry buffer to `auth.svelte.ts`, fixed i18n keys in `messages/en.json` and `messages/cs.json`, added route layout guards for `/reports` and `/report`

## 2026-06-12 12:53 — create-code
- Project: metacleaner-app

- Spec: user-authentication
- Created specification files for user authentication feature in `.kiro/specs/user-authentication/`
- Created `requirements.md` with 19 requirements covering: user registration, login, token refresh, logout, password reset flow, protected route access, RLS configuration, frontend login/register/password-reset pages, session storage, OAuth backend/frontend flows, magic link backend/frontend integration, user profile, mobile deep link configuration
- Created `design.md` with architecture design: backend auth handlers (`auth_handlers.go`, `auth_middleware.go`, `auth_rate_limiter.go`, `supabase_auth.go`, `well_known.go`), frontend auth store (`auth.svelte.ts`), API client (`api-client.ts`), auth guard (`auth-guard.ts`), deep link handler (`deep-link.ts`), token utilities (`token-utils.ts`), database schema (`profiles` table, RLS policies, `user_id` columns), 7 correctness properties
- Created `tasks.md` with 11 task groups (37 subtasks) covering: backend auth infrastructure, backend auth handlers, database schema/RLS migration, frontend auth store/API client, frontend auth page wiring, auth guard/deep link handler, backend tests (unit + property), frontend tests (unit + property)
- No code review fixes applied (spec-only pipeline run)
- No tests created (implementation pending)

## 2026-06-12 10:01 — create-code
- Project: metacleaner-app

- Spec: frontend-code-quality-refactor
- Created shared utility module `src/lib/shared/utils/i18n.ts` with `tx()` function
- Created shared utility module `src/lib/shared/utils/format.ts` with `formatSize()` function
- Created shared utility module `src/lib/shared/utils/reportStyles.ts` with `tagStyle()` and `iconStyle()` functions
- Created shared utility module `src/lib/shared/utils/riskStyles.ts` with `ringColorMap`, `severityBadgeClass`, `dotColorClass`, `severityTextClass`, `severityLabelKey`, `barSeverity()`
- Created property tests: `src/lib/shared/utils/__tests__/i18n.test.ts`, `format.test.ts`, `reportStyles.test.ts`, `riskStyles.test.ts`
- Replaced inline `tx()` definitions across 21+ component files with shared import
- Replaced inline `formatSize()` in `FileListItemRisk.svelte`, `ProcessingFilesCard.svelte`, `FileResultsCard.svelte`
- Replaced inline `tagStyle()`/`iconStyle()` in `ReportTableRow.svelte`, `ReportCard.svelte`
- Replaced inline risk severity utilities in `RiskScannerCard.svelte`, `MobileRiskBanner.svelte`
- Renamed `MetadataField` to `ReportMetadataField` in `src/lib/types/report.ts` and updated all consuming imports
- Fixed `UserDropdown.svelte` accessibility: added `onSettings`/`onLogout` callback props with `onclick` handlers
- Fixed `appState.svelte.ts` reactivity: changed `_currentState` from `$derived` to `$derived.by()`
- Fixed `AuthNavbar.svelte` path resolution: wrapped `rightHref` with `resolve()` from `$app/paths`
- Fixed unused imports and passed lint/type/test verification
- Code review fixes applied: replaced inline `riskScoreLabel()` in `RiskScoreRing.svelte` with shared `tx()`, added `onSettings`/`onLogout` callbacks to `MobileHamburgerMenu.svelte`, imported `severityTextClass` in `RiskBreakdownBar.svelte`, removed unsupported DE/SK languages from `languageRepository.ts`, replaced `href="#"` with `<button>` in `RegisterFormSection.svelte`, declared `otpRef` with `$state()` in `CheckCodeFormSection.svelte`

## 2026-06-12 07:49 — ui-refactor
- Project: metacleaner-app

- Created `--shadow-focus-blue` theme token in `src/routes/layout.css` @theme block
- Replaced hardcoded `focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]` with `focus:shadow-focus-blue` in `src/lib/shared/elements/AuthTextInput.svelte` and `src/routes/(auth)/components/PasswordInput.svelte`
- Extracted `CountdownTimer` component to `src/routes/(auth)/components/CountdownTimer.svelte` (shared between check-code and check-email pages)
- Created `CountdownTimer.stories.svelte` co-located story
- Extracted `MetadataCategoryCard` component to `src/routes/sections/Step5Success/components/MetadataCategoryCard.svelte`
- Created `MetadataCategoryCard.stories.svelte` co-located story
- Extracted `MetadataFieldList` component to `src/routes/sections/Step5Success/components/MetadataFieldList.svelte`
- Created `MetadataFieldList.stories.svelte` co-located story
- Extracted `FileProcessingRow` component to `src/routes/sections/Step3Processing/components/FileProcessingRow.svelte`
- Created `FileProcessingRow.stories.svelte` co-located story
- Refactored `MetadataOverview` (419→~150 lines) to compose `MetadataCategoryCard` and `MetadataFieldList`
- Refactored `ProcessingFilesCard` (235→~80 lines) to compose `FileProcessingRow`
- Refactored `CheckCodeFormSection` to use shared `CountdownTimer` instead of inline countdown logic
- Refactored `CheckEmailContent` to use shared `CountdownTimer` instead of inline countdown logic
- Fixed Svelte 5 `state_referenced_locally` warning in `CountdownTimer`

## 2026-06-12 03:00 — ui-refactor
- Project: metacleaner-app

- Created `--color-navy-hover: #263347` theme token in `src/routes/layout.css` and replaced `hover:bg-[#263347]` with `hover:bg-navy-hover` in login and register pages
- Created `AuthTextInput` shared element in `src/lib/shared/elements/AuthTextInput.svelte` with co-located `AuthTextInput.stories.svelte`
- Created `SocialLoginButtons` component in `src/routes/(auth)/components/SocialLoginButtons.svelte` with co-located `SocialLoginButtons.stories.svelte`
- Created page-specific form sections: `LoginFormSection` (`src/routes/(auth)/login/sections/`), `RegisterFormSection` (`src/routes/(auth)/register/sections/`), `CheckEmailContent` (`src/routes/(auth)/check-email/sections/`), `ForgotPasswordFormSection` (`src/routes/(auth)/forgot-password/sections/`), `CheckCodeFormSection` (`src/routes/(auth)/check-code/sections/`), `NewPasswordFormSection` (`src/routes/(auth)/new-password/sections/`)
- Refactored all 6 auth pages (`login`, `register`, `check-email`, `forgot-password`, `check-code`, `new-password`) to compose sections — each page reduced to ≤80 lines
- Eliminated remaining duplicate code with extracted `TrustBadges` and `PasswordRecoveryProgressCards` shared auth components

## 2026-06-11 23:32 — ui-refactor
- Project: metacleaner-app

- Created theme tokens in `src/routes/layout.css`: `--color-brand-yellow`, `--color-page-gradient-blue`, `--color-page-gradient-green`, `--shadow-glow-green-strong`
- Replaced 172 hardcoded color hex/rgba values in auth pages with theme token references (`var(--color-*)` / Tailwind utilities)
- Replaced 7 hardcoded color values in `sections/Step4Error/` and `sections/Step3Processing/` / `Step5Success/` components
- Extracted shared auth elements to `src/routes/(auth)/components/`: PasswordInput, OtpInput, PasswordStrengthMeter, StepProgressBar
- Extracted shared auth components to `src/routes/(auth)/components/`: AuthNavbar, AuthFormCard, AuthStatsRow, AuthFeatureCard, AuthBranding, AuthMobileHero, AuthLayout
- Created Storybook stories for all 11 shared auth components (co-located `.stories.svelte` files)
- Refactored `(auth)/login/+page.svelte` — decomposed into AuthLayout, AuthNavbar, AuthBranding, AuthMobileHero, AuthFormCard, PasswordInput, AuthStatsRow, AuthFeatureCard
- Refactored `(auth)/register/+page.svelte` — decomposed into AuthLayout, AuthNavbar, AuthBranding, AuthMobileHero, AuthFormCard, PasswordInput, PasswordStrengthMeter, AuthStatsRow
- Refactored `(auth)/check-email/+page.svelte` — decomposed into AuthLayout, AuthNavbar, AuthBranding, AuthMobileHero, AuthFormCard, AuthStatsRow
- Refactored `(auth)/forgot-password/+page.svelte` — decomposed into AuthLayout, AuthNavbar, StepProgressBar, AuthFormCard, PasswordInput, PasswordStrengthMeter, OtpInput
- Refactored `(auth)/check-code/+page.svelte` — decomposed into AuthLayout, AuthNavbar, StepProgressBar, AuthFormCard, OtpInput
- Refactored `(auth)/new-password/+page.svelte` — decomposed into AuthLayout, AuthNavbar, StepProgressBar, AuthFormCard, PasswordInput, PasswordStrengthMeter
- Reduced total auth page code from ~3,677 lines to ~1,800 lines by eliminating duplication

## 2026-06-11 21:50 — data-refactor
- Project: metacleaner-app

- Extracted ~130 new i18n keys with `auth.*` prefix to `messages/en.json` and `messages/cs.json` covering 6 auth pages
- Created `src/lib/repositories/authRepository.ts` with `getAuthStats()` and `getAuthPlans()` mock data
- Refactored `src/routes/(auth)/login/+page.svelte` — replaced ~45 hardcoded Czech strings with `tx()` calls
- Refactored `src/routes/(auth)/register/+page.svelte` — replaced ~75 hardcoded Czech strings with `tx()` calls, wired stats and plans from authRepository
- Refactored `src/routes/(auth)/check-email/+page.svelte` — replaced ~40 hardcoded Czech strings with `tx()` calls, wired stats from authRepository
- Refactored `src/routes/(auth)/forgot-password/+page.svelte` — replaced ~55 hardcoded Czech strings with `tx()` calls
- Refactored `src/routes/(auth)/check-code/+page.svelte` — replaced ~55 hardcoded Czech strings with `tx()` calls
- Refactored `src/routes/(auth)/new-password/+page.svelte` — replaced ~50 hardcoded Czech strings with `tx()` calls
- Replaced hardcoded marketing stats (50K+, 2M+, 100%) in login, register, and check-email pages with `authRepository.getAuthStats()` calls
- Replaced hardcoded plan data (Free/Pro) in register page with `authRepository.getAuthPlans()` calls
- Fixed NavBar visibility on auth pages and verified locale setup

## 2026-06-11 17:23 — design-to-code
- Project: metacleaner-app

- Created Login page from `auth-login-form-desktop.html` / `auth-login-form-mobile.html` — route `/login`
- Created Registration page from `auth-registration-form-desktop.html` / `auth-registration-form-mobile.html` — route `/register`
- Created Check Email verification page from `auth-check-email-desktop.html` / `auth-check-email-mobile.html` — route `/check-email`
- Created Forgot Password page from `auth-forgot-password-desktop.html` / `auth-forgot-password-mobile.html` — route `/forgot-password`
- Created Check Code OTP verification page from `auth-check-code-desktop.html` / `auth-check-code-mobile.html` — route `/check-code`
- Created New Password page from `auth-new-password-desktop.html` / `auth-new-password-mobile.html` — route `/new-password`
- Wired navigation between all auth pages: Login ↔ Registration, Login → Forgot Password → Check Code → New Password → Login, Registration → Check Email

## 2026-06-11 12:05 — manual
- Project: metacleaner-app

- Updated frontend origin to port 3000 and adjusted `start-docker.sh`, `layout.css`, `riskAnalyzer.ts`, `FileListItemRisk.svelte`, `RiskScannerCard.svelte`, and i18n messages
- Added C2PA chunk counting and updated fields removed handling in `apiCleaningService.ts` processing results
- Fixed report links to use `reportId` instead of `jobId` in `ReportCard.svelte`, `ReportTableRow.svelte`, and `cleaningResultsStore.svelte.ts`; improved localization messages
- Fixed potential null values in metadata mapping functions in `apiCleaningService.ts`
- Enhanced job creation with optional file names in `metaCleanerApi.ts` and `apiCleaningService.ts`; improved report detail UI layout in `FileAccordionItem.svelte` and `MetadataTable.svelte`
- Simplified `createJob` function and related handlers in API client and cleaning service
- Improved layout and spacing in `FileAccordionItem` and `MetadataTable` components
- Updated icon in `ReportTableRow` and removed unused success badge component from `Step5Success`

## 2026-06-11 11:53 — manual
- Project: metacleaner-server
- Added C2PA chunk counting and fields-removed handling in pipeline.go
- Improved progress event handling with LocalID for files in pipeline and handlers
- Enhanced job creation with optional file names in handlers.go, then simplified createJob function
- Updated frontend origin to port 3000 in .env.example

## 2026-06-10 16:53 — create-code
- Project: metacleaner-app

- Spec: api-integration
- Implemented API client module (`src/lib/clients/metaCleanerApi.ts`) with `buildApiUrl`, `buildWsUrl`, `uploadFiles`, `createJob`, `getJobStatus`, `connectJobProgress`, `downloadFile`, `downloadJobZip`, `getReports`, `getReportDetail`, `getReportPdf`, `healthCheck`, and `ApiHttpError` class
- Implemented `ApiCleaningService` (`src/lib/services/apiCleaningService.ts`) with upload→job→WebSocket orchestration, `dispatchWsMessage` dispatcher with fileName resolution from local map, `buildProcessingResults` from accumulated `file_complete` events, `mapApiHttpError`/`makeConnectionError`/`makeNetworkError` error helpers, backend-to-frontend type mapping (`mapSingleReport`, `mapReportFileDetails`, `computeBarWidth`, `computeIconColor`, `extractDate`/`extractTime`, `mapMetadataDetail`)
- Implemented batch ZIP download endpoint (`HandleJobDownload`) in backend `handlers.go` at `GET /api/jobs/{id}/download`
- Removed mock layer (`src/lib/services/mockCleaningService.ts`) and wired `apiCleaningService` as sole `CleaningService` implementation (task 10)
- Added `PUBLIC_API_URL=http://localhost:8080` to `.env.example` and API configuration section to README
- Created property tests for API URL construction and WebSocket protocol derivation (task 1.2) in scanner `__tests__/`
- Created property tests for `analyzeFiles` aggregation and `fileNameMap` completeness (task 2.2)
- Created property tests for WebSocket message dispatch and `ProcessingResults` construction (task 2.4)
- Created property tests for HTTP error status code mapping (task 3.2)
- Created property tests for report summary type mapping (task 5.2)
- Created property tests for bar width percentage computation (task 5.4)
- Created unit tests for download error handling and report mapping integration (task 6.2)
- Fixed code review MEDIUM issues: addressed linting and structural concerns from API integration review
- Fixed `reportId` capture from WS `report_ready` events and split `jobId`/`reportId` in cleaning store
- Fixed WS close timing: delayed WebSocket close after `job_complete` to catch trailing `report_ready` message
- Removed 63 dead i18n keys from `en.json` and `cs.json` identified during i18n audit
- Updated `MEMORY.md` with i18n audit and WS close findings

## 2026-06-10 15:20 — manual
- Project: metacleaner-server
- Implemented batch ZIP download endpoint (handlers.go, router.go, errors.go) with tests
- Fixed pipeline test fixtures and exiftool script args

## 2026-06-10 14:03 — manual
- Project: metacleaner-server
- Improved metadata handling with privacy categorization and raw output support
- Generated meaningful download filenames with IMG_/VID_ prefix
- Removed iconColor field from report and related structures
- Renamed ID field to LocalID in FileRecord structure for clarity

## 2026-06-10 14:03 — manual
- Project: metacleaner-app

- Improved metadata handling in `imageParser.ts` and `videoParser.ts` with privacy categorization and raw metadata output
- Added new fields to scanner types (`src/lib/scanner/types.ts`) for privacy categories

## 2026-06-10T14:03 — manual
- Project: metacleaner-cli
- Improved metadata handling in `src/formatter.ts` with privacy categorization and raw metadata output support

## 2026-06-10T11:19 — manual
- Project: metacleaner-cli
- Added meaningful download filename generation with IMG_/VID_ prefix in `src/formatter.ts`
- Updated formatter tests in `tests/formatter.test.ts`

## 2026-06-07 13:38 — manual
- Project: metacleaner-app

- Created AI image detection module (`src/lib/scanner/aiDetector.ts`) with heuristic scoring for AI-generated image identification
- Integrated AI detection into image parsing logic in `imageParser.ts`
- Added AI origin scoring to risk analyzer (`riskAnalyzer.ts`) and scanner constants
- Updated `metadataParser.ts`, `videoParser.ts`, and `scannerStore.svelte.ts` to support AI origin score field
- Enhanced AI detection capabilities with additional metadata checks and expanded constants

## 2026-06-07T13:38 — manual
- Project: metacleaner-cli
- Added metadata scanner for image files (`scripts/check_metadata.py`) with AI detection capabilities
- Added AI image detection module and integrated into image parsing logic
- Added AI origin scoring to metadata processing (`src/types.ts`, `src/formatter.ts`)
- Enhanced AI detection with additional metadata checks in `scripts/check_metadata.py`

## 2026-06-07 07:50 — ui-tests
- Project: metacleaner-app

- No changes needed — all tests up to date

## 2026-06-07 03:43 — ui-tests
- Project: metacleaner-app

- No changes needed — all tests up to date

## 2026-06-07T01:50 — manual
- Project: metacleaner-cli
- Added Dockerfile for the CLI project
- Added `.gitignore` with build/dependency exclusions
- Updated `.agents/MEMORY.md` with project documentation

## 2026-06-07 01:30 — ui-tests
- Project: metacleaner-app

- Created Storybook story for `MobileBottomCta` component (states: WithButtonContent, WithTextContent) in `src/lib/shared/components/MobileBottomCta.stories.svelte`
- Removed orphaned E2E test in `navigation.spec.ts:190` — `/report` redirect assertion no longer valid
- Fixed `report-detail.spec.ts` (30 failures) — aligned `navigateToReportDetail()` helper with in-memory mock service data
- Fixed `hamburger-menu.spec.ts` report detail tests (6 failures) — same root cause as report-detail
- Fixed `navigation.spec.ts` report detail tests (2 failures) — updated assertions to match mock service reportId
- Fixed `responsive.spec.ts` report detail tests (4 failures) — aligned with in-memory mock service
- Fixed `step5-results.spec.ts:160` (1 failure) — resolved strict mode violation for mobile upload button selector

## 2026-06-06T23:46 — create-code
- Project: metacleaner-cli
- Spec: metadata-inspect-cli
- Implemented CLI entry point with manual argument parsing (`src/index.ts`) — parses commands (scan, clean, compare, help, version) and global flags (--server, --json, --verbose, --quiet, --output, --timeout, --version)
- Implemented command router and handlers (`src/commands.ts`) — routes to scan, clean, compare, help, version commands
- Implemented file adapter and scanner module (`src/scanner.ts`) — creates File objects from disk paths, delegates to frontend scanner via bun workspace link
- Implemented server client module (`src/serverClient.ts`) — HTTP client for backend API (upload, job creation, polling, download)
- Implemented output formatter (`src/formatter.ts`) — human-readable and JSON output with emoji indicators, category grouping, risk scores, before/after comparison
- Implemented progress indicator (`src/progress.ts`) — stderr spinner with elapsed time for server operations
- Implemented CLI types (`src/types.ts`) — CLIOptions, CommandResult, FileResult interfaces
- Created project structure with package.json, tsconfig.json, .env.example, README.md, vitest.config.ts
- Created property tests for scanner (`tests/scanner.test.ts`) — extension detection, file adapter createFileFromPath
- Created property tests for formatter (`tests/formatter.test.ts`) — category grouping, score/severity display, conditional metadata display, aggregation summary, default cleaned file path, clean formatter, compare formatter, JSON round-trip, JSON multi-file structure, quiet mode format
- Created property tests for progress indicator (`tests/progress.test.ts`)
- Created unit tests for server client (`tests/serverClient.test.ts`)
- Created unit tests for command handlers (`tests/commands.test.ts`)
- Fixed code review findings: added vitest.config.ts with coverage settings, improved error handling in commands.ts with proper cleanup for compare failures, added input validation in scanner.ts, fixed formatter.ts string interpolation, added package description in package.json, documented backend service standards exception in README.md

## 2026-06-06 20:47 — create-code
- Project: metacleaner-app

- Spec: design-alignment
- Implemented SPA state machine (`src/lib/stores/appState.svelte.ts`) with `idle`, `files-ready`, `processing`, `error`, `success` states and reactive transitions
- Implemented mock cleaning service layer (`src/lib/services/mockCleaningService.ts`) with simulated delays, progress updates, error scenarios, and mock report generation
- Added CSS animations to `layout.css`: `fadeInUp`, `spin-slow`, `pulse-ring`, `checkPop`, `shake`, `border-dance`
- Updated `NavBar` — removed `mobileStyle` prop, added `showBackButton`/`backHref`/`backLabel` props, hamburger menu always on mobile
- Created `MobileBottomCta` shared component (`src/lib/shared/components/MobileBottomCta.svelte`)
- Updated `UploadZoneCard` — dual state (full drop zone / compact "add more"), file type/size validation (max 500 MB), drag-over highlight
- Updated `FileListCard` — per-file remove button, 5 file row states (completed/in-progress/waiting/failed/skipped)
- Created Step 1 idle section (`src/routes/sections/Step1Idle/`) with `StatusCardIdle`
- Created Step 2 files-ready section (`src/routes/sections/Step2FilesReady/`) with `RiskScannerCard`, `MobileRiskBanner`
- Created Step 3 processing section (`src/routes/sections/Step3Processing/`) with `ProcessingFilesCard`, `ProcessingStatusCard`, mobile components
- Created Step 4 error section (`src/routes/sections/Step4Error/`) with `ErrorBanner`, `ErrorFilesCard`, `ErrorStateCard`, mobile accordions
- Created Step 5 success section (`src/routes/sections/Step5Success/`) with `SuccessHeader`, `MetadataOverview`, `FileResultsCard`
- Rewrote `src/routes/+page.svelte` as SPA state dispatcher (no route navigation for state transitions)
- Updated `/reports` page — desktop table layout, mobile card layout, filter/search bar, stat cards
- Updated `/report` page — chart section, per-file accordion with GPS/EXIF/XMP tables, PDF download/print buttons
- Wired `scannerStore` to file upload flow in `UploadZoneCard`
- Deleted old step routes (`step2/`, `step3/`, `step4/`, `step5/`) and removed dead code
- Added all new i18n keys to `messages/en.json` and `messages/cs.json`
- Created component tests (Vitest): NavBar, UploadZoneCard, FileListCard, Step3Processing, Step4Error, Step5Success, appState store transitions (`src/lib/stores/__tests__/appState.test.ts`)
- Created E2E tests (Playwright): step1→step2 transition, file validation, file removal, full flow step2→3→5, cancel (Zastavit), error flow, report navigation, reports page, mobile hamburger menu, updated existing E2E tests (272 passing)
- Fixed CRITICAL code review: removed dead `src/lib/api/client.ts` (247 lines), replaced hardcoded English strings in Step4Error log with `tx()` calls
- Fixed HIGH code review: wired `step2.meta.title` i18n key to page title, replaced hardcoded error fallbacks with `tx('common.error')`
- Fixed MEDIUM code review: removed duplicate file size validation from `scannerStore` (UploadZoneCard is single source of truth), removed unused `BottomSheet` and `FileListItem` components, added `.dockerignore`, added empty file list guard in `Step3Processing` onMount, added onMount cleanup return in `Step3Processing`, translated `step2.risk.score` to Czech
- Fixed LOW code review: replaced `?? 'Risk Score'` fallback in `RiskScoreRing` with `tx()` pattern, added download error toast in `Step5Success`, documented error-\* filename convention in README, added code comment on `BeforeAfterScore afterScore={0}` in `RiskScannerCard`
- Updated `mockCleaningService.ts` with improved mock data generation
- Updated `MEMORY.md` with code review patterns and conventions

## 2026-06-06 09:02 — ui-tests
- Project: metacleaner-app

- No changes needed — all tests up to date

## 2026-06-06 07:16 — ui-tests
- Project: metacleaner-app

- Removed orphaned Storybook demo stories: `src/stories/Button.stories.svelte`, `src/stories/Header.stories.svelte`, `src/stories/Page.stories.svelte`
- Removed orphaned Storybook demo components and assets from `src/stories/`
- Created Storybook story for `MobileHamburgerMenu` component (states: Closed, Open, WithBackButton, OpenWithBackButton, NoUser)
- Created Storybook story for `FileListItemRisk` component (states: LowRisk, MediumRisk, HighRisk, +3 more)
- Created Storybook story for `ScanProgressIndicator` component (states: Idle, Scanning, Complete, Error)
- Set up Playwright E2E framework with `playwright.config.ts` and `e2e/` directory
- Created `e2e/helpers/mock-api.ts` with route handler utilities for mocking API endpoints
- Created E2E test `e2e/step1-upload.spec.ts` for Step 1 upload page
- Created E2E test `e2e/step2-risk-analysis.spec.ts` for Step 2 risk analysis page
- Created E2E test `e2e/step3-processing.spec.ts` for Step 3 processing page
- Created E2E test `e2e/step4-error.spec.ts` for Step 4 error page
- Created E2E test `e2e/step5-results.spec.ts` for Step 5 results page
- Created E2E test `e2e/reports.spec.ts` for Reports page
- Created E2E test `e2e/report-detail.spec.ts` for Report Detail page
- Created E2E test `e2e/navigation.spec.ts` for cross-page navigation flows
- Created E2E test `e2e/responsive.spec.ts` for responsive layout verification
- All 212 Storybook stories pass; 189 E2E tests created but cannot run in current environment (missing Chromium system libs)

## 2026-06-06 00:25 — manual
- Project: metacleaner-server
- Updated documentation with architectural diagrams and improved section structure
- Renamed src directory to source and updated all imports accordingly
- Restructured project to support new command structure and improved code organization

## 2026-06-05 23:30 — manual
- Project: metacleaner-server
- Reorganized backend source files and updated Docker configuration

## 2026-06-05 23:30 — manual
- Project: metacleaner-app

- Updated `.agents/MEMORY.md` with code review findings on WebSocket and state handling issues
- Documented `$state<Date>` lint error workaround (use `$state<number>` with `Date.now()` instead)
- Documented `cleaningStore` file_error handler mapping to wrong statuses
- Documented step5 `FileResultsCard` receiving empty `fileResults` from cleaningStore
- Documented WebSocket disconnect being immediately treated as fatal error instead of attempting reconnect/polling
- Documented `PUBLIC_API_URL` baking as empty in Docker production builds
- Documented missing i18n keys for step3 upload phase and report detail page
- Documented WebSocket polling fallback 30s timeout being too aggressive for large file batches

## 2026-06-05 18:07 — create-code
- Project: metacleaner-app

- Spec: metacleaner-backend
- Implemented Go backend service in `backend/metacleaner-server/`
- Implemented configuration loading (`config.go`) with env var parsing and defaults
- Implemented error types and JSON response helpers (`errors.go`)
- Implemented data models, DTOs, file validation, tool selection (`models.go`)
- Implemented Supabase client with PostgREST CRUD and Storage upload (`supabase.go`)
- Implemented file upload handler with multipart parsing and temp storage (`handlers.go`)
- Implemented metadata cleaning pipeline using ExifTool/FFmpeg subprocesses (`pipeline.go`)
- Implemented WebSocket progress handler for real-time job updates (`websocket.go`)
- Implemented job creation and orchestration endpoint (`handlers.go`)
- Implemented file download handler with expiration checks (`handlers.go`)
- Implemented report generation and PDF creation (`pdf.go`, `handlers.go`)
- Implemented cleanup scheduler for expired temp files (`cleanup.go`)
- Implemented health endpoint and startup validation (`main.go`)
- Implemented CORS middleware, rate limiter, and HTTP router (`router.go`)
- Implemented SQL database migration script (`scripts/migration.sql`)
- Implemented Dockerfile, `fly.toml`, `start-docker.sh`, `fly-setup.sh` for deployment
- Created `README.md` and `DOCS.md` documentation
- Created property tests for error response format (`tests/errors_test.go`)
- Created property tests for file size/format validation, tool selection, job progress, report summary (`tests/models_test.go`)
- Created pipeline unit tests (`pipeline_test.go`, `tests/pipeline_test.go`)
- Created upload handler tests (`handlers_test.go`)
- Created job handler tests (`handlers_jobs_test.go`)
- Created download handler tests (`handlers_download_test.go`)
- Created report handler tests (`handlers_reports_test.go`)
- Created cleanup scheduler tests (`cleanup_test.go`)
- Code review identified: PUBLIC_API_URL baked empty at Docker build time, no file download expiration UX, step2 page not implemented, missing i18n keys, aggressive WebSocket polling timeout

## 2026-06-05 16:54 — manual
- Project: metacleaner-server
- Added README.md and DOCS.md for metacleaner backend
- Added deployment files (Dockerfile, fly.toml, start-docker.sh, fly-setup.sh)
- Added SQL database migration script for Supabase schema setup

## 2026-06-05 16:45 — manual
- Project: metacleaner-server
- Implemented CORS middleware, rate limiter, and HTTP router (task 14)
- Implemented health endpoint and startup validation (task 13)
- Implemented cleanup scheduler (task 12)
- Implemented report generation and PDF creation (task 11)
- Implemented file download handler (task 10)
- Implemented job creation and orchestration (task 8)
- Implemented WebSocket progress handler (task 7)
- Implemented cleaning pipeline (task 6)
- Implemented file upload handler (task 5)
- Implemented Supabase client (task 3)
- Implemented data models and property tests (task 2)
- Initialized metacleaner-server Go backend (task 1)

## 2026-06-05 15:09 — from-brief
- Project: metacleaner-app

- Brief: BRIEF.md
- Added package manager detection logic to `sync-android.sh` (checks `command -v bun`, sets `RUN_CMD`/`EXEC_CMD` variables to bun/bunx or npm/npx)
- Replaced hardcoded `bun run build` with `$RUN_CMD run build` and `bunx cap sync android` with `$EXEC_CMD cap sync android` in `sync-android.sh`

## 2026-06-05 14:28 — check-build
- Project: metacleaner-app

- Fixed formatting in 17 files (scanner module, Svelte components, agents docs) via prettier
- Fixed test script to run only server-side tests by default (browser tests require system libs unavailable without sudo)
- Added `test:browser` script for Playwright browser/Storybook tests
- Updated README: added Prerequisites section with bun install instructions, removed reference to non-existent `.env.example`, documented browser test setup requirement

## 2026-06-05 13:14 — create-code
- Project: metacleaner-app

- Spec: client-side-risk-scanner
- Implemented scanner module types and constants (`src/lib/scanner/types.ts`, `src/lib/scanner/constants.ts`)
- Implemented risk analyzer with `computeFileScore()`, `computeAggregatedRisk()`, `classifySeverity()` in `src/lib/scanner/riskAnalyzer.ts`
- Implemented format detector (`src/lib/scanner/parsers/formatDetector.ts`) supporting 8 image + 11 video formats
- Implemented image parser (`src/lib/scanner/parsers/imageParser.ts`) using exifr (JPEG/HEIC/PNG/AVIF/TIFF/DNG) and ExifReader (WebP/GIF)
- Implemented video parser (`src/lib/scanner/parsers/videoParser.ts`) with lazy mediainfo.js WASM loading
- Implemented metadata parser orchestrator (`src/lib/scanner/metadataParser.ts`) with error handling and large file optimization
- Implemented reactive scanner store (`src/lib/scanner/scannerStore.svelte.ts`) with Svelte 5 runes, sequential file processing, and aggregated risk computation
- Created unified upload + risk scanner page at `/` route (`src/routes/+page.svelte`) — merged step1 and step2 into single page
- Created `RiskScannerCard.svelte`, `FileListCard.svelte`, `MobileRiskBanner.svelte` sections in `src/routes/(step1)/sections/`
- Relocated `RiskScoreRing.svelte`, `RiskBreakdownBar.svelte`, `BeforeAfterScore.svelte`, `FileListItemRisk.svelte` to `src/routes/(step1)/components/`
- Created `ScanProgressIndicator.svelte` component for per-file scanning state display
- Updated `UploadZoneCard.svelte` to integrate with scannerStore (`addFiles`, `removeFile`)
- Connected step3 to scannerStore for file queue handoff
- Created property-based tests (fast-check) for risk analyzer: `src/lib/scanner/__tests__/riskAnalyzer.test.ts` (Properties 1–5)
- Created parser tests: `src/lib/scanner/__tests__/metadataParser.test.ts` (Properties 6–8)
- Created scanner store unit tests: `src/lib/scanner/__tests__/scannerStore.test.ts`
- Created integration tests: `src/lib/scanner/__tests__/scanPipeline.test.ts`
- Fixed CRITICAL code review findings: route guard, error handling improvements
- Fixed HIGH code review findings: step3 scannerStore connection, mobile remove button
- Fixed MEDIUM code review findings: lint errors, unused params/imports, QueuedFile migration patterns
- Updated `MEMORY.md` with route guard and QueuedFile migration patterns
- All 40 server tests pass, clean build and lint

## 2026-06-05 11:13 — manual
- Project: metacleaner-app

- Added Android back button handling with Capacitor `@capacitor/app` plugin in `src/routes/+layout.svelte`
- Created `sync-android.sh` script for Android project deployment and set executable permissions
- Updated `README.md` with project description and setup instructions
- Added `@capacitor/app` dependency to `package.json`

## 2026-06-05 10:56 — manual
- Project: metacleaner-app

- Updated language flag representation in `languageRepository.ts` from emoji to SVG image paths
- Added flag SVG files (`cs.svg`, `de.svg`, `en.svg`, `sk.svg`) to `static/flags/`
- Updated `LanguageDropdown.svelte`, `MobileHamburgerMenu.svelte`, and `NavBar.svelte` to render SVG flags

## 2026-06-05 10:18 — manual
- Project: metacleaner-app

- Added architectural and convention guidelines in `.kiro/steering/metacleaner-frontend.md`
- Added `CLAUDE.md` with project context for AI assistants
- Added `prettier-plugin-tailwindcss` dependency to `package.json`

## 2026-06-05 07:31 — check-build
- Project: metacleaner-app

- Resolved all build and lint errors for clean first-checkout experience
- Ran prettier on 143 files to fix formatting
- Fixed 112 ESLint errors: replaced bare `locale.current;` with `void locale.current;` in ~50 files, added keys to all `{#each}` blocks, wrapped hrefs with `resolve()` from `$app/paths`, used `Pathname` type for dynamic hrefs
- Added `storybook.configs['flat/recommended']` to ESLint config
- Removed unused snippets, variables, and imports across multiple components and stories
- Added `tabindex="0"` to `ToggleSwitch` for accessibility compliance
- Updated `README.md` with bun-based setup and Playwright install steps
- Created `.agents/MEMORY.md` documenting non-obvious build issues for future agents

## 2026-06-05 06:47 — ui-refactor
- Project: metacleaner-app

- Added theme tokens `--shadow-drop-red`, `--color-navy-lighter-50`, `--color-navy-lighter-60` to `src/routes/layout.css` @theme block
- Replaced inline `rgba(239,68,68,0.6)` in step2 SVG with `--shadow-drop-red` token
- Replaced inline `rgba(30,41,59,0.5/0.6)` in reports `<style>` block with `--color-navy-lighter-50`/`--color-navy-lighter-60` tokens
- Refactored `src/routes/+layout.svelte` to include NavBar with shared state (user, langOptions, locale switching)
- Removed duplicated NavBar markup and shared state from all 7 pages: `+page.svelte` (Step 1), `step2/+page.svelte`, `step3/+page.svelte`, `step4/+page.svelte`, `step5/+page.svelte`, `reports/+page.svelte`, `report/+page.svelte`
- Refactored `src/routes/+page.svelte` (Step 1) to compose UploadZoneCard, StatusCard, OptionsSheet, UpgradeSheet from `(step1)/sections/`
- Refactored `src/routes/step2/+page.svelte` to compose RiskScannerCard, MobileRiskBanner, FileListCard from `step2/sections/`
- Refactored `src/routes/step3/+page.svelte` to compose ProcessingStatusCard, MobileStatusCard, ProcessingFilesCard, ActivityLogAccordion from `step3/sections/`
- Refactored `src/routes/step4/+page.svelte` to compose ErrorBanner, ErrorFilesCard, ErrorStateCard, MobileErrorVisual, ErrorDetailAccordion, ErrorTypeAccordion, ErrorLogAccordion from `step4/sections/`
- Refactored `src/routes/step5/+page.svelte` to compose SuccessHeader, MetadataOverview, FileResultsCard from `step5/sections/`
- Refactored `src/routes/reports/+page.svelte` to compose SummaryStatsRow, ReportsHeader, FiltersBar, MobileFilters, ReportsTable, ReportsList from sections
- Refactored `src/routes/report/+page.svelte` to compose ReportDetailHeader, ReportChartCard, FileAccordionList from `report/sections/`
- Created stories: `FileListItemRisk.stories.svelte`, `RiskBreakdownBar.stories.svelte`, `BeforeAfterScore.stories.svelte` in `src/routes/step2/components/`
- Created stories: `ErrorDetailBox.stories.svelte`, `ErrorTypeSelector.stories.svelte` in `src/routes/step4/components/`
- Created stories: `MetadataPanel.stories.svelte` in `src/routes/step5/components/`
- Created stories: `FilterPill.stories.svelte`, `ReportTableRow.stories.svelte`, `ReportCard.stories.svelte` in `src/routes/reports/components/`
- Created stories: `ChartBar.stories.svelte`, `MetadataTable.stories.svelte`, `FileAccordionItem.stories.svelte` in `src/routes/report/components/`
- Verified build passes with zero errors (`npm run build`)
- Verified Storybook builds with zero errors (`npm run build-storybook`)

## 2026-06-05 00:50 — ui-refactor
- Project: metacleaner-app

- Extended `@theme` block in `src/routes/layout.css` with missing tokens (gray-700, border-radius vars, glow shadows)
- Replaced all inline `style="color:#ef4444"`, `style="background:rgba(...)"`, and `style="border:..."` with Tailwind theme utility classes
- Replaced hardcoded hex colors in `<style>` blocks and SVG attributes with CSS custom properties from theme
- Created shared elements in `src/lib/shared/elements/`: Button, Badge, Card, IconContainer, ProgressBar, ToggleSwitch, Chip, AccordionCard
- Created shared components in `src/lib/shared/components/`: NavBar, LanguageDropdown, UserDropdown, MobileHamburgerMenu, BottomSheet, PageHeader, FileListItem, StatCard, ActivityLog, Toast
- Created shared section in `src/lib/shared/sections/`: SummaryStatsRow
- Created Step 1 page-specific components in `src/routes/(step1)/`: DropZone, UploadZoneCard, StatusCard, OptionsSheet, UpgradeSheet
- Created Step 2 page-specific components in `src/routes/step2/`: RiskScoreRing, RiskBreakdownBar, BeforeAfterScore, RiskScannerCard, MobileRiskBanner, FileListCard
- Created Step 3 page-specific components in `src/routes/step3/`: ProcessingVisual, FileItemProcessing, ProcessingFilesCard, ProcessingStatusCard, MobileStatusCard, ActivityLogAccordion
- Created Step 4 page-specific components in `src/routes/step4/`: ErrorVisual, ErrorDetailBox, ErrorTypeSelector, ErrorBanner, ErrorFilesCard, ErrorStateCard, MobileErrorVisual, ErrorDetailAccordion, ErrorTypeAccordion, ErrorLogAccordion
- Created Step 5 page-specific components in `src/routes/step5/`: MetadataPanel, SuccessHeader, MetadataOverview, FileResultItem, FileResultsCard
- Created Reports page-specific components in `src/routes/reports/`: FilterPill, ReportTableRow, ReportCard, ReportsHeader, FiltersBar, MobileFilters, ReportsTable, ReportsList
- Created Report Detail page-specific components in `src/routes/report/`: ChartBar, MetadataTable, FileAccordionItem, ReportDetailHeader, ReportChartCard, FileAccordionList
- Created stories for all shared elements: Button, Badge, Card, IconContainer, ProgressBar, ToggleSwitch, Chip, AccordionCard
- Created stories for shared components: NavBar, LanguageDropdown, UserDropdown, BottomSheet, PageHeader, FileListItem, StatCard, ActivityLog, Toast
- Created stories for page-specific components: DropZone, RiskScoreRing, ProcessingVisual, ErrorVisual, FileItemProcessing, FileResultItem

## 2026-06-04 16:26 — data-refactor
- Project: metacleaner-app

- Extracted ~200 i18n keys per locale from 7 pages (step1–step5, reports, report) into `messages/en.json` and `messages/cs.json` using Paraglide
- Created translation files: `messages/en.json` (200+ keys), `messages/cs.json` (200+ keys)
- Created repositories: `userRepository.ts`, `languageRepository.ts`, `fileRepository.ts`, `processingRepository.ts`, `reportRepository.ts` in `src/lib/repositories/`
- Refactored `src/routes/+page.svelte` (Step 1) — connected to userRepo, langRepo, replaced ~55 hardcoded strings
- Refactored `src/routes/step2/+page.svelte` — connected to fileRepo, replaced ~65 strings, converted file list to `{#each}` loop from fileRepository
- Refactored `src/routes/step3/+page.svelte` — connected to processingRepo, fileRepo, replaced ~50 strings
- Refactored `src/routes/step4/+page.svelte` — connected to processingRepo, fileRepo, replaced ~60 strings
- Refactored `src/routes/step5/+page.svelte` — connected to processingRepo, fileRepo, replaced ~55 strings
- Refactored `src/routes/reports/+page.svelte` — connected to reportRepo, replaced ~40 strings
- Refactored `src/routes/report/+page.svelte` — connected to reportRepository.getReportDetail() and userRepository.getCurrentUser(), replaced ~45 strings, rendered charts and file metadata via `{#each}` loops
- Added parameterized key `report.header.generatedDesc` to both locale files
- Configured locale switching with localStorage persistence via `src/lib/locale.svelte.ts`
- Added language switcher to report page nav bar

## 2026-06-04 12:26 — design-to-code
- Project: metacleaner-app

- Created Step 1 — Upload (Idle State) page from `MetacleanerApp-step1-desktop.html` / `MetacleanerApp-step1-mobile.html`
- Created Step 2 — Files Loaded (Risk Scanner) page from `MetacleanerApp-step2-desktop.html` / `MetacleanerApp-step2-mobile.html`
- Created Step 3 — Processing page from `MetacleanerApp-step3-desktop.html` / `MetacleanerApp-step3-mobile.html`
- Created Step 4 — Error State page from `MetacleanerApp-step4-desktop.html` / `MetacleanerApp-step4-mobile.html`
- Created Step 5 — Success/Results page from `MetacleanerApp-step5-desktop.html` / `MetacleanerApp-step5-mobile.html`
- Created Report List (History) page from `MetacleanerApp-reportlist-desktop.html` / `MetacleanerApp-reportlist-mobile.html`
- Created Report Detail page from `MetacleanerApp-report-desktop.html` / `MetacleanerApp-report-mobile.html`
- Wired navigation between all pages: Step 1→2→3→5 (success flow), Step 3→4 (error flow), Step 5→Report Detail/List, Report List→Report Detail, Report List→Step 1, Report Detail→Step 5

