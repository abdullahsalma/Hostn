# Hostn — Website Audit Report

> **Date:** 2026-04-14
> **Audited by:** Claude (code + live site inspection)
> **Status:** Findings only — no fixes applied

---

## How to use this file

- Each issue has a severity, page/file, and description.
- Mark issues as `Fixed` once resolved, with the date and PR/commit.
- Add new issues as they're discovered.

---

## Critical

| # | Page / File | Issue | Status |
|---|-------------|-------|--------|
| A1 | `/contact` page (`app/contact/page.tsx` line 29-33) | **Contact form doesn't send data** — `setTimeout` simulates success, form data is discarded. No backend API call. | Open |
| A2 | `/host/bookings` page | **"held" bookings missing** — Host dashboard shows 2 bookings but bookings page only shows 1 (the "held" booking is filtered out) | Open |
| A3 | `/host/bookings` page | **Amount column shows "-"** — No amount displayed for confirmed booking (SAR 1,898 visible on dashboard) | Open |

---

## Medium — Data / Display Bugs

| # | Page / File | Issue | Status |
|---|-------------|-------|--------|
| A4 | `/search/[id]` detail page | **BookingWidget doesn't show discount** — Shows SAR 2,000/night (original) even though card shows "50% OFF → SAR 1,000". Discount not applied in widget price header | Open |
| A5 | `/search/[id]` detail page | **"1 properties" grammar** — Host info section says "1 properties" instead of "1 property" | Open |
| A6 | `/host` dashboard | **"held" status unstyled** — Plain lowercase text with no badge styling, unlike "Confirmed" which has a green badge | Open |
| A7 | `/host/earnings` page | **"1 Bookings" grammar** — Should be "1 Booking" (singular) | Open |
| A8 | `/host/earnings` page | **Monthly amounts not shown** — SAR icon visible but no actual number next to it | Open |
| A9 | `/host` dashboard | **Average Rating shows "0.0"** — Looks like broken data. Should show "No ratings yet" or be hidden when no reviews exist | Open |
| A10 | `/host/bookings` page | **Actions column empty** — Shows "-" with no available actions for any booking | Open |
| A11 | `/` home page | **Massive blank whitespace** — Enormous vertical gap between hero section and "Browse by Type" / "Featured Stays" sections | Open |
| A12 | `/search/[id]` detail page | **Image gallery layout gap** — ~300px empty space on the left between title area and images; gallery appears right-aligned | Open |

---

## Medium — Bilingual / Language Issues

| # | Page / File | Issue | Status |
|---|-------------|-------|--------|
| A13 | All pages | **Browser tab title is Arabic** when page content is displayed in English mode | Open |
| A14 | All pages | **Username always Arabic** — "عبقور" shows in Arabic in English-mode header and sidebar | Open |
| A15 | `/dashboard/bookings` | **Property names in Arabic** while page UI is English (e.g. "فندق كراون انمارآ") | Open |
| A16 | `/host` dashboard | **Guest names in Arabic** — "ضيف", "مشرف" shown in Arabic while table is English | Open |
| A17 | `/host` dashboard | **Date format inconsistent** — Uses M/DD/YYYY (4/18/2026) vs "Apr 18, 2026" format used elsewhere | Open |
| A18 | `/search/[id]` detail page | **"Hosted by" mixed language** — English label followed by Arabic name while in English mode | Open |

---

## Low — Code Quality / UX

| # | Page / File | Issue | Status |
|---|-------------|-------|--------|
| A19 | `lib/searchCookies.ts` | **Missing `type` in SearchCookieParams interface** — Code uses `saved.type` in search page but it's not typed | Open |
| A20 | Multiple files | **Duplicate inline translation objects** — Scattered `const t = {...}` objects instead of centralized translations | Open |
| A21 | `search/page.tsx` | **Silent fetch failures** — `.catch(() => setUnits([]))` with no error toast or UI feedback | Open |
| A22 | Some files | **localStorage access without `typeof window` guard** — `auth/page.tsx`, `contact/page.tsx` access directly, risk SSR errors | Open |
| A23 | `/host/earnings` page | **No year selector** — Shows Jan-Dec but no year indication or switching | Open |
| A24 | `/dashboard` page | **"Host Blocks: 0"** — Unclear metric label, confusing for users | Open |
| A25 | Multiple files | **API response structure inconsistency** — Some use `res.data.data`, others `res.data`, defensive fallbacks everywhere | Open |
| A26 | `PropertyCard.tsx` + `UnitCard.tsx` | **Dual routing** — PropertyCard links to `/search/${property._id}`, UnitCard links to `/search/${unit._id}`. Both `/search/[id]` and `/property/[id]` exist as separate pages | Open |
| A27 | `search/page.tsx` | **Missing error handling** — Units fetch fails silently with no user feedback | Open |
| A28 | `BookingWidget.tsx` | **Missing unit fetch error handling** — `getForProperty()` called without error state; widget may silently break | Open |
| A29 | `/host/listings/page.tsx` | **Admin toggle no immediate feedback** — `toggleUnit()` updates local state but UI doesn't reflect change until re-expand | Open |
| A30 | Featured Stays cards | **Accessibility** — Numeric values (guests, bedrooms) in separate elements not associated with their labels for screen readers | Open |

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| Medium — Data/Display | 9 |
| Medium — Language | 6 |
| Low — Code/UX | 12 |
| **Total** | **30** |
