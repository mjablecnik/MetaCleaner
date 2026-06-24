# Technical Design: Docs Sidebar Highlight

## Overview

This design describes how to share the "which endpoints are open" state between `EndpointCard` components and the docs sidebar layout. The key challenge is that the sidebar lives in `routes/docs/+layout.svelte` while individual cards are rendered deep inside `routes/docs/sections/DocsEndpointsSection.svelte` → `routes/docs/components/EndpointCard.svelte`.

## Approach: Callback Props (No Shared Store)

**Previous approach failed** because importing a `.svelte.ts` rune module into `EndpointCard.svelte` caused the component to break (cards stopped toggling entirely). The root cause was never fully diagnosed.

**New approach**: Instead of a shared module-level store, we use a **callback prop pattern**. The `DocsEndpointsSection` maintains a local reactive `Set<string>` of open IDs and passes an `onToggle` callback to each `EndpointCard`. The section then exposes the set to the layout via a **bindable prop**.

This avoids cross-module `.svelte.ts` imports in the `EndpointCard` component entirely.

## Component Data Flow

```
+layout.svelte (sidebar reads openIds)
      │
      │  binds: openEndpointIds (Set<string>)
      ▼
DocsEndpointsSection.svelte (owns the Set, passes callbacks)
      │
      │  props: onToggle(id, isOpen)
      ▼
EndpointCard.svelte (calls onToggle when toggled)
```

## Detailed Design

### 1. EndpointCard.svelte — Add `onToggle` Callback Prop

**File**: `src/routes/docs/components/EndpointCard.svelte`

Changes:
- Add `onToggle?: (id: string, isOpen: boolean) => void` to the Props interface
- Call `onToggle(endpoint.id, open)` after toggling `open` state
- Call `onToggle(endpoint.id, true)` when `forceOpen` activates

```typescript
interface Props {
  endpoint: EndpointData;
  initialOpen?: boolean;
  forceOpen?: boolean;
  onToggle?: (id: string, isOpen: boolean) => void;  // NEW
}

const { endpoint, initialOpen = false, forceOpen = false, onToggle }: Props = $props();

let open = $state(untrack(() => initialOpen));

// React to forceOpen
$effect(() => {
  if (forceOpen && !open) {
    open = true;
    onToggle?.(endpoint.id, true);
  }
});

// Toggle handler on the header button
function toggle() {
  open = !open;
  onToggle?.(endpoint.id, open);
}
```

The `onclick` on the header button changes from `() => (open = !open)` to `toggle`.

### 2. DocsEndpointsSection.svelte — Maintain Open IDs Set, Expose via Bindable

**File**: `src/routes/docs/sections/DocsEndpointsSection.svelte`

Changes:
- Add `openIds = $bindable(new Set<string>())` as a prop so the parent layout can read it
- Pass `onToggle` callback to each `EndpointCard`
- Change `initialOpen` to always be `false` (no card open by default), except when navigating via hash

```typescript
interface Props {
  openIds?: Set<string>;
}

let { openIds = $bindable(new Set<string>()) }: Props = $props();

function handleToggle(id: string, isOpen: boolean) {
  if (isOpen) {
    openIds = new Set([...openIds, id]);
  } else {
    const next = new Set(openIds);
    next.delete(id);
    openIds = next;
  }
}
```

In the template:
```svelte
{#each endpoints as endpoint (endpoint.id)}
  <EndpointCard
    {endpoint}
    initialOpen={activeEndpointId ? endpoint.id === activeEndpointId : false}
    forceOpen={endpoint.id === activeEndpointId}
    onToggle={handleToggle}
  />
{/each}
```

### 3. Docs +layout.svelte — Read openIds for Sidebar Highlighting

**File**: `src/routes/docs/+layout.svelte`

Changes:
- No store import needed
- The `DocsEndpointsSection` is rendered by a child route page (`/docs/endpoints/+page.svelte`), not directly by the layout. So we cannot directly bind to it.

**Problem**: The layout renders `{@render children()}` which includes the page that renders `DocsEndpointsSection`. We can't pass bindable props through `{@render children()}`.

**Solution**: Use Svelte's **context API** (`setContext` / `getContext`) to share a reactive object between the layout and the section.

### Revised Approach: Context-Based Reactive State

Since the layout can't directly bind to the section component (they're connected via SvelteKit routing, not direct parent-child), we use context:

#### 3a. Layout sets a context with a reactive container

```typescript
// In +layout.svelte
import { setContext } from 'svelte';

interface OpenEndpointsContext {
  ids: Set<string>;
  update: (ids: Set<string>) => void;
}

let openEndpointIds = $state<Set<string>>(new Set());

setContext<OpenEndpointsContext>('openEndpoints', {
  get ids() { return openEndpointIds; },
  update(newIds: Set<string>) { openEndpointIds = newIds; }
});
```

#### 3b. DocsEndpointsSection reads from context

```typescript
// In DocsEndpointsSection.svelte
import { getContext } from 'svelte';

const ctx = getContext<{ ids: Set<string>; update: (ids: Set<string>) => void }>('openEndpoints');

function handleToggle(id: string, isOpen: boolean) {
  const next = new Set(ctx.ids);
  if (isOpen) {
    next.add(id);
  } else {
    next.delete(id);
  }
  ctx.update(next);
}
```

#### 3c. Sidebar in layout reads `openEndpointIds` directly (it's local $state)

```svelte
<a class="... {openEndpointIds.has(ep.id) ? 'font-semibold text-brand-blue' : 'text-text-muted hover:text-white'}">
```

### 4. Reset on Navigation

In the layout, when the user navigates away from `/docs/endpoints`, reset the set:

```typescript
$effect(() => {
  if (page.url.pathname !== '/docs/endpoints') {
    openEndpointIds = new Set();
  }
});
```

### 5. Initial State: All Closed

`DocsEndpointsSection` currently passes `initialOpen={i === 0}` for the first card. Change this to:
- `initialOpen={false}` when there's no URL hash (all closed by default)
- `initialOpen={endpoint.id === activeEndpointId}` when there IS a URL hash (user clicked a sidebar link)

## Files Modified

| File | Change |
|------|--------|
| `src/routes/docs/+layout.svelte` | Add context provider with reactive `openEndpointIds` set; use it for sidebar class binding; add reset effect |
| `src/routes/docs/sections/DocsEndpointsSection.svelte` | Get context; pass `onToggle` to cards; change default `initialOpen` to false |
| `src/routes/docs/components/EndpointCard.svelte` | Add `onToggle` prop; call it from toggle function and forceOpen effect |

## Files Deleted

| File | Reason |
|------|--------|
| `src/lib/stores/openEndpoints.svelte.ts` | No longer needed — replaced by context-based approach |

## Why This Approach

1. **No cross-module `.svelte.ts` imports in EndpointCard** — the previous store-based approach broke the component entirely. Using context + callbacks avoids that.
2. **Context API is built into Svelte** — no module resolution issues, no `.svelte.js` extension concerns.
3. **Reactive via `$state`** — the layout owns the `$state`, context provides getter/setter, sidebar re-renders when state changes.
4. **Consistent pattern** — context is already used elsewhere in SvelteKit for sharing state between layouts and pages.

## Requirement Traceability

| Requirement | Design Element |
|---|---|
| Req 1: Track open endpoints reactively | Layout owns `$state<Set<string>>`, exposed via context |
| Req 2: Highlight sidebar entries | Layout reads `openEndpointIds.has(ep.id)` for class binding |
| Req 3: Synchronize card toggle with sidebar | `onToggle` callback → context update → layout re-renders sidebar |
| Req 4: Preserve existing functionality | EndpointCard still toggles locally; `onToggle` is optional (graceful degradation) |
| Req 5: Svelte 5 runes pattern | Uses `$state` in layout, `$effect` for reset, context API for sharing |
