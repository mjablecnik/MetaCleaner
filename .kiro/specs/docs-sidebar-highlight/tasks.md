# Tasks

## Task 1: Add context provider to docs layout

- [ ] In `src/routes/docs/+layout.svelte`, import `setContext` from `'svelte'`
- [ ] Create a local `$state<Set<string>>` variable `openEndpointIds` initialized to `new Set()`
- [ ] Call `setContext('openEndpoints', { get ids() { return openEndpointIds; }, update(newIds: Set<string>) { openEndpointIds = newIds; } })`
- [ ] Add a `$effect` that resets `openEndpointIds = new Set()` when `page.url.pathname !== '/docs/endpoints'`
- [ ] Remove the unused `activeEndpointId` derived (hash-based tracking is no longer used for highlighting)

## Task 2: Update sidebar endpoint links to use highlight state

- [ ] In the sidebar endpoint `{#each}` block in `src/routes/docs/+layout.svelte`, change the class binding from static `text-text-muted hover:text-white` to a conditional expression: `{openEndpointIds.has(ep.id) ? 'font-semibold text-brand-blue' : 'text-text-muted hover:text-white'}`

## Task 3: Add onToggle prop to EndpointCard

- [ ] In `src/routes/docs/components/EndpointCard.svelte`, add `onToggle?: (id: string, isOpen: boolean) => void` to the Props interface
- [ ] Destructure `onToggle` from `$props()`
- [ ] Replace the inline `onclick={() => (open = !open)}` on the header button with a named `toggle()` function that: sets `open = !open`, then calls `onToggle?.(endpoint.id, open)`
- [ ] In the `$effect` for `forceOpen`, after setting `open = true`, call `onToggle?.(endpoint.id, true)`

## Task 4: Wire DocsEndpointsSection to context and pass onToggle to cards

- [ ] In `src/routes/docs/sections/DocsEndpointsSection.svelte`, import `getContext` from `'svelte'`
- [ ] Get the context: `const ctx = getContext<{ ids: Set<string>; update: (ids: Set<string>) => void }>('openEndpoints')`
- [ ] Create a `handleToggle(id: string, isOpen: boolean)` function that clones `ctx.ids`, adds/removes the id, and calls `ctx.update(next)`
- [ ] Pass `onToggle={handleToggle}` to each `<EndpointCard>`
- [ ] Change `initialOpen` to: `initialOpen={activeEndpointId ? endpoint.id === activeEndpointId : false}` (no card opens by default without a hash)
- [ ] When `activeEndpointId` is set (hash navigation), also call `handleToggle(activeEndpointId, true)` so sidebar highlights it

## Task 5: Clean up unused store file

- [ ] Delete `src/lib/stores/openEndpoints.svelte.ts` if it still exists
- [ ] Verify no other files import from `'$lib/stores/openEndpoints.svelte.js'`
