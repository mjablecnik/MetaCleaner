# Memory

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

## Pre-existing type errors in mapperCompleteness.test.ts
- Project: metacleaner-monitoring
- Problem: `svelte-check` reports 22 errors, all in `src/lib/server/mappers/__tests__/mapperCompleteness.test.ts` related to `PlanRevenue[]`, `TableSize[]` etc. not being assignable to `Record<string, unknown>[]`. These are pre-existing errors unrelated to security work.
- Solution: Not introduced by security fixes; safe to ignore in this context.
- Source: security-audit, 2026-06-30
