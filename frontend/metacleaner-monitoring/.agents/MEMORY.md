# Memory

## dashboardAlerts: negative resolvedIds check fails with duplicate issue IDs
- Project: metacleaner-monitoring
- Problem: Property test `'only unresolved Sentry issues appear'` used `expect(resolvedIds.has(alert.id)).toBe(false)` to verify resolved issues don't appear. When fast-check generates two issues with the same `id` (one `unresolved`, one `resolved`), the unresolved issue's alert appears in `resolvedIds`, causing a false failure.
- Solution: Replace with a positive assertion: build `unresolvedIds` from issues with `status === 'unresolved'` and check `expect(unresolvedIds.has(alert.id)).toBe(true)`. Unambiguous even with duplicate IDs.
- Source: create-tests, 2026-06-30

## Auth guard: redirect() in SvelteKit 2 does not require throw
- Project: metacleaner-monitoring
- Problem: In SvelteKit 2, `redirect()` is called without `throw` — calling `throw redirect(...)` still works but is deprecated; the function itself throws internally. Both forms work in practice but the non-throw form is preferred.
- Solution: Used `redirect(303, '/login')` without throw in both hooks.server.ts and login/+page.server.ts.
- Source: security-audit, 2026-06-30

## SectionErrorCard message prop: make optional when removing display
- Project: metacleaner-monitoring
- Problem: When removing the `{#if message}` block from SectionErrorCard, the `message` prop remained in the Props interface and `$props()` destructuring. Removing it from destructuring but making it optional in the interface preserves backwards compatibility with existing callers that still pass `message={...}`.
- Solution: Changed `message: string` → `message?: string` in Props interface and removed `message` from the `$props()` destructuring. All existing callers continue to work without changes.
- Source: security-audit, 2026-06-30

## SvelteKit sequence() requires request store — must be mocked in unit tests
- Project: metacleaner-monitoring
- Problem: `sequence()` from `@sveltejs/kit/hooks` calls `get_request_store()` internally, which throws "Could not get the request store" when called outside a real SvelteKit request context. This makes `handle` (exported from `hooks.server.ts`) untestable with the real `sequence`.
- Solution: Mock `@sveltejs/kit/hooks` with a simple chaining implementation: `sequence: (...handlers) => ({ event, resolve }) => { function applyHandle(i, evt) { if (i >= handlers.length) return resolve(evt); return handlers[i]({ event: evt, resolve: (e) => applyHandle(i+1, e) }); } return applyHandle(0, event); }`. Import hooks.server.ts AFTER this mock is declared.
- Source: create-tests, 2026-06-30

## fetchWithTimeout abort test: attach rejection handler before advancing fake timers
- Project: metacleaner-monitoring
- Problem: In tests for `fetchWithTimeout` timeout behavior, calling `await vi.advanceTimersByTimeAsync()` before `expect(promise).rejects...` causes an unhandled rejection warning. The timer fires, the signal aborts, fetch rejects, and `resultPromise` rejects — but no handler is attached yet because we're still awaiting the `advanceTimers` call.
- Solution: Attach the assertion BEFORE advancing time: `const assertion = expect(resultPromise).rejects.toMatchObject(...); vi.advanceTimersByTime(ms); await assertion;`. This ensures the rejection handler is in place before the promise rejects.
- Source: create-tests, 2026-06-30

## Pre-existing type errors in mapperCompleteness.test.ts
- Project: metacleaner-monitoring
- Problem: `svelte-check` reports 22 errors, all in `src/lib/server/mappers/__tests__/mapperCompleteness.test.ts` related to `PlanRevenue[]`, `TableSize[]` etc. not being assignable to `Record<string, unknown>[]`. These are pre-existing errors unrelated to security work.
- Solution: Not introduced by security fixes; safe to ignore in this context.
- Source: security-audit, 2026-06-30
