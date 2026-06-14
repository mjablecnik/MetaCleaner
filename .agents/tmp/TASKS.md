# MetaCleaner Frontend — UI Refactoring Tasks

## Phase 0 — Theme / Design Tokens

- [x] 1. [HIGH] Add missing theme tokens to `src/routes/layout.css` @theme block: `--color-brand-green-10`, `--color-brand-green-35`, `--color-brand-green-darker`, `--color-brand-blue-15`, `--color-brand-orange-10`
- [x] 2. [HIGH] Replace all hardcoded inline color values in `src/routes/(auth)/email-verified/+page.svelte` with Tailwind theme utilities or CSS custom property references (30 inline style attributes)
- [x] 3. [HIGH] Replace hardcoded hex colors in `email-verified/+page.svelte` `<style>` block (#22c55e, #16a34a, #15803d) with `var(--color-*)` references

## Phase 1 — Shared Elements

No new shared elements needed — existing elements (Button, Badge, Card, IconContainer, ProgressBar, ToggleSwitch, Chip, AccordionCard, AuthTextInput) are sufficient.

## Phase 2 — Shared Components / Sections

No new shared components needed — the email-verified page reuses existing `AuthStatsRow`, `AuthNavbar`, `AuthLayout`, `TrustBadges` from `src/routes/(auth)/components/`.

## Phase 3 — Page-Specific Components and Sections

- [x] 4. [HIGH] Create `AnimatedCheckmark` component in `src/routes/(auth)/email-verified/components/` — animated SVG checkmark with pulsing green ring, accepts size prop
- [x] 5. [HIGH] Create `AnimatedCheckmark.stories.svelte` — states: SmallSize, LargeSize
- [x] 6. [HIGH] Create `VerificationStepper` component in `src/routes/(auth)/email-verified/components/` — 3-step progress indicator with horizontal/vertical orientation
- [x] 7. [HIGH] Create `VerificationStepper.stories.svelte` — states: Step1Active, Step2Active, AllDone, Vertical, Horizontal
- [ ] 8. [HIGH] Create `ActionCard` component in `src/routes/(auth)/email-verified/components/` — card with icon, title, description, optional badge for "what's next" actions
- [ ] 9. [HIGH] Create `ActionCard.stories.svelte` — states: CleanAction, ProUpgradeAction
- [ ] 10. [HIGH] Create `EmailVerifiedHeroSection` in `src/routes/(auth)/email-verified/sections/` — composes AnimatedCheckmark with title/subtitle
- [ ] 11. [HIGH] Create `EmailVerifiedProgressSection` in `src/routes/(auth)/email-verified/sections/` — composes VerificationStepper with responsive layout (horizontal on desktop, vertical on mobile)
- [ ] 12. [HIGH] Create `EmailVerifiedStatsSection` in `src/routes/(auth)/email-verified/sections/` — stats row using AuthStatsRow pattern with data from authRepository
- [ ] 13. [HIGH] Create `EmailVerifiedActionsSection` in `src/routes/(auth)/email-verified/sections/` — composes ActionCard instances and CTA buttons

## Phase 4 — Refactor Pages

- [ ] 14. [MEDIUM] Refactor `src/routes/(auth)/email-verified/+page.svelte` to compose sections (EmailVerifiedHeroSection, EmailVerifiedProgressSection, EmailVerifiedStatsSection, EmailVerifiedActionsSection) instead of inline code — reduce from ~520 lines to ~60 lines

## Final

- [ ] 15. Verify email-verified page renders correctly — no visual regressions, all theme tokens applied, no hardcoded color values remain
- [ ] 16. Verify Storybook builds successfully with all new stories (`bun run build-storybook`)
