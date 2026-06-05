# MetaCleaner Frontend — Architecture & Conventions

## Project Overview

MetaCleaner is a metadata cleaning web app built with SvelteKit 5 + Tailwind CSS 4. It allows users to upload photos/videos, analyze metadata risks, clean metadata, and view reports.

The frontend lives in `frontend/metacleaner-app/`.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (runes mode enforced)
- **Language**: TypeScript (strict mode)
- **Package Manager**: bun
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 (utility-first, dark navy theme)
- **i18n**: Paraglide JS (en, cs)
- **Testing**: Vitest (server + browser) + Storybook 10
- **Mobile**: Capacitor (Android)
- **Build Output**: Static site via `@sveltejs/adapter-static` (SPA fallback)

## Component Hierarchy

The project uses a strict 3-tier component structure:

1. **Elements** (`src/lib/shared/elements/`) — Low-level, generic UI primitives (Button, Badge, Card, Chip, ProgressBar, ToggleSwitch, AccordionCard, IconContainer). No business logic. Always reusable across pages.

2. **Components** (`src/lib/shared/components/`) — Mid-level composed UI (NavBar, FileListItem, ActivityLog, Toast, BottomSheet, StatCard, PageHeader, LanguageDropdown, UserDropdown). May contain some interaction logic but no page-specific state.

3. **Sections** (`src/routes/[page]/sections/`) — Page-level composed sections that combine elements and components into meaningful page blocks. Each route folder has its own `sections/` and `components/` subfolder. Shared sections go in `src/lib/shared/sections/`.

### Naming Convention

- Component file: `PascalCase.svelte`
- Story file: `PascalCase.stories.svelte` (co-located with component)
- Route folders: lowercase with hyphens or `(groupName)` for route groups

## Svelte 5 Runes — Required Patterns

All components MUST use Svelte 5 runes. Never use legacy `$:`, `export let`, `on:event`, or `slot`.

```svelte
<script lang="ts">
  // Props — always with explicit interface
  interface Props {
    label: string;
    count?: number;
    class?: string;
    onclick?: (e: MouseEvent) => void;
  }

  const { label, count = 0, class: extraClass = '', onclick }: Props = $props();

  // State
  let isOpen = $state(false);

  // Derived
  const displayLabel = $derived(`${label} (${count})`);

  // Derived with block
  const computed = $derived.by(() => {
    // complex logic here
    return result;
  });
</script>
```

### Snippets (not slots)

```svelte
{#snippet iconSlot()}
  <i class="fa-solid fa-check"></i>
{/snippet}

{@render children?.()}
```

### Event Handlers

Use `onclick`, `onkeydown` etc. as props — not `on:click` directive.

## i18n — Paraglide Pattern

Messages live in `messages/en.json` and `messages/cs.json`. The `tx()` helper function is used throughout:

```typescript
import { locale } from '$lib/locale.svelte';
import * as m from '$lib/paraglide/messages';

function tx(key: string): string {
  void locale.current; // reactive dependency — REQUIRED
  const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
  return fn ? fn() : key;
}
```

- Always use `void locale.current;` (not bare `locale.current;`) to avoid ESLint no-unused-expressions error.
- Message keys use dot notation: `step1.header.title`, `common.brandName`
- All user-facing text must go through i18n — never hardcode Czech or English strings in templates.

## Styling Conventions

### Theme Colors (defined in `layout.css` @theme)

| Token | Usage |
|---|---|
| `navy-main` | Page background (`#0a1628`) |
| `navy-card` | Card/dropdown backgrounds (`#111d33`) |
| `navy-lighter` | Inputs, badges, lighter surfaces (`#1e293b`) |
| `brand-green` | Success, CTA buttons |
| `brand-blue` | Primary actions, processing, links |
| `brand-orange` | Warnings, upgrades |
| `brand-red` | Errors, danger |
| `text-main` | Primary text (white) |
| `text-muted` | Secondary text (`#94a3b8`) |

### Responsive Design

- Mobile-first approach
- Primary breakpoint: `lg:` (1024px)
- Pattern: stack on mobile → side-by-side on desktop

```svelte
<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
```

### Utility Classes

- Tailwind utility classes only — no custom component classes unless absolutely necessary
- Prettier auto-sorts Tailwind classes (via `prettier-plugin-tailwindcss`)
- Font: Inter (sans-serif)
- Icons: Font Awesome (`fa-solid fa-*`)

### Custom Shadows

- `shadow-glow-green` — green CTA glow
- `shadow-glow-blue` — blue accent glow
- `shadow-card` — card elevation
- `shadow-dropdown` — dropdown/popover elevation

## Data Layer

### Repositories (`src/lib/repositories/`)

Currently mock data. Each repository exports:
- TypeScript interface(s) for the data shape
- Async function(s) returning mock data

```typescript
export interface UploadedFile {
  id: string;
  name: string;
  // ...
}

export async function getUploadedFiles(): Promise<UploadedFile[]> {
  return [ /* mock data */ ];
}
```

When integrating with a real backend, keep the same interface — only change the implementation to call APIs.

## Route Structure

The app has a multi-step wizard flow:

| Route | Purpose |
|---|---|
| `/` (step1) | File upload |
| `/step2` | Risk analysis review |
| `/step3` | Processing |
| `/step4` | Error handling |
| `/step5` | Results/completion |
| `/reports` | Report history list |
| `/report` | Detailed single report |

Each route folder has:
- `+page.svelte` — page component
- `components/` — route-specific sub-components
- `sections/` — route-specific sections

## Path Resolution

Use `resolve()` from `$app/paths` for all internal navigation links. Type href props as `Pathname` from `$app/types` for type safety:

```typescript
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
```

## Formatting & Linting

- **Prettier**: Tabs, single quotes, trailing comma: none, 100 char width
- **ESLint**: Flat config with TypeScript ESLint + Svelte plugin + Storybook plugin
- **Type checking**: `bun run check` (svelte-check)
- **Lint**: `bun run lint` (prettier + eslint)
- **Format**: `bun run format`

## Build & Run Commands

```bash
bun install              # Install deps
bun run dev              # Dev server
bun run build            # Production build
bun run check            # Type check
bun run lint             # Lint check
bun run format           # Auto-format
bun run test             # Run all tests
bun run storybook        # Storybook dev
```
