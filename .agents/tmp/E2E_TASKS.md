# E2E Tasks — metacleaner-web

Framework: **Playwright**. Test files must match `**/*.e2e.{ts,js}` (use `.e2e.ts`).
Web server: `npm run build && npm run preview` on port 4173 (handled by
`playwright.config.ts`). All tests run **headless**. **No API mocking required** —
this is a fully static marketing site with no `fetch()` calls.

## Phase 0 — Cleanup

- No orphaned E2E tests to remove. (This project has no existing E2E tests; the
  `e2e/*.spec.ts` suite referenced in `.agents/UI_TEST_REPORT.md` belongs to the
  separate `metacleaner-app` project, not `metacleaner-web`.)

## Phase 1 — Fix failing tests

- No failing E2E tests. (No E2E tests currently exist in this project.)

## Phase 2 — Create missing E2E tests

- [x] Create E2E test for **Home `/`** (`e2e/home.e2e.ts`) — assert: title
      `MetaCleaner — Protect Your Privacy`; sections `#hero`, `#why-it-matters`,
      `#how-it-works`, `#who-its-for`, `#faq` present; hero headline
      `Protect Your Privacy` + badge `100% local processing`; upload card heading
      `Clean Files` with format badges JPG/PNG/HEIC/WEBP; 6 audience cards.
      mock: none.
- [x] Create E2E test for **Home FAQ accordion interaction** (in `home.e2e.ts` or
      `home-faq.e2e.ts`) — click a FAQ question button → its answer becomes visible
      (`{#if open}`); click again → answer hidden. Use exact question text on the
      `button`. mock: none.
- [x] Create E2E test for **Features `/features`** (`e2e/features.e2e.ts`) —
      assert: title `MetaCleaner — Features`; `#features-header` with title
      `Complete toolkit`; all 6 feature sections present
      (`#feature-exif`, `#feature-ai`, `#feature-c2pa`, `#feature-risk`,
      `#feature-batch`, `#feature-pdf`) each rendering its title; `#cta-section`
      with `Get started for free`. mock: none.
- [x] Create E2E test for **Pricing `/pricing`** (`e2e/pricing.e2e.ts`) — assert:
      title `MetaCleaner — Pricing`; header `Pricing` + subtitle
      `Simple pricing. Credits never expire.`; 4 plan cards (`Free` €0,
      `50 photos` €4, `Pro` with `Most Popular`, `Pro+` with `Coming soon`);
      enterprise banner `Enterprise — custom` + `Contact us →`. mock: none.
- [x] Create E2E test for **Pricing billing toggle interaction** (in
      `pricing.e2e.ts`) — default monthly (Pro price `€5,99`); click `Yearly` →
      Pro price updates to `€57,51` (yearly badge `−20%` shown); click `Monthly` →
      reverts to `€5,99`. mock: none.
- [x] Create **navigation test** (`e2e/navigation.e2e.ts`) — verify desktop navbar
      links (scope to `nav.hidden.md\\:flex`): brand→`/`, `Features`→`/features`,
      `Pricing`→`/pricing`, `How it Works`→`/#how-it-works`, `FAQ`→`/#faq`; verify
      footer real links (`/features`, `/pricing`, `/#how-it-works`, `/#faq`)
      navigate correctly and active page state updates. Run at desktop viewport.
      mock: none.
- [x] Create **mobile menu / hamburger test** (`e2e/mobile-menu.e2e.ts`) — at 375px:
      hamburger (`getByRole('button', { name: 'Open menu' })`) opens `MobileMenu`;
      on **home** assert `drawer` variant anchors (`#how-it-works`,
      `#why-it-matters`, `#who-its-for`, `#faq`) and close (✕) button works; on
      **/features** & **/pricing** assert `dropdown` variant links (`/features`,
      `/pricing`, `/#how-it-works`, `/#faq`); verify menu closes after navigation.
      mock: none.
- [x] Create **responsive test for all pages** (`e2e/responsive.e2e.ts`) —
      viewports: **mobile 375px**, **desktop 1280px**. At 375px: `MobileNavbar`
      (`nav.md\\:hidden`) visible, desktop `nav.hidden.md\\:flex` hidden, mobile
      footer visible. At 1280px: desktop nav visible, `MobileNavbar` hidden, desktop
      footer grid visible. Apply across `/`, `/features`, `/pricing`. mock: none.

## Notes

- **Strict mode / dual variants:** components render both mobile and desktop markup
  (one hidden via Tailwind `md:` classes). Scope selectors to the visible container
  or use `{ exact: true }` / `.first()` to avoid strict-mode violations. Breakpoint
  is `md` = 768px.
- **Locale:** assertions above use base-locale (`en`) strings. Set the locale
  deterministically (localStorage/cookie) so Paraglide renders `en`, or the
  `cs` translations will break text matches.
- **No upload flow:** the home `UploadCard` is a static marketing mock with no file
  input — do not attempt a real upload interaction.
