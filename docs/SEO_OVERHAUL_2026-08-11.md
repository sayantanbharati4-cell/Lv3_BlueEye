# SEO Overhaul — Inventory Cleanup (2026-08-11)

**Branch:** `feat/seo-inventory-cleanup`
**Status:** Complete (all 5 phases committed, awaiting merge to `main`)
**Commits (oldest → newest):** `d233c68`, `4274538`, `76d01ed`, `98f58c3`, `19e1d71`, `3f6f2fb`

> Every change below is **query/rendering-only — no database writes, no schema changes, no data migration.**

---

## Why this was done

The site generates SEO pages from artist inventory. Three problems existed:

1. **Thin content:** categories/cities with 1–2 artists produced low-value indexed pages.
2. **Wrong city buckets:** DB stores city variants (`Delhi`, `New Delhi`, `Delhi NCR`, `East Delhi`) as separate buckets, so a `/city/delhi` page showed only a fraction of Delhi artists.
3. **Outdated claims:** the About page hardcoded "20,000+ artists / 300+ cities" regardless of real inventory.

---

## Phase 1 — Expanded alias maps

**Commit:** `d233c68` · File: `lib/services/searchService.ts`

- Enlarged `CITY_ALIASES` (normalizes `New Delhi`/`Delhi NCR`/`East Delhi`/… → `Delhi`) and `CITY_BLOCKLIST` (rejects junk/non-city values like `India`, `Virtual`, `All over India`).
- Used at query time by `normalizeCity()`.

## Phase 2 — Reverse-alias city matching

**Commit:** `4274538` · File: `lib/services/searchService.ts`

- `getArtists`, `searchArtists`, `suggestArtists` now use `getCityVariants(city)` → match **any stored variant** of the canonical city, not just exact string.
- Verified with temp script (pre-merge): Delhi 2327, Mumbai 2943, Bangalore 734, Kolkata 607, Pune 342 artists, etc.

## Phase 3 — Thin content control

**Commit:** `76d01ed` · Files: `lib/services/searchService.ts`, `app/category/[category]/page.tsx`, `app/city/[city]/page.tsx`

- New constant `MIN_CITY_ARTISTS = 2`; `getDistinctCities()` now returns **only cities with ≥2 artists**.
- Category & city pages call `notFound()` for slugs not in the distinct lists (true 404 instead of empty pages).
- Sitemap automatically drops thin-city URLs because it consumes the same filtered lists.

## Phase 4 — Real stats everywhere

**Commit:** `98f58c3` · Files: `lib/services/statsService.ts` (new), `app/about/page.tsx`, `app/api/stats/route.ts`

- New `getRealStats()` — single source of truth: distinct categories, cities (≥2 artists), and artist count.
- About page now shows **live numbers** (removed hardcoded "20,000+ artists / 300+ cities").
- `/api/stats` uses the same service.

## Phase 5 — Localized SEO copy + category × city combo pages

**Commits:** `19e1d71`, `3f6f2fb` · Files: `lib/seo/content.ts`, `app/category/[category]/page.tsx`, `app/category/[category]/[city]/page.tsx` (new), `app/sitemap.ts`

**5a — Hand-written city scenes:** `getCityEventScene()` now has bespoke copy for 30 top cities (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Chandigarh, Jaipur, Lucknow, Ahmedabad, Goa, Panaji, Guwahati, Kochi, Indore, Nagpur, Ludhiana, Bhopal, Surat, Jodhpur, Varanasi, Kanpur, Patna, Shimla, Nashik, Amritsar, Dehradun, Rajkot, Ranchi, Noida); graceful fallback for the rest.

**5b — Plural labels:** `pluralizeCategory()` + `PLURAL_EXCEPTIONS` (e.g. `dj → DJs`, `celebrity appearance → Celebrity Appearances`); category page buttons now say `Hire DJs ↗` instead of `Hire DJs ↗`… (previously `Hire djs ↗`).

**5c — Combo pages:** new route `/category/{category}/{city}` (e.g. `/category/dj/mumbai`), SSG over `getCategoryCityCounts(3)` (only combos with ≥3 artists):
- Breadcrumb `Home / Artists / Category / City`
- ItemList JSON-LD, paginated artist grid, `pageMetadata` with OG images
- `comboSeoContent()` blends the city scene + category copy
- Internal-linking chip rows: other combos of same category/city
- Added to `sitemap.ts` (priority 0.7, weekly)

---

## Rollback

Each commit is independent and revertable:

```
git revert <sha>       # per phase
git branch -D feat/seo-inventory-cleanup   # discard branch entirely
```

No data was touched, so rollback is purely code-level.

## Verification

- `npx tsc --noEmit` passes.
- `npm run build` passes (all combo routes registered in output).
- Sanity-checked city counts via temp script before Phase 2 commit (script deleted afterwards).
