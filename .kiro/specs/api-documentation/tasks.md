# Implementation Plan: API Documentation Page

## Overview

Implement an authenticated `/docs` page in the MetaCleaner SvelteKit app that renders comprehensive API documentation from a local typed data module. The page features a sticky sidebar with scrollspy, collapsible endpoint cards, reusable code blocks with copy functionality, and full i18n support (Czech/English). All content is sourced from `docsRepository.ts` — no HTTP requests for page content.

## Tasks

- [x] 1. Shared UI Elements
  - [x] 1.1 Create `CodeBlock.svelte` and `CopyButton.svelte` shared elements
    - Create `src/lib/shared/elements/CodeBlock.svelte` with props: `code: string`, `class?: string`
    - Render monospace text on `#080f1e` background with 1px `navy-lighter` border, rounded corners, horizontal scroll overflow
    - Embed `CopyButton` in the top-right corner of the code block
    - Create `src/lib/shared/elements/CopyButton.svelte` with props: `text: string`, `class?: string`
    - Implement clipboard write via `navigator.clipboard.writeText()`, show checkmark icon (brand-green) for 2s on success, silent fail if API unavailable
    - If clicked during confirmation state, restart 2s timer without re-writing to clipboard
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 1.2 Create `InfoBox.svelte` shared element
    - Create `src/lib/shared/elements/InfoBox.svelte` with props: `variant: 'blue' | 'green' | 'orange' | 'red'`, `icon?: string`, `class?: string`
    - Render with variant brand-color at 8% opacity background, 25% opacity border, border-radius 10px
    - Support `{@render children?.()}` for content projection
    - _Requirements: 12.3_

  - [x] 1.3 Create `MethodBadge.svelte` shared element
    - Create `src/lib/shared/elements/MethodBadge.svelte` with props: `method: 'GET' | 'POST' | 'DEL' | 'PATCH' | 'PUT'`, `size?: 'sm' | 'md'`
    - Color mapping: POST → blue, GET → green, DEL → red
    - Size `sm` for sidebar, `md` for endpoint cards
    - _Requirements: 4.2, 8.2_

  - [x] 1.4 Create `FeatureCard.svelte` shared element
    - Create `src/lib/shared/elements/FeatureCard.svelte` with props: `icon: string`, `iconColor: string`, `title: string`, `description: string`
    - Render icon + title + description in a card layout
    - _Requirements: 5.3_

- [x] 2. Checkpoint — Shared elements compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Data Layer and i18n
  - [x] 3.1 Create `docsRepository.ts` typed data module
    - Create `src/lib/repositories/docsRepository.ts` with all TypeScript interfaces: `DocsSection`, `FeatureCardData`, `QuickStartStep`, `CodeExample`, `ErrorEntry`, `EndpointParam`, `EndpointResponse`, `EndpointData`, `SidebarSection`, `SidebarEndpoint`, `DocsConfig`
    - Implement getter functions: `getDocsConfig()`, `getSidebarSections()`, `getSidebarEndpoints()`, `getFeatureCards()`, `getQuickStartSteps()`, `getSupportedFormats()`, `getErrorEntries()`, `getEndpoints()`, `getCodeExamples()`
    - All translatable strings use `tx()` for reactive locale support
    - Code content (URLs, cURL, JSON) remains locale-independent
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 11.4_

  - [x] 3.2 Add i18n message keys for docs page
    - Add all docs-related keys to `messages/en.json` and `messages/cs.json`
    - Cover: section titles, subtitles, descriptions, info box content, table headers, button labels, sidebar labels, endpoint descriptions, error descriptions/solutions, best practices, format badges
    - Ensure no hardcoded strings in templates — all text through Paraglide
    - _Requirements: 11.1, 11.2, 11.3, 6.7_

- [x] 4. Checkpoint — Data module compiles with type safety
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Route Setup and Auth Guard
  - [x] 5.1 Create `/docs` route with auth guard
    - Create `src/routes/docs/+layout.ts` with `guardProtectedRoute('/docs')` auth guard pattern
    - Create `src/routes/docs/+page.svelte` as page shell: sidebar + main content area
    - Set localized `<title>` meta tag with app name and docs identifier
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.2 Integrate NavBar with docs navigation item
    - Add "Docs" link to `NavBar.svelte` desktop nav area (after API Keys), visible only when authenticated
    - Add "Docs" entry with `fa-book` icon to `MobileHamburgerMenu.svelte`
    - Apply `brand-blue` text color when on `/docs` route (active state)
    - Configure NavBar on docs page with `showBackButton: true`, `backHref: '/'`, back label from i18n
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Sidebar with Scrollspy
  - [ ] 6.1 Create `DocsSidebar.svelte` component
    - Create `src/routes/docs/components/DocsSidebar.svelte` with props: `sections`, `endpoints`, `activeId`, `onNavigate`
    - List top-level sections (Introduction, Authentication, Error Codes) with Font Awesome icons
    - List endpoint entries grouped under "Endpoints" heading with MethodBadge prefix
    - Highlight active link with blue text, inactive with muted gray, 200ms transition
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 6.2 Implement scrollspy with IntersectionObserver in `+page.svelte`
    - Use `IntersectionObserver` with `rootMargin: '-80px 0px -60% 0px'` to detect topmost visible section
    - Track `activeId` via `$state`, update on intersection changes
    - Implement smooth-scroll navigation on sidebar link click with navbar offset
    - Ensure exactly one active link at all times while scrolling
    - _Requirements: 4.3, 4.4_

- [ ] 7. Page Layout and Responsive Design
  - [ ] 7.1 Implement responsive page layout in `+page.svelte`
    - Desktop (lg+): sticky sidebar (w-56, 224px) left panel below navbar + main content area with 32px gap
    - Mobile (<lg): hide sidebar, full-width single-column main content
    - Constrain content to max-width 1200px, centered horizontally
    - Sticky top navbar with bottom border, "MetaCleaner" branding, shield icon, "API" badge, version badge from config
    - No horizontal scrollbar at any viewport width (320px+)
    - Use the existing shared app layout (+layout.svelte with NavBar, user dropdown, language switcher) — do NOT create a separate custom navbar for docs. Place "API" badge and version badge in the page content area header.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8. Checkpoint — Route, sidebar, and layout functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Documentation Sections
  - [ ] 9.1 Create `DocsIntroSection.svelte`
    - Create `src/routes/docs/sections/DocsIntroSection.svelte`
    - Render: descriptive paragraph, base URL CodeBlock, 3 FeatureCards in responsive grid (3-col lg+, 1-col below), supported format badges, QuickStartFlow (4 numbered steps), rate limit InfoBox (orange variant)
    - Section header with icon badge (32px rounded-lg, 20% bg, 30% border), title (text-2xl font-bold), subtitle (text-xs text-muted)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 12.5_

  - [ ] 9.2 Create `DocsAuthSection.svelte`
    - Create `src/routes/docs/sections/DocsAuthSection.svelte`
    - Render: Bearer token explanation, Authorization header CodeBlock, API key generation InfoBox (blue), authenticated cURL example CodeBlock, 4 security best practices list, 2 auth error response CodeBlocks (401, 403)
    - All text via i18n in both English and Czech
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 9.3 Create `DocsErrorCodesSection.svelte`
    - Create `src/routes/docs/sections/DocsErrorCodesSection.svelte`
    - Render: standard error response JSON CodeBlock, 3 HTTP status category InfoBoxes (2xx green, 4xx orange, 5xx red), ErrorTable with 8+ entries covering all 5 error categories, retry strategy InfoBox (blue)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 9.4 Create `DocsEndpointsSection.svelte` and `EndpointCard.svelte`
    - Create `src/routes/docs/sections/DocsEndpointsSection.svelte` rendering 6 EndpointCards
    - Create `src/routes/docs/components/EndpointCard.svelte` with props: `endpoint: EndpointData`, `initialOpen?: boolean`
    - Collapsible header: MethodBadge + path (monospace) + description + chevron
    - Full detail content for Upload, Clean, Status: description paragraph, headers CodeBlock, params table (name/type/required/description), cURL CodeBlock with CopyButton, success + error response CodeBlocks with status badges
    - Minimal content for Download, Metadata, Delete: description paragraph + placeholder note indicating full docs after backend integration
    - Border color → brand-blue when expanded, gray-800 when collapsed
    - Clean options table for `/files/clean`, status values badges for `/jobs/{job_id}/status`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ] 10. Checkpoint — All sections render with correct content
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Property-Based Tests (fast-check)
  - [ ]* 11.1 Write property test for scrollspy single-active invariant
    - **Property 1: Scrollspy single-active invariant**
    - Generate random scroll offsets within page bounds, simulate IntersectionObserver entries
    - Assert exactly one sidebar link is active at all times — never zero, never more than one
    - **Validates: Requirements 4.4**

  - [ ]* 11.2 Write property test for endpoint card expand completeness
    - **Property 2: Endpoint card expand reveals complete content**
    - Select random endpoint from data set, verify expanded card renders: description, headers CodeBlock, params table, cURL CodeBlock with CopyButton, success + error response CodeBlocks
    - **Validates: Requirements 8.3, 8.4**

  - [ ]* 11.3 Write property test for copy button plain text correctness
    - **Property 3: Copy button copies correct plain text**
    - Generate all code blocks from data, simulate click, verify clipboard write matches exact plain-text content (non-empty, no HTML markup)
    - **Validates: Requirements 9.1**

  - [ ]* 11.4 Write property test for i18n completeness
    - **Property 4: i18n completeness — all docs keys resolve**
    - Generate all translation keys used in docs data × both locales (cs, en), verify each returns non-empty string ≠ raw key
    - **Validates: Requirements 10.2, 11.1**

  - [ ]* 11.5 Write property test for code block locale independence
    - **Property 5: Code block content is locale-independent**
    - Generate all code blocks × both locales, verify rendered code content is identical regardless of active locale
    - **Validates: Requirements 11.4**

  - [ ]* 11.6 Write property test for info box variant styling
    - **Property 6: Info box variant styling correctness**
    - Generate all 4 variants (blue, green, orange, red), verify rendered component applies correct background (8% opacity) and border (25% opacity) of variant brand-color, with border-radius 10px
    - **Validates: Requirements 12.3**

- [ ] 12. Unit and Component Tests (Vitest)
  - [ ]* 12.1 Write unit tests for `docsRepository.ts` data completeness
    - Verify all endpoints have required fields (method, path, params, responses)
    - Verify all translation keys resolve to non-empty strings for both locales
    - Verify code examples contain non-empty `code` and `displayHtml`
    - _Requirements: 10.1, 10.2_

  - [ ]* 12.2 Write component tests for CodeBlock and CopyButton
    - Test CodeBlock renders with correct classes and embedded CopyButton
    - Test CopyButton clipboard interaction with mocked `navigator.clipboard`
    - Test 2s confirmation state and timer restart on re-click
    - Test silent fail when clipboard API unavailable
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ]* 12.3 Write component tests for InfoBox, MethodBadge, and FeatureCard
    - Test InfoBox renders all 4 variants with correct background/border colors
    - Test MethodBadge renders correct colors per HTTP method
    - Test FeatureCard renders icon, title, description
    - _Requirements: 12.3, 4.2, 5.3_

  - [ ]* 12.4 Write component tests for EndpointCard and DocsSidebar
    - Test EndpointCard toggles expand/collapse on click
    - Test expanded state shows all required sub-sections
    - Test border color change on expand/collapse
    - Test DocsSidebar highlights active link, renders all sections and endpoints
    - _Requirements: 8.3, 8.7, 4.1, 4.5_

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using `fast-check`
- Unit tests validate specific examples and edge cases
- All text must go through Paraglide i18n (`tx()` helper) — no hardcoded strings in templates
- Code content (URLs, cURL commands, JSON) remains English regardless of locale
- The `docsRepository.ts` module is the single data source — replacing it with a backend fetch requires changes only to that module

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["3.1", "3.2"] },
    { "id": 2, "tasks": ["5.1", "5.2"] },
    { "id": 3, "tasks": ["6.1", "6.2", "7.1"] },
    { "id": 4, "tasks": ["9.1", "9.2", "9.3", "9.4"] },
    { "id": 5, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5", "11.6"] },
    { "id": 6, "tasks": ["12.1", "12.2", "12.3", "12.4"] }
  ]
}
```
