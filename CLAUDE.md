# MetaCleaner Workspace — Agent Guide

Bun monorepo. Metadata-cleaning product: frontend app, marketing site, monitoring dashboard,
a shared library, a CLI, and a Go backend.

## Packages

| Path | What it is | Stack |
|---|---|---|
| `frontend/metacleaner-app` | Main app (cleaning wizard) | SvelteKit SPA (adapter-static), Vitest 4, Storybook, Playwright |
| `frontend/metacleaner-web` | Marketing site (prerendered) | SvelteKit (adapter-static), Paraglide i18n |
| `frontend/metacleaner-monitoring` | Monitoring dashboard (SSR) | SvelteKit (adapter-node), Paraglide i18n |
| `frontend/metacleaner-shared` | Shared library (pricing UI) | Svelte |
| `terminal/metacleaner-cli` | CLI | Bun |
| `backend/metacleaner-server` | HTTP server | Go |

> `metacleaner-monitoring` is **not** in the root `workspaces` in `package.json` (it deploys separately).

## Package manager

**`bun` only** — `npm install` fails on the `workspace:*` protocol. Install from the root: `bun install`.

## ⚠️ Read before working

- **`.agents/AGENT_NOTES.md`** — cross-project test gotchas, review checklist (i18n, invalidate/depends,
  runtime Tailwind classes, SSR `window` guards) and process notes. Read before writing tests / i18n / code review.
- **`.agents/MEMORY.md`** — full history of specific problems and fixes (with line numbers).

Each package has its own `CLAUDE.md` with project-specific details.
