# Pages — MetaCleaner App Settings

## 1. Settings Page

**Design files:** `metacleaner-settings-desktop.html`, `metacleaner-settings-mobile.html`

**Purpose:** Account settings page where authenticated users manage their profile information, change password, view/copy API keys, and manage their affiliate program.

---

### Navigation

- **Top navbar** with:
  - MetaCleaner brand logo (blue shield icon `fa-shield-halved` in a 40px/32px rounded square with `shadow-glow-blue`) + "MetaCleaner" text (bold, tracking-tight)
  - "Zpět na čištění" (Back to cleaning) button — left arrow icon + text, styled as `bg-navy-lighter border border-gray-700 rounded-lg`
  - User dropdown button — avatar image (rounded-full, `border border-brand-blue/40`) + user name "Jana Nováková" + chevron-down icon
  - User dropdown menu: shows email ("Přihlášen jako" / "jana.novakova@email.cz"), "Nastavení" link with gear icon, "Odhlásit se" (logout) link in red with `fa-right-from-bracket` icon

---

### Page Header

- Large gear icon (`fa-gear`) in a rounded-2xl container with `bg-brand-blue/10 border-2 border-brand-blue/40`
- Title: "Nastavení účtu" — `text-3xl font-bold text-white` (desktop), `text-xl font-bold` (mobile)
- Subtitle: "Spravujte svůj profil, bezpečnost a API přístup" — `text-sm text-text-muted`
- Last login badge (desktop only): clock icon + "Poslední přihlášení: dnes, 09:41" — `bg-navy-card border border-gray-800 rounded-xl px-4 py-2.5`

---

### Section: Account Info ("Informace o účtu")

**Card header:** User circle icon (`fa-circle-user`, brand-blue) in icon container + title "Informace o účtu" + subtitle "Základní údaje profilu"

**Content:**
- Avatar display: 64×64px rounded-2xl image with `border-2 border-brand-blue/40`, small blue edit button (pen icon) positioned absolutely at bottom-right
- User name: "Jana Nováková" (bold, white)
- Email: "jana.novakova@email.cz" (text-muted, xs)
- Badges row: "Pro plán" (green badge, uppercase, 9px) + "Ověřen" (blue badge, uppercase, 9px)
- Form fields:
  - "Jméno" (Name) — text input, value "Jana Nováková"
  - "E-mail" — email input, value "jana.novakova@email.cz"
  - "Společnost (volitelné)" (Company, optional) — text input, placeholder "Název vaší firmy"
- Save button: "Uložit změny" — full width, `bg-brand-blue`, white text, bold, `shadow-glow-blue`, floppy-disk icon

**Input styling:** `px-4 py-2.5` (desktop) / `px-4 py-3` (mobile), `rounded-xl bg-navy-main border border-gray-700 text-sm text-white`, focus: `border-brand-blue`

**Labels:** `text-xs font-semibold text-text-muted uppercase tracking-wider`

---

### Section: Change Password ("Změna hesla")

**Card header:** Lock icon (`fa-lock`, brand-blue) in icon container + title "Změna hesla" + subtitle "Aktualizujte své přihlašovací heslo"

**Content:**
- "Současné heslo" (Current password) — password input with eye toggle button
- "Nové heslo" (New password) — password input with eye toggle + password strength bar below
  - Strength bar: `h-1.5 rounded-full bg-navy-main` container, inner fill with transition (colors: red=weak, orange=average, blue=good, green=strong)
  - Strength label: `text-[10px] text-text-muted` (Slabé / Průměrné / Dobré / Silné)
- "Potvrdit nové heslo" (Confirm new password) — password input with eye toggle
- Save button: "Uložit nové heslo" — full width, `bg-brand-green`, white text, bold, `shadow-glow-green`, check icon

**Eye toggle:** Positioned absolutely at `right-3 top-1/2 -translate-y-1/2`, `fa-eye` icon, `text-text-muted hover:text-white`

---

### Section: API Keys ("API klíče")

**Card header:** Code icon (`fa-code`, brand-green) in icon container + title "API klíče" + subtitle "Přístup k Settiq REST API endpointům"

**Content:**

**Production Key card:**
- `bg-navy-main rounded-xl border border-gray-800 p-4`
- Header row: green pulsing dot (`w-2 h-2 rounded-full bg-brand-green animate-pulse`) + "Production Key" label (white, xs, semibold) + "Aktivní" badge (green, uppercase, 9px)
- Key input: `type="password"`, readonly, monospace font, value "sk_live_a8f3k2m9x1qw5e7r0tyu6io4p"
- Action buttons row: eye toggle (navy-lighter bg, gray border) + copy button (`bg-brand-blue/10 border border-brand-blue/20`, blue copy icon)
- Metadata: "Vytvořen: 15. 4. 2025 · Použit: 2. 6. 2025" — `text-[10px] text-text-muted`

**Test Key card:**
- `bg-navy-main rounded-xl border border-dashed border-gray-700 p-4` (dashed border distinguishes from production)
- Header row: gray dot (not pulsing) + "Test Key" label (text-muted) + "Sandbox" badge (gray)
- Key input: same style, value "sk_test_z9d4n7h2s6bv1cx3lm8poq0wr"
- Same action buttons (eye + copy)

---

### Section: Affiliate Program ("Affiliate program")

**Card header:** Users icon (`fa-users`, brand-orange) in icon container + title "Affiliate program" + subtitle "Sdílejte odkaz a získejte provizi" + "Aktivní" badge (orange, uppercase, auto-positioned right)

**Content:**
- Stats grid (3 columns):
  - "7" (brand-orange, 2xl, font-black) — label "Referrals" (10px, muted)
  - "3" (brand-green, 2xl, font-black) — label "Konverze" (10px, muted)
  - "€12" (white, 2xl, font-black) — label "Výdělek" (10px, muted)
  - Each stat: `bg-navy-main rounded-xl border border-gray-800 p-3 text-center`
- Affiliate link field:
  - Label: "Váš affiliate odkaz"
  - Input (readonly, monospace): "https://settiq.io/ref/jana-novakova"
  - "Kopírovat" button: `bg-brand-orange/10 border border-brand-orange/30 text-brand-orange`, copy icon + text
- Info box: `bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-3`
  - Info circle icon (orange) + text: "Za každého platícího zákazníka získáte **20% provizi** po dobu 12 měsíců. Výplata probíhá každý měsíc."

---

### Desktop Layout

- Max width: `1100px`, centered with `mx-auto px-6`
- Two-column grid: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- **Left column:** Account Info card → Password card → Affiliate card (stacked vertically, `gap-6`)
- **Right column:** API Keys card (stacked vertically, `gap-6`)
- All sections always visible (no accordion behavior on desktop)
- Page header spans full width above the grid, with last-login badge on the right (`flex-row justify-between`)
- Navbar: transparent background, max-width 1100px, `px-6 py-5`
- Toast notification: fixed bottom-right (`bottom: 32px, right: 32px`)

---

### Mobile Layout

- Full width, `max-w-lg mx-auto px-4`
- Single column, all cards stacked vertically with `gap-4`
- **Accordion behavior:** Each section is collapsible with chevron-down icon that rotates on open. Only "Account Info" is open by default; others are collapsed.
- Navbar: sticky top, `bg-navy-card border-b border-gray-800`, `px-4 py-3.5`
  - Back button: icon-only (no text), `w-9 h-9 rounded-lg`
  - User name hidden (only avatar + chevron)
  - Logo smaller: `w-8 h-8` icon, `text-base` brand text
- Page header: compact, icon 44×44px (`w-11 h-11`), title `text-xl`, no last-login badge
- Form fields: full width (not 2-column grid for name/email), `py-3` padding (slightly taller touch targets)
- API key action buttons: `w-11 h-11` (larger touch targets)
- Toast notification: fixed bottom-center (`left: 50%, transform: translateX(-50%)`)
- Save buttons: `active:scale-95 transition-transform` for tap feedback

---

### Breakpoint Behavior

- At `lg:` (1024px+): switches from single column to two-column grid
- At `sm:` (640px+): page header switches from column to row layout, "Zpět na čištění" text becomes visible
- At `md:` (768px+): user name in navbar becomes visible
- Below `lg:`: sections become accordions (collapsible), single column stacking
- Mobile navbar gets sticky positioning with card background + bottom border

---

### Animations

- `fadeInUp` animation on all cards (0.5s ease, translateY 20px→0 with opacity 0→1)
- Staggered delays: `.delay-1` (0.1s), `.delay-2` (0.2s), `.delay-3` (0.3s), `.delay-4` (0.4s), `.delay-5` (0.5s)
- Dropdown menu: instant show/hide via `.open` class toggle
- Modal: `modalIn` animation (0.25s, scale 0.95→1 + translateY 10→0 + opacity)
- Toast: slide-up transition (0.3s ease), auto-dismiss after 3s
- Shake animation on delete confirmation modal (0.4s)

---

### Color Scheme & Typography

- **Background:** `#0a1628` (navy-main)
- **Card backgrounds:** `#111d33` (navy-card)
- **Input/lighter surfaces:** `#1e293b` (navy-lighter) or `navy-main` for inputs inside cards
- **Borders:** `border-gray-700` (inputs), `border-gray-800` (cards, sections)
- **Primary text:** `#ffffff` (white)
- **Secondary text:** `#94a3b8` (text-muted)
- **Accent colors:** Blue (`#3b82f6`) for primary actions, Green (`#22c55e`) for success/password save, Orange (`#f97316`) for affiliate, Red (`#ef4444`) for danger/logout
- **Font:** Inter, weights 400–800
- **Card corner radius:** `rounded-2xl` (16px)
- **Input corner radius:** `rounded-xl` (12px)
- **Shadows:** `shadow-card` on all section cards, `shadow-glow-blue`/`shadow-glow-green` on CTA buttons

---

### Interactive Elements

- Password visibility toggles (eye icon)
- Password strength meter (realtime evaluation: length≥8, uppercase, digit, special char)
- Copy-to-clipboard buttons (API keys, affiliate link) with toast confirmation
- User dropdown menu (open/close on click, close on outside click)
- Accordion expand/collapse (mobile only) with chevron rotation
- Toast notifications (success green border, error red border), auto-dismiss 3s
- Delete account modal (referenced in styles but not visible in current design — likely accessible via a button not shown)
