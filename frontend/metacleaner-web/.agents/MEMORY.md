# Memory

## Font Awesome media-swap onload incompatible with Svelte 5 svelte:head

- Project: metacleaner-web
- Problem: The standard non-render-blocking FA trick `<link media="print" onload="this.media='all'">` fails to compile in Svelte 5 because Svelte rejects string event handlers ("Event attribute must be a JavaScript expression, not a string").
- Solution: Move the `<link>` tag (with `onload="..."`) to `src/app.html` instead of `<svelte:head>`. `app.html` is plain HTML processed by SvelteKit at build time (not by Svelte's template compiler), so string event handlers are valid there. Also add `<link rel="preconnect">` for the CDN in `app.html`. Remove the duplicate `<link>` from `+layout.svelte`.
- Source: seo-audit, 2026-06-30

## adapter-static fallback conflicts with prerendered home page

- Project: metacleaner-web
- Problem: When enabling prerendering with `adapter-static`, the adapter setting `fallback: 'index.html'` overwrites the prerendered home page (`index.html`) with an empty SPA shell. The build warns: "Overwriting build/index.html with fallback page."
- Solution: Change `fallback: 'index.html'` to `fallback: '200.html'` in `vite.config.ts` (adapter config), and update `nginx.conf` to use `try_files $uri $uri/ $uri.html /200.html` instead of `/index.html`.
- Source: seo-audit, 2026-06-30
