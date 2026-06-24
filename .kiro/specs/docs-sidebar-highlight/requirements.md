# Requirements Document

## Introduction

This feature adds visual highlighting to the documentation sidebar in the metacleaner-app frontend. When endpoint cards on the `/docs/endpoints` page are expanded, their corresponding sidebar entries display a blue/bold highlight style. Multiple endpoints can be open simultaneously, so multiple sidebar items can be highlighted at once. The implementation must use Svelte 5 runes patterns and must not break existing endpoint open/close functionality.

## Glossary

- **Sidebar**: The sticky left-hand navigation panel rendered by `routes/docs/+layout.svelte` that lists all documentation sections and endpoint entries.
- **Endpoint_Card**: The expandable/collapsible accordion component (`EndpointCard.svelte`) that displays details about a single API endpoint.
- **Open_Endpoints_Set**: A reactive set tracking the IDs of all currently expanded Endpoint_Cards on the page.
- **Highlight_Style**: The visual treatment applied to a sidebar entry when its corresponding Endpoint_Card is open — blue text color and bold font weight.
- **Docs_Endpoints_Page**: The `/docs/endpoints` route that renders all Endpoint_Cards.

## Requirements

### Requirement 1: Track Open Endpoints Reactively

**User Story:** As a developer, I want the application to maintain a reactive set of currently open endpoint IDs, so that the sidebar can reflect which endpoints are expanded.

#### Acceptance Criteria

1. THE Open_Endpoints_Set SHALL maintain a reactive collection of endpoint IDs representing all currently expanded Endpoint_Cards.
2. WHEN an Endpoint_Card transitions from closed to open, THE Open_Endpoints_Set SHALL add that endpoint ID to the collection.
3. WHEN an Endpoint_Card transitions from open to closed, THE Open_Endpoints_Set SHALL remove that endpoint ID from the collection.
4. THE Open_Endpoints_Set SHALL support multiple endpoint IDs simultaneously.
5. WHEN the Docs_Endpoints_Page loads (first visit or returning from another page), ALL Endpoint_Cards SHALL be closed and THE Open_Endpoints_Set SHALL be empty — no endpoint is open or highlighted by default.

### Requirement 2: Highlight Sidebar Entries for Open Endpoints

**User Story:** As a user browsing API documentation, I want the sidebar to visually highlight which endpoints are currently expanded, so that I can quickly see my position within the documentation.

#### Acceptance Criteria

1. WHILE an endpoint ID is present in the Open_Endpoints_Set AND the current route is `/docs/endpoints`, THE Sidebar SHALL render the corresponding entry with the Highlight_Style (blue text and bold font weight).
2. WHILE an endpoint ID is absent from the Open_Endpoints_Set, THE Sidebar SHALL render the corresponding entry with the default style (muted text color, normal font weight).
3. WHEN multiple endpoint IDs are present in the Open_Endpoints_Set, THE Sidebar SHALL apply the Highlight_Style to all corresponding entries simultaneously.
4. WHEN the user navigates away from `/docs/endpoints`, THE Sidebar SHALL revert all endpoint entries to the default style regardless of the Open_Endpoints_Set contents.

### Requirement 3: Synchronize Card Toggle with Sidebar Highlight

**User Story:** As a user, I want the sidebar highlights to update immediately when I open or close endpoint cards by clicking their headers, so that the sidebar always reflects the current state of the page.

#### Acceptance Criteria

1. WHEN a user clicks an Endpoint_Card header to open the card, THE Sidebar SHALL display the Highlight_Style on the corresponding entry within the same render cycle.
2. WHEN a user clicks an Endpoint_Card header to close the card, THE Sidebar SHALL remove the Highlight_Style from the corresponding entry within the same render cycle.
3. WHEN a sidebar link is clicked causing an Endpoint_Card to force-open, THE Sidebar SHALL display the Highlight_Style on the corresponding entry.

### Requirement 4: Preserve Existing Endpoint Card Functionality

**User Story:** As a user, I want the existing endpoint card open/close and sidebar navigation behaviors to continue working unchanged after this feature is added.

#### Acceptance Criteria

1. THE Endpoint_Card SHALL continue to toggle between open and closed states when its header is clicked.
2. THE Sidebar links SHALL continue to navigate to specific endpoints via URL hash, opening the target card and scrolling it into view.
3. WHEN the Docs_Endpoints_Page loads without a URL hash, ALL Endpoint_Cards SHALL be closed (no card opens by default).
4. IF the shared reactive state module fails to load or initialize, THEN THE Endpoint_Card SHALL fall back to local-only open/close behavior without preventing user interaction.

### Requirement 5: Use Svelte 5 Runes State Sharing Pattern

**User Story:** As a developer, I want the state sharing mechanism to follow established Svelte 5 runes patterns already used in the project, so that the implementation is consistent and maintainable.

#### Acceptance Criteria

1. THE Open_Endpoints_Set SHALL be implemented as a `.svelte.ts` rune module using `$state` for reactivity.
2. THE Open_Endpoints_Set module SHALL be importable using the `.svelte.js` extension convention (e.g., `import { openEndpoints } from '$lib/stores/openEndpoints.svelte.js'`).
3. THE Open_Endpoints_Set module SHALL expose an API consistent with the `appState` store pattern: getter properties for reading state and named functions for mutations.
