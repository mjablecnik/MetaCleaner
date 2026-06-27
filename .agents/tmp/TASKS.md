# TASKS.md — MetaCleaner Monitoring i18n + Repository Refactor

## Phase 1 — Setup i18n infrastructure

- [x] 1. [HIGH] Create `src/lib/i18n.ts` with `t()` helper function wrapping Paraglide messages (same pattern as metacleaner-app `tx()`)
- [x] 2. [HIGH] Create `src/lib/locale.svelte.ts` with reactive locale state, `initLocale()`, and localStorage persistence
- [x] 3. [HIGH] Populate `messages/en.json` with all common keys (`common.*`, `layout.*`) — time ranges, statuses, actions, pagination labels
- [x] 4. [HIGH] Populate `messages/cs.json` with Czech translations for all common keys

## Phase 2 — Create repository/data layer

- [x] 5. [HIGH] Create `src/lib/repositories/navigationRepository.ts` — sidebar nav sections with labels and icons
- [x] 6. [HIGH] Create `src/lib/repositories/dashboardRepository.ts` — quick stats (uptime, error rate, DB health), alert/incident items
- [x] 7. [HIGH] Create `src/lib/repositories/availabilityRepository.ts` — service uptime cards, health checks, incidents, SLA data
- [x] 8. [HIGH] Create `src/lib/repositories/errorsRepository.ts` — error KPIs, error type breakdown, top endpoints, error log entries
- [x] 9. [HIGH] Create `src/lib/repositories/databaseRepository.ts` — connection stats, query latency, storage, slowest queries, table sizes, DB error log
- [x] 10. [HIGH] Create `src/lib/repositories/runtimeRepository.ts` — CPU/RAM stats, instances, deploy history, runtime error log
- [x] 11. [HIGH] Create `src/lib/repositories/edgeRepository.ts` — cache stats, requests, bandwidth, threats, TTFB regions, cache rules, WAF log
- [x] 12. [HIGH] Create `src/lib/repositories/performanceRepository.ts` — Apdex, response times, slowest endpoints, Core Web Vitals, event log
- [x] 13. [HIGH] Create `src/lib/repositories/securityRepository.ts` — threat score, failed logins, blocked IPs, attack types, active threats, security event log
- [x] 14. [HIGH] Create `src/lib/repositories/businessRepository.ts` — MRR/ARR, user counts, churn, funnel, OKR goals, revenue geo, chart data
- [x] 15. [HIGH] Create `src/lib/repositories/usersRepository.ts` — user stats, user list with typed User interface, chart data
- [x] 16. [HIGH] Create `src/lib/repositories/index.ts` — barrel export of all repositories

## Phase 3 — Extract static UI strings to i18n

- [x] 17. [MEDIUM] Extract hardcoded strings from `src/routes/+layout.svelte` to translation keys — 14 strings (nav labels, settings, aria-labels)
- [x] 18. [MEDIUM] Extract hardcoded strings from `src/routes/+page.svelte` (Dashboard) to translation keys — ~40 strings (header, stats, chart titles, alerts section, select options)
- [x] 19. [MEDIUM] Extract hardcoded strings from `src/routes/dostupnost/+page.svelte` (Availability) to translation keys — ~107 strings (header, service cards, health checks, timeline, incidents, SLA)
- [x] 20. [MEDIUM] Extract hardcoded strings from `src/routes/chyby/+page.svelte` (Errors) to translation keys — ~44 strings (header, KPI cards, chart titles, breakdown, log section)
- [x] 21. [MEDIUM] Extract hardcoded strings from `src/routes/databaze/+page.svelte` (Database) to translation keys — ~82 strings (header, stats, charts, queries, table sizes, error log)
- [ ] 22. [MEDIUM] Extract hardcoded strings from `src/routes/runtime/+page.svelte` (Runtime) to translation keys — ~80 strings (header, stats, charts, instances, deploys, errors)
- [ ] 23. [MEDIUM] Extract hardcoded strings from `src/routes/edge/+page.svelte` (Edge) to translation keys — ~86 strings (header, stats, charts, TTFB, cache rules, WAF log)
- [ ] 24. [MEDIUM] Extract hardcoded strings from `src/routes/performance/+page.svelte` (Performance) to translation keys — ~115 strings (header, stats, charts, endpoints, CWV, event log)
- [ ] 25. [MEDIUM] Extract hardcoded strings from `src/routes/security/+page.svelte` (Security) to translation keys — ~148 strings (header, stats, charts, threats, blocked IPs, event log)
- [ ] 26. [MEDIUM] Extract hardcoded strings from `src/routes/business/+page.svelte` (Business) to translation keys — ~143 strings (header, KPIs, charts, stats, funnel, OKR goals)
- [ ] 27. [MEDIUM] Extract hardcoded strings from `src/routes/uzivatele/+page.svelte` (Users) to translation keys — ~57 strings (header, stats, tabs, table headers, pagination)

## Phase 4 — Replace API data with repository calls

- [ ] 28. [MEDIUM] Replace hardcoded nav data in `+layout.svelte` with `navigationRepository` calls
- [ ] 29. [MEDIUM] Replace hardcoded data in `+page.svelte` (Dashboard) with `dashboardRepository` calls — stat values, alert items
- [ ] 30. [MEDIUM] Replace hardcoded data in `dostupnost/+page.svelte` with `availabilityRepository` calls — service cards, health checks, incidents, SLA
- [ ] 31. [MEDIUM] Replace hardcoded data in `chyby/+page.svelte` with `errorsRepository` calls — KPI values, breakdown items, top endpoints, error log
- [ ] 32. [MEDIUM] Replace hardcoded data in `databaze/+page.svelte` with `databaseRepository` calls — connection stats, queries, table sizes, error log
- [ ] 33. [MEDIUM] Replace hardcoded data in `runtime/+page.svelte` with `runtimeRepository` calls — stats, instances, deploy history, errors
- [ ] 34. [MEDIUM] Replace hardcoded data in `edge/+page.svelte` with `edgeRepository` calls — cache stats, TTFB regions, cache rules, WAF log
- [ ] 35. [MEDIUM] Replace hardcoded data in `performance/+page.svelte` with `performanceRepository` calls — stats, endpoints, CWV, event log
- [ ] 36. [MEDIUM] Replace hardcoded data in `security/+page.svelte` with `securityRepository` calls — stats, threats, blocked IPs, event log
- [ ] 37. [MEDIUM] Replace hardcoded data in `business/+page.svelte` with `businessRepository` calls — KPIs, chart data, funnel, OKR goals
- [ ] 38. [MEDIUM] Replace hardcoded data in `uzivatele/+page.svelte` with `usersRepository` calls — user stats, user list, chart data

## Phase 5 — Language switching

- [ ] 39. [MEDIUM] Create `src/lib/components/LanguageSwitcher.svelte` component (EN/CS toggle with flag icons)
- [ ] 40. [MEDIUM] Add LanguageSwitcher to desktop sidebar and mobile drawer in `+layout.svelte`

## Final

- [ ] 41. [LOW] Verify all strings are translated, no hardcoded user-facing text remains, language switching works, and build passes cleanly
