# MetaCleaner Web — Page Build Tasks

Reproduce each design pixel-perfectly. Mobile + desktop variants of the same page are ONE responsive page. Shared design system (colors, Inter font, navbar, footer, language switcher) is documented in `PAGES.md`. Default language Czech; keep `data-cs`/`data-en` multilingual text.

- [x] 1. Create the **Home** page — responsive landing page with navbar, hero (gradient headline + animated dashed upload card + Try-free/Download CTAs), "Why It Matters" before/after metadata comparison + risk stats, "How It Works" 3 steps, "Who Is It For" (6 cards desktop / 4 mobile), FAQ accordion, and footer. Mobile adds a sticky navbar + slide-in menu drawer with overlay, language selector and Přihlásit/Registrace buttons.
  Design: `.design/home-desktop.html`, `.design/home-mobile.html`, `.design/menu-mobile.html` (mobile nav drawer open-state).

- [x] 2. Create the **Features** page — responsive showcase of 6 tools (01 EXIF Metadata Removal, 02 AI Tool Detection, 03 C2PA Removal, 04 Risk Scanner, 05 Batch Processing, 06 PDF Report), each with eyebrow/title/description and chips or check-bullets. Desktop: alternating 2-column rows with CSS + PNG illustrations. Mobile: stacked feature cards (no illustrations) + a "Začněte zdarma" CTA card. Includes header, navbar (Funkce active) and multi-column footer with social icons.
  Design: `.design/features-desktop.html`, `.design/features-mobile.html`.

- [x] 3. Create the **Pricing** (Ceník) page — responsive pricing with monthly/yearly billing toggle (−20%) and 4 plan cards (Zdarma €0, 50 fotek €4, Pro €5,99 featured w/ glow + "Nejoblíbenější", Pro+ €12,99 "Připravujeme"), plus an Enterprise banner and slim footer. Wire `setBilling()` to swap Pro/Pro+ prices to yearly totals and reveal struck-through original + green savings. Desktop: 4-col grid with raised Pro card; mobile: stacked compact cards.
  Design: `.design/pricing-desktop.html`, `.design/pricing-mobile.html`.

- [ ] 4. Wire up navigation — ensure the shared navbar (logo → Home; Jak to funguje → Home `#how-it-works`; Funkce → Features; Ceník → Pricing; FAQ → Home `#faq`), footer links, mobile menu drawer, and CTAs route correctly across all pages, the active link is highlighted per page, and the language switcher + localStorage persistence work site-wide.
