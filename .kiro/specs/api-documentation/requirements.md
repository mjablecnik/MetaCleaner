# Requirements Document

## Introduction

The API Documentation feature adds a responsive, authenticated page to the MetaCleaner app that provides developer documentation for the MetaCleaner API. The page displays structured content sections (Introduction, Authentication, Error Codes, Endpoints) with a sidebar navigation, code blocks with copy functionality, and info boxes. Content is initially served from hardcoded mock data with i18n support (Czech and English), and the page follows the existing dark navy theme. Only authenticated users can access this page, and it is linked from the app's main navigation menu.

## Glossary

- **Docs_Page**: The SvelteKit route page at `/docs` within the MetaCleaner app that renders the API documentation content
- **Sidebar**: A fixed-position left navigation panel visible on desktop viewports (lg+) that lists documentation section links with scrollspy-style active state highlighting
- **Scrollspy**: A UI behavior where the Sidebar visually indicates which content section is currently in the viewport as the user scrolls
- **Code_Block**: A styled pre-formatted text container displaying code snippets (cURL commands, JSON examples, authorization headers) with syntax-highlighted text on a dark background
- **Copy_Button**: An interactive button within a Code_Block that copies the code content to the user's clipboard when clicked
- **Info_Box**: A colored alert-style container used to highlight tips, warnings, or important notes — available in blue (info), green (success), orange (warning), and red (danger) variants
- **Feature_Card**: A small card component displaying an icon, title, and description, used in a grid layout to showcase API capabilities
- **Quick_Start_Flow**: A vertical step-by-step visual guide showing numbered steps connected by lines, illustrating the API call sequence
- **Error_Table**: A structured table displaying HTTP status codes, error codes, descriptions, and recommended solutions
- **Docs_Data**: The hardcoded/mock data structure containing all documentation content (sections, code examples, error codes, endpoints) that the Docs_Page renders
- **Section**: A top-level content block within the documentation (Introduction, Authentication, Error Codes) identified by a unique anchor ID for navigation
- **Frontend**: The SvelteKit 5 web application at `frontend/metacleaner-app/`
- **NavBar**: The shared navigation bar component displayed on all authenticated pages of the Frontend
- **Auth_Guard**: The client-side routing mechanism that redirects unauthenticated users to the login page

---

## Requirements

### Requirement 1: Route and Access Control

**User Story:** As an application owner, I want the API documentation page accessible only to authenticated users, so that API details are not exposed publicly.

#### Acceptance Criteria

1. THE Frontend SHALL serve the Docs_Page at the `/docs` route path
2. WHEN an unauthenticated user navigates to `/docs`, THE Auth_Guard SHALL redirect the user to the `/login` page with a `returnTo` query parameter set to `/docs`
3. WHEN an authenticated user navigates to `/docs`, THE Frontend SHALL render the Docs_Page with full documentation content
4. THE Docs_Page SHALL set a localized `<title>` meta tag that contains the application name and a term identifying the page as API documentation

---

### Requirement 2: Navigation Menu Integration

**User Story:** As an authenticated user, I want to access the API documentation from the app menu, so that I can find it without knowing the URL.

#### Acceptance Criteria

1. IF the user is authenticated, THEN THE NavBar SHALL display a navigation item labeled with the localized documentation link text, linking to the `/docs` route, on both desktop (inline in the navigation area) and mobile (within the hamburger menu) layouts
2. IF the user is not authenticated, THEN THE NavBar SHALL NOT display the documentation navigation item
3. WHEN the user is on the `/docs` route, THE NavBar navigation item for documentation SHALL be indicated as active by applying the `brand-blue` text color (matching the existing active-state pattern used in the app's navigation)
4. THE Docs_Page NavBar SHALL display a back button that navigates the user to the home page (`/`), rendered as an arrow-left icon button on mobile and a labeled button with arrow-left icon on desktop (consistent with the existing NavBar back button pattern)

---

### Requirement 3: Page Layout and Responsive Design

**User Story:** As a developer, I want the documentation page to be usable on both desktop and mobile devices, so that I can read API docs on any screen.

#### Acceptance Criteria

1. WHILE the viewport width is at the `lg` breakpoint (1024px) or above, THE Docs_Page SHALL display the Sidebar as a sticky left-side panel with a fixed width of 224px (Tailwind `w-56`), positioned below the navigation bar (sticky offset equal to the navbar height plus 16px spacing), alongside the main content area separated by a 32px gap
2. WHILE the viewport width is below the `lg` breakpoint, THE Docs_Page SHALL hide the Sidebar and display the main content in a single-column full-width layout
3. THE Docs_Page SHALL constrain the page content (navbar inner container, sidebar + main area wrapper) to a maximum width of 1200px and center it horizontally within the viewport
4. THE Docs_Page main content area SHALL not produce a horizontal scrollbar at any viewport width from 320px to the maximum supported display width
5. THE Docs_Page SHALL use the existing shared application layout (NavBar with user dropdown, language switcher) — it SHALL NOT render a separate custom navigation bar. An "API" text badge and a version indicator badge SHALL be displayed within the docs page content area (below the NavBar, above the sidebar and main content)

---

### Requirement 4: Sidebar Navigation with Scrollspy

**User Story:** As a developer reading the documentation, I want a sidebar that highlights the current section as I scroll, so that I always know where I am in the document.

#### Acceptance Criteria

1. THE Sidebar SHALL list all top-level Sections (Introduction, Authentication, Error Codes) as clickable navigation links, each preceded by a Font Awesome icon matching the section topic
2. THE Sidebar SHALL list API endpoint entries (Upload, Clean, Status, Download, Metadata, Delete) grouped under an "Endpoints" heading, each prefixed with their HTTP method badge color-coded as follows: POST in blue, GET in green, DEL in red
3. WHEN the user clicks a Sidebar navigation link, THE Docs_Page SHALL smooth-scroll the main content area to the corresponding Section anchor, offsetting the scroll position by the sticky navbar height so the section heading is not hidden behind the header
4. WHILE the user scrolls through the main content, THE Sidebar SHALL highlight exactly one navigation link at a time — the link corresponding to the topmost Section whose heading has crossed into the visible viewport area below the sticky navbar
5. THE Sidebar active state SHALL be indicated by blue text color on the active link and muted gray text color on all inactive links, with a color transition duration of no more than 200ms

---

### Requirement 5: Introduction Section Content

**User Story:** As a developer, I want an introduction section explaining the API basics, so that I can understand the service capabilities and get started quickly.

#### Acceptance Criteria

1. THE Introduction Section SHALL display a descriptive paragraph explaining the API purpose (metadata cleaning, supported operations, file processing)
2. THE Introduction Section SHALL display the API base URL in a Code_Block with a Copy_Button
3. THE Introduction Section SHALL display exactly 3 Feature_Cards in a responsive grid (3 columns at the `lg` breakpoint and above, stacking to a single column below `lg`), each card containing an icon, a title, and a short description summarizing a distinct API capability
4. THE Introduction Section SHALL display a list of supported file formats as styled badges (JPG, PNG, HEIC, WEBP, MP4, MOV)
5. THE Introduction Section SHALL display the Quick_Start_Flow with 4 numbered steps in sequence — (1) Upload: showing the upload endpoint and the `file_id` response identifier, (2) Clean: showing the clean endpoint and the `job_id` response identifier, (3) Status: showing the job status endpoint and the `completed` state indicator, (4) Download: showing the file download endpoint
6. THE Introduction Section SHALL display an Info_Box (orange/warning variant) explaining the API rate limits, stating the numeric requests-per-minute limit and that the API returns HTTP 429 when the limit is exceeded, including that the limit resets every minute

---

### Requirement 6: Authentication Section Content

**User Story:** As a developer, I want a clear explanation of how to authenticate API requests, so that I can integrate the API into my application securely.

#### Acceptance Criteria

1. THE Authentication Section SHALL display a text explanation stating that the API uses Bearer token authentication and that every request must include a valid API key in the HTTP `Authorization` header
2. THE Authentication Section SHALL display the Authorization header format as `Authorization: Bearer YOUR_API_KEY` in a Code_Block with a Copy_Button
3. THE Authentication Section SHALL display an Info_Box (blue/info variant) explaining that API keys are generated in the user's account under "Settings → API Keys" and that the key is shown only once at creation time
4. THE Authentication Section SHALL display a cURL example of an authenticated GET request in a Code_Block with a Copy_Button, including the HTTP method, a sample API endpoint URL, and the Authorization header with a placeholder API key value
5. THE Authentication Section SHALL display a security best practices list with exactly 4 recommendations: (1) never include API keys in client-side code, (2) store keys as environment variables or use a secrets manager, (3) revoke and regenerate compromised keys immediately, (4) all communication uses HTTPS and HTTP requests are rejected
6. THE Authentication Section SHALL display exactly 2 authentication error response examples as Code_Blocks: a 401 Unauthorized response and a 403 Forbidden response, each showing a JSON object containing a "status", "code", and "message" field
7. THE Authentication Section SHALL display all user-visible text (headings, descriptions, labels, info box content, and best practice items) in both English and Czech via the i18n system

---

### Requirement 7: Error Codes Section Content

**User Story:** As a developer, I want a complete reference of error codes and their meanings, so that I can handle API errors programmatically.

#### Acceptance Criteria

1. THE Error Codes Section SHALL display a JSON example of the standard error response structure in a Code_Block, showing the fields `status`, `code`, `message`, and optional `details` with sample values
2. THE Error Codes Section SHALL display an HTTP status code overview grid with 3 color-coded Info_Boxes — one for 2xx (success, green variant), one for 4xx (client error, orange variant), and one for 5xx (server error, red variant) — each containing the category label and a one-sentence explanation of when that category applies
3. THE Error Codes Section SHALL display the Error_Table with columns for HTTP status, error code, description, and recommended solution
4. THE Error_Table SHALL include at minimum 8 entries covering all 5 error categories: validation errors (invalid input, unsupported format), authentication errors (unauthorized, forbidden), rate limit errors (429 too many requests), not found errors (resource not found), and server errors (internal server error)
5. THE Error Codes Section SHALL display an Info_Box (blue/info variant) explaining the retry strategy for 429 and 5xx responses, including the recommendation to use exponential backoff and a maximum number of retry attempts

---

### Requirement 8: Endpoint Detail Sections

**User Story:** As a developer, I want detailed documentation for each API endpoint, so that I know exactly how to call each endpoint, what parameters to send, and what responses to expect.

#### Acceptance Criteria

1. THE Docs_Page SHALL display a dedicated Endpoint_Card section for each of the 6 API endpoints: Upload (`POST /files/upload`), Clean (`POST /files/clean`), Status (`GET /jobs/{job_id}/status`), Download (`GET /files/{file_id}/download`), Metadata (`GET /files/{file_id}/metadata`), and Delete (`DEL /files/{file_id}`)
2. EACH Endpoint_Card SHALL display a collapsible header row containing: the HTTP method as a color-coded badge (POST in blue, GET in green, DEL in red), the endpoint path in monospace font, a short localized description, and a chevron icon indicating expand/collapse state
3. WHEN the user clicks an Endpoint_Card header, THE card SHALL toggle between expanded (showing full details) and collapsed (showing only the header row) states with the chevron rotating to indicate the current state
4. THE Endpoint_Cards for Upload (`POST /files/upload`), Clean (`POST /files/clean`), and Status (`GET /jobs/{job_id}/status`) SHALL display full details: (a) a localized description paragraph, (b) request headers in a Code_Block, (c) a parameters/request body table with columns for field name, type, required/default, and description, (d) a cURL example in a Code_Block with a Copy_Button, and (e) response examples showing both success and error responses as side-by-side Code_Blocks with HTTP status badges
5. THE Endpoint_Cards for Download, Metadata, and Delete SHALL display minimal details: (a) a localized description paragraph and (b) placeholder text indicating that full documentation will be available after backend integration
6. THE Endpoint_Card for `POST /files/clean` SHALL additionally display an options parameters table listing available cleaning options (strip_gps, strip_exif, strip_iptc) with their types, default values, and descriptions
7. THE Endpoint_Card for `GET /jobs/{job_id}/status` SHALL additionally display a list of possible job status values (pending, processing, completed, failed) as color-coded badges
8. THE Endpoint_Card border color SHALL change to brand-blue when the card is in the expanded (open) state, and revert to the default border color (gray-800) when collapsed
9. THE Endpoint_Cards SHALL be rendered in the main content area below the Error Codes section, each as a separate card with spacing between them

---

### Requirement 9: Code Blocks with Copy Functionality

**User Story:** As a developer, I want to copy code examples to my clipboard with one click, so that I can use them in my application without manual selection.

#### Acceptance Criteria

1. WHEN the user clicks a Copy_Button within a Code_Block, THE Frontend SHALL copy the plain-text content of the associated code (excluding HTML markup and styling) to the system clipboard
2. WHEN the clipboard copy operation succeeds, THE Copy_Button SHALL display a visual confirmation by changing its icon to a checkmark and applying brand-green color for a duration of 2 seconds before reverting to the default state (copy icon with text-muted color)
3. IF the clipboard API is unavailable or the copy operation fails, THEN THE Frontend SHALL not display an error to the user and the Copy_Button SHALL remain in its default state
4. THE Code_Block component SHALL render text in a monospace font with syntax-highlighted colors (brand-green for strings/URLs, brand-orange for values/variables, brand-blue for keys, white for general text) on a dark background (#080f1e) with a 1px border matching the navy-lighter token and rounded corners
5. IF the user clicks the Copy_Button while a confirmation state is already active (within the 2-second confirmation period), THEN THE Frontend SHALL restart the 2-second confirmation timer without triggering an additional clipboard write
6. THE Code_Block component SHALL display code content in a single scrollable region with horizontal overflow set to auto (horizontal scrollbar appears when content exceeds the block width) and no line wrapping

---

### Requirement 10: Mock Data Layer

**User Story:** As a developer building incrementally, I want documentation content served from a local mock data structure, so that the page works independently of any backend endpoint.

#### Acceptance Criteria

1. THE Docs_Data SHALL be defined as a typed TypeScript data structure (with explicit interfaces for each content type) containing documentation sections for Introduction, Authentication, Error Codes, and Endpoints, including section descriptions, code examples with their display text, endpoint detail data (method, path, description, request headers, parameters with type/required/default/description, cURL examples, success and error response examples), and error code entries with status, code, description, and solution fields
2. THE Docs_Data SHALL provide content in both Czech and English, driven by the current locale via the i18n system, such that switching locale causes all section titles, descriptions, info box text, and table cell values to render in the selected language
3. THE Docs_Page SHALL render all content from the Docs_Data without making any HTTP requests for documentation content (no fetch, XMLHttpRequest, or WebSocket calls for page data during initial render or locale switch)
4. THE Docs_Data SHALL be exported from a single TypeScript module that the rendering components import, so that replacing the static data source with an asynchronous backend fetch requires changes only to that module and not to any rendering component imports or template bindings

---

### Requirement 11: Internationalization

**User Story:** As a user, I want the API documentation displayed in my preferred language (Czech or English), so that I can read it comfortably.

#### Acceptance Criteria

1. THE Docs_Page SHALL render all user-facing text (section titles, descriptions, info box content, table headers, button labels) using the Paraglide i18n system based on the current locale
2. WHEN the user switches language via the language switcher, THE Docs_Page content SHALL update to the selected locale without a page reload, without displaying untranslated message keys or empty strings, and without changing the current scroll position
3. THE Docs_Page SHALL support Czech (`cs`) and English (`en`) locales
4. THE Code_Block content (URLs, cURL commands, JSON keys) SHALL remain in English regardless of the selected locale, as these represent technical API syntax

---

### Requirement 12: Visual Theme and Design Compliance

**User Story:** As a product owner, I want the documentation page to match the existing app design, so that the experience is visually cohesive.

#### Acceptance Criteria

1. THE Docs_Page SHALL use the existing dark navy theme colors (navy-main background, navy-card for cards, navy-lighter for inputs and badges, brand colors for accents)
2. THE Docs_Page SHALL use the Inter font family consistent with the rest of the application
3. THE Info_Box component SHALL support four color variants: blue (info), green (success), orange (warning), and red (danger), where each variant uses its corresponding brand color at 8% opacity for the background fill and 25% opacity for the border, with a border-radius of 10px
4. THE Docs_Page SHALL match the desktop layout structure shown in the design mockup at `.design/metacleaner-docs-desktop.html`, including a sticky sidebar navigation visible at the lg breakpoint (1024px) and above, and a main content area that fills the remaining width
5. THE Section headers SHALL display an 8×8 (32px) rounded-lg icon badge container with a 20% opacity brand-color background and 30% opacity brand-color border, containing a colored icon, followed by a title (text-2xl font-bold) and a subtitle description (text-xs text-muted), matching the design mockup pattern
6. WHILE the viewport width is below the lg breakpoint (1024px), THE Docs_Page SHALL hide the sidebar navigation and display only the main content area at full width
