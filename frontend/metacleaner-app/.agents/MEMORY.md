# Memory

## Playwright browser tests fail without system libraries
- Problem: `npm test` / `bun test` fails with `libnspr4.so: cannot open shared object file`. Chromium headless shell requires system libraries not installed by default.
- Solution: Run `npx playwright install chromium` to download the browser, then `npx playwright install-deps chromium` (requires root/sudo) to install OS dependencies. In sandboxed environments without root, browser/storybook tests cannot run; server-side tests (`--project=server`) work fine.
- Source: check-build, 2026-06-05

## svelte/no-navigation-without-resolve requires Pathname type for dynamic hrefs
- Problem: Adding `resolve()` from `$app/paths` to components that receive `href` as a `string` prop (e.g. NavBar.svelte `backHref`, Button.svelte `href`) causes TypeScript error: `Argument of type '[string]' is not assignable to parameter of type '[route: "/"] | ...'`. The `resolve()` function is typed to only accept SvelteKit's generated route union types.
- Solution: Import `type { Pathname } from '$app/types'` and cast: `resolve(backHref as Pathname)`. For generic components like Button that only accept internal routes, change the prop type to `Pathname` instead of `string`. This satisfies both the ESLint rule and TypeScript.
- Source: check-build, 2026-06-05

## locale.current reactive dependency pattern triggers no-unused-expressions
- Problem: The pattern `locale.current;` (bare expression) used throughout svelte components to create a reactive dependency for the `tx()` translation function triggers `@typescript-eslint/no-unused-expressions` ESLint error.
- Solution: Change `locale.current;` to `void locale.current;`. The `void` operator makes it an explicit void expression, which is excluded from the no-unused-expressions rule. Affected ~50 svelte files.
- Source: check-build, 2026-06-05

## eslint-plugin-storybook must be added to ESLint config
- Problem: `import storybook from 'eslint-plugin-storybook'` in eslint.config.js triggers `@typescript-eslint/no-unused-vars` because the plugin was imported but never added to the defineConfig call.
- Solution: Add `...storybook.configs['flat/recommended']` inside the `defineConfig(...)` call. The plugin's flat config is exported as `storybook.configs['flat/recommended']`.
- Source: check-build, 2026-06-05
