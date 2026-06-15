# MetaCleaner Frontend — Architecture & Conventions

## Project Overview

MetaCleaner is a metadata cleaning web app built with SvelteKit 5 + Tailwind CSS 4. It allows users to upload photos/videos, analyze metadata risks client-side, clean metadata via the Go backend, and view cleaning reports. It supports user authentication (email/password, OAuth, magic link) and runs as an Android app via Capacitor.

The frontend lives in `frontend/metacleaner-app/`.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (runes mode enforced)
- **Language**: TypeScript (strict mode)
- **Package Manager**: bun
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 (utility-first, dark navy theme)
- **i18n**: Paraglide JS (en, cs)
- **Testing**: Vitest (server + browser projects) + Storybook 10 + Playwright E2E
- **Mobile**: Capacitor (Android)
- **Build Output**: Static site via `@sveltejs/adapter-static` (SPA fallback)
- **Auth**: Supabase Auth via backend proxy (JWT in localStorage)

## Project Structure

```
frontend/metacleaner-app/src/
├── lib/
│   ├── auth/                    # Authentication module
│   │   ├── api-client.ts        # Auth API calls (login, register, refresh, etc.)
│   │   ├── auth.svelte.ts       # Auth store ($state-based, token management)
│   │   ├── auth-guard.ts        # Route protection (redirect unauthenticated users)
│   │   ├── deep-link.ts         # Capacitor deep link handling (OAuth/magic link callbacks)
│   │   ├── token-utils.ts       # JWT decode, expiry check
│   │   └── __tests__/
│   ├── clients/                 # API client layer (pure I/O, no business logic)
│   │   ├── api-config.ts        # buildApiUrl, buildWsUrl helpers (PUBLIC_API_URL)
│   │   ├── metaCleanerApi.ts    # Typed HTTP + WebSocket client for all backend endpoints
│   │   └── __tests__/
│   ├── services/                # Business logic / orchestration
│   │   ├── cleaningService.ts   # CleaningService interface definition
│   │   ├── apiCleaningService.ts # Real implementation (upload → job → WS → results)
│   │   └── __tests__/
│   ├── scanner/                 # Client-side metadata scanning (shared with CLI)
│   │   ├── metadataParser.ts    # Orchestrates parsers, extracts metadata fields
│   │   ├── riskAnalyzer.ts      # Computes risk score + severity from metadata
│   │   ├── aiDetector.ts        # Detects AI-generated content markers
│   │   ├── scannerStore.svelte.ts # Reactive scanner state ($state)
│   │   ├── constants.ts         # Supported formats, extensions, risk weights
│   │   ├── types.ts             # ScanResult, MetadataField, RiskCategory, etc.
│   │   ├── parsers/             # Format-specific parsers (exifr, ExifReader, mediainfo.js)
│   │   └── __tests__/
│   ├── stores/                  # Global reactive state
│   │   ├── appState.svelte.ts   # App-wide state machine (step transitions)
│   │   ├── cleaningResultsStore.svelte.ts # Processing results accumulator
│   │   └── __tests__/
│   ├── repositories/            # Data access (mock fallbacks for offline/dev)
│   ├── shared/
│   │   ├── elements/            # Low-level UI primitives (Button, Badge, Card, etc.)
│   │   ├── components/          # Mid-level composed UI (NavBar, Toast, StatCard, etc.)
│   │   └── sections/            # Shared page sections
│   ├── types/                   # Shared TypeScript types
│   ├── assets/                  # Static assets (SVGs, images)
│   ├── paraglide/               # Generated i18n runtime (auto-generated, do not edit)
│   ├── locale.svelte.ts         # Locale state + initLocale()
│   └── index.ts
├── routes/
│   ├── (step1)/                 # File upload + scan (route group for wizard step 1)
│   ├── (auth)/                  # Auth pages (login, register, forgot-password)
│   ├── report/                  # Report detail page
│   ├── reports/                 # Report history list
│   ├── sections/                # Shared route-level sections
│   ├── __tests__/               # Route-level integration tests
│   ├── +page.svelte             # Root page (step router)
│   ├── +layout.svelte           # Global layout (NavBar, Toast, auth guard)
│   └── layout.css               # Tailwind @theme tokens + base styles
└── messages/
    ├── en.json                  # English translations
    └── cs.json                  # Czech translations
```

## Component Hierarchy

The project uses a strict 3-tier component structure:

1. **Elements** (`src/lib/shared/elements/`) — Low-level, generic UI primitives (Button, Badge, Card, Chip, ProgressBar, ToggleSwitch, AccordionCard, IconContainer, AuthTextInput). No business logic. Always reusable across pages.

2. **Components** (`src/lib/shared/components/`) — Mid-level composed UI (NavBar, FileListItem, ActivityLog, Toast, BottomSheet, StatCard, PageHeader, LanguageDropdown, UserDropdown, MobileHamburgerMenu, MobileBottomCta). May contain interaction logic but no page-specific state.

3. **Sections** (`src/routes/[page]/sections/`) — Page-level composed sections that combine elements and components into meaningful page blocks. Each route folder has its own `sections/` and `components/` subfolder. Shared sections go in `src/lib/shared/sections/`.

### Naming Convention

- Component file: `PascalCase.svelte`
- Story file: `PascalCase.stories.svelte` (co-located with component)
- Store/module file: `camelCase.svelte.ts` (for reactive state) or `camelCase.ts`
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

## Data Layer Architecture

### Two-Layer API Integration

1. **API Client** (`src/lib/clients/metaCleanerApi.ts`) — Thin HTTP + WebSocket client. Purely I/O: URL construction, raw fetch calls, response parsing, low-level error mapping. No business logic.

2. **Service Layer** (`src/lib/services/apiCleaningService.ts`) — Orchestration implementing `CleaningService` interface. Handles upload → job → WebSocket flow, maps backend types to frontend types, accumulates WebSocket events into `ProcessingResults`.

```typescript
// Client layer — pure I/O
import { buildApiUrl, buildWsUrl } from '$lib/clients/api-config';
export async function uploadFiles(files: File[]): Promise<UploadedFile[]>;
export async function createJob(fileIds: string[]): Promise<JobResponse>;
export function connectJobProgress(jobId: string): WebSocket;

// Service layer — orchestration
export class ApiCleaningService implements CleaningService {
  async startCleaning(files, options, callbacks): Promise<CleaningHandle>;
}
```

### Client-Side Scanner

The scanner module performs metadata extraction and risk analysis entirely in the browser:
- Uses `exifr`, `ExifReader`, and `mediainfo.js` for parsing
- Computes risk scores based on field categories and severity weights
- Detects AI-generated content markers
- Shared with CLI via Bun workspace link

### Auth Module

JWT-based authentication with proactive token refresh:
- Tokens stored in localStorage (accessToken, refreshToken, user)
- Auto-refresh when access token is within 60s of expiry
- Auth guard redirects unauthenticated users to `/login`
- OAuth (Google, Apple) and magic link flows with deep link support for Capacitor

```typescript
// auth.svelte.ts — reactive auth state
export const auth = {
  get isAuthenticated(): boolean;
  get user(): User | null;
  get accessToken(): string | null;
  login(email, password): Promise<void>;
  register(email, password, firstName, lastName): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
};
```

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

## Route Structure

The app has a multi-step wizard flow plus auth pages:

| Route | Purpose |
|---|---|
| `/` (step1) | File upload + client-side metadata scan |
| `/` (step2) | Risk analysis review (driven by appState) |
| `/` (step3) | Processing (WebSocket progress) |
| `/` (step4) | Error handling |
| `/` (step5) | Results/completion |
| `/reports` | Report history list |
| `/report/[id]` | Detailed single report |
| `/login` | User login |
| `/register` | User registration |
| `/forgot-password` | Password reset flow (3-step) |

The wizard steps (1-5) share the root route `/` and are controlled by the `appState` store — no separate URL for each step.

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

## Testing Strategy

### Three Test Layers

1. **Server-side unit tests** (`src/**/*.{test,spec}.ts`) — Vitest, Node environment. Test services, utilities, stores.

2. **Browser component tests** (`src/**/*.svelte.{test,spec}.ts`) — Vitest with Playwright browser provider. Test rendered Svelte components.

3. **Storybook stories** (`*.stories.svelte`) — Visual testing of all UI states. Co-located with components. 244 stories across 48 files.

4. **E2E tests** (`e2e/*.spec.ts`) — Playwright, full page flows. 84 tests covering all routes and responsive viewports.

### Test Conventions

```typescript
// Server tests
import { describe, it, expect, vi } from 'vitest';

// Browser tests — use vi.hoisted() for mocks
const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }));
vi.mock('$lib/module', () => ({ fn: mockFn }));

// vi.mock path must match import path exactly (no .js extension for .ts files)
vi.mock('$lib/scanner/scannerStore.svelte', ...); // NOT .svelte.js
```

### Running Tests

```bash
bun run test                  # Server-side unit tests (single run)
bun run test:browser          # Browser + Storybook tests
bun run test:e2e              # Playwright E2E tests
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
bun run test             # Run server tests
bun run test:browser     # Run browser + storybook tests
bun run test:e2e         # Run E2E tests
bun run storybook        # Storybook dev server
```

## Known Gotchas (from development history)

- `vi.fn<>` in Vitest 4.x takes a single function-type arg: `vi.fn<() => Promise<void>>()`
- `vi.mock` path must match the import path exactly — use `'$lib/scanner/scannerStore.svelte'` not `.svelte.js`
- `vi.hoisted()` is required when top-level mock functions are referenced inside `vi.mock()` factories
- Browser tests default to English locale — use English text in assertions
- `new Response('', { status: 204 })` throws in Node — use `status: 200` for mock responses
- Svelte 5: don't wrap inline children in `{#snippet children()}` — triggers `svelte/no-useless-children-snippet`
- `void locale.current;` not bare `locale.current;` to satisfy ESLint no-unused-expressions
