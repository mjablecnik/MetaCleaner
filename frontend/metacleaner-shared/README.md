# metacleaner-shared

Shared pricing UI, consumed by `metacleaner-app` and `metacleaner-web` via `workspace:*`.

## Exports

From the package root (`.`):

- **Components** — `BillingToggle`, `PricingCard`, `EnterpriseBanner`, `PricingHeaderSection` (top-level composition), `PricingPlansSection` (top-level composition)
- **Data** — `pricingRepository()`, `getEnterprise()`, `getPlanPrice()`
- **Types** — `Plan`, `EnterprisePlan`

Two narrower subpaths are also exported for consumers that only need one piece:

- `metacleaner-shared/types` — the `Plan`/`EnterprisePlan` types (`src/types/pricing.ts`)
- `metacleaner-shared/data` — the pricing data functions (`src/data/pricing.ts`)

`PricingHeaderSection` and `PricingPlansSection` are the two components consumers actually render; `BillingToggle`, `PricingCard`, and `EnterpriseBanner` are composed internally by those two.

## Usage

```ts
import { pricingRepository, getEnterprise, PricingHeaderSection, PricingPlansSection } from 'metacleaner-shared';
```

This is the single source of truth for plan data — do not duplicate pricing data locally in a consuming package.
