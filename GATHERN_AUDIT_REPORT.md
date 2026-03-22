# Gathern.co & Business Dashboard — Full Inspection Report

**Tested by:** Claude (automated browser inspection)
**Date:** March 21, 2026
**Tested Account:** طارق الخثعمي (Tariq Al-Khathami) — signed-in session
**Sites Inspected:** gathern.co (customer) + business.gathern.co (host dashboard)

---

## 1. BUGS & ISSUES DETECTED

### CRITICAL (P0)

**BUG-01: Firebase Installation API — 403 PERMISSION_DENIED**
- **Where:** gathern.co (all pages, fires on page load)
- **Console Error:** `FirebaseError: Installations: Create Installation request failed with error "403 PERMISSION_DENIED: Requests to this API firebaseinstallations.googleapis.com method google.firebase.installations.v1.FirebaseInstallationsService.CreateInstallation are blocked."`
- **Source:** `_app-ac773e7c2bfec479.js`
- **Impact:** Firebase services (push notifications, analytics, remote config) are broken for all users. This suggests a misconfigured Firebase project or API key restriction.

**BUG-02: Business Dashboard — Broken 404 Pages (No Custom Error Page)**
- **Where:** business.gathern.co — multiple guessable routes return raw Next.js "404: This page could not be found" with no branding, no navigation, no way back
- **Affected URLs:** `/business/dashboard`, `/business/properties`, `/app/calendar`, `/app/transactions`
- **Impact:** Users who land on these URLs (via bookmarks, old links, or URL guessing) see a blank white page with only "404" text. No recovery path, no branding.

**BUG-03: Customer Profile Route — 404 Error**
- **Where:** gathern.co/user/profile
- **What:** Returns branded 404 page ("الصفحة غير موجودة") with a sad face icon. The actual profile lives at `/user/me`.
- **Impact:** Any external links or SEO pointing to `/user/profile` are broken.

### HIGH (P1)

**BUG-04: Search Results — Images Load as Gray Placeholders for 3-5 Seconds**
- **Where:** gathern.co/search (search results page)
- **What:** All property card images initially render as empty gray rectangles. After 3-5 seconds they lazy-load in. During this window, the page looks broken.
- **Impact:** Poor first impression. Users may think images are missing and leave. CLS (Cumulative Layout Shift) score is likely impacted.

**BUG-05: Homepage Bottom Row — Skeleton Cards Never Fully Load**
- **Where:** gathern.co homepage, last row of property listings
- **What:** The bottom row of cards remains in skeleton/placeholder state (gray rectangles with animated gray lines) indefinitely. No images, no text, no prices ever appear.
- **Impact:** The homepage looks unfinished at the bottom. Users scrolling down see broken content.

**BUG-06: Dashboard Performance Reports Stuck on 2023 Data**
- **Where:** business.gathern.co/app/dashboard
- **What:** Weekly performance reports only show entries from September-October 2023. No 2024, 2025, or 2026 reports. The sales chart shows 0 for March 2026.
- **Impact:** Hosts have no current performance data. The dashboard appears abandoned.

**BUG-07: Persistent Warning Modal on Dashboard Load**
- **Where:** business.gathern.co/app/dashboard
- **What:** Every time the dashboard loads, a modal appears: "وحدات غير معروضة — لديك وحدات متعددة بدون تصاريح" (Units not displayed — you have multiple units without permits). Clicking "Remind me later" dismisses it, but it returns on every page load.
- **Impact:** Disruptive UX for hosts. The modal blocks the entire dashboard and requires interaction every single visit.

### MEDIUM (P2)

**BUG-08: Calendar Navigation is a Dropdown, Not a Direct Link**
- **Where:** business.gathern.co — top navigation bar
- **What:** "التقويم" (Calendar) in the top nav is a `<button>` that opens a dropdown with "All Units" and "Specific Unit" — not a direct link. There's no standalone calendar page at `/app/calendar` (404). This means there's no way to link directly to the calendar.
- **Impact:** Confusing navigation. Calendar is a critical feature for hosts and should have a direct URL.

**BUG-09: No English Version of Host Dashboard**
- **Where:** business.gathern.co/app/*
- **What:** The entire host dashboard is Arabic-only. The customer site has an "ENGLISH" toggle, but the business portal does not.
- **Impact:** Non-Arabic-speaking hosts cannot use the dashboard.

**BUG-10: Properties Page Shows No Images or Details**
- **Where:** business.gathern.co/app/properties
- **What:** Property listing shows only the property name and status ("غير معروض"). No thumbnail image, no unit count, no stats, no quick actions visible without clicking.
- **Impact:** Hosts with multiple properties can't quickly scan their portfolio.

---

## 2. UX PROBLEMS & FRICTION POINTS

**UX-01: No Unified User Dashboard**
The customer site splits user functions across separate URLs: `/user/me?tab=my-reservations`, `/user/me?tab=favorites`, etc. There's no unified dashboard with at-a-glance stats. The profile page shows 4 stat cards (bookings: 0, wallet: 0.00, rating: 0/10, hosts blocked: 0) but provides no actionable data or links.

**UX-02: Business Portal Landing Page vs. Actual Dashboard Confusion**
`business.gathern.co/business` is a marketing/registration landing page with host success stories. The actual working dashboard is at `business.gathern.co/app/dashboard`. A host clicking "Host Portal" from the customer site lands on the marketing page, not the dashboard. They must then click their name > "لوحة التحكم" to reach the real dashboard.

**UX-03: Booking Widget — No Guest Count Selector Visible**
On property detail pages, the booking widget shows check-in/out dates and the "اختر" (Select) button, but there's no visible guest count selector in the initial view. Users can't specify how many guests before booking.

**UX-04: Search Filters — No Visual Feedback on Active Filters**
The search page has filter pills (property type, neighborhood, price, offers, rating, capacity) but it's not immediately clear which filters are active vs. available. The selected type "شقة (+3)" has a purple border, but other active filters are less obvious.

**UX-05: Host Dashboard — No Real-Time Notifications**
The host dashboard overview shows performance reports and a sales chart but has no notification center, no pending booking alerts, no guest messages indicator in the main dashboard view. The chat icon exists in the top-left but is easily missed.

**UX-06: Property Detail Page — Large Empty White Space**
Between the image gallery and the booking widget/description area, scrolling up from the midpoint reveals a large blank white section where the hero area should be. Images lazy-load but leave a significant gap.

---

## 3. PERFORMANCE ISSUES

**PERF-01: Image Lazy-Loading Too Aggressive**
Property card images across the site (homepage, search results) start as gray placeholders and take 3-5 seconds to appear. The Intersection Observer threshold appears too conservative — images should start loading before they enter the viewport.

**PERF-02: Homepage Initial Load — CLS Issues**
The homepage hero section loads with a city carousel and search bar, but property cards below load progressively. The bottom row never completes loading, causing layout shifts as skeleton cards appear and persist.

**PERF-03: User Profile Page Slow to Load**
The `/user/me` page took over 8 seconds to fully load (screenshot timed out on first attempt), suggesting heavy client-side data fetching or render blocking.

**PERF-04: Business Dashboard — No Code Splitting Evidence**
Navigating between dashboard sections (reservations, properties, finance) causes full page loads rather than client-side transitions, suggesting limited SPA routing in the host dashboard.

---

## 4. WEAK AREAS IN BOOKING FLOW

**BOOK-01: No Price Comparison / Value Indicators**
The booking widget shows the nightly rate (706 SAR) and total (889.56 SAR) but doesn't compare to similar properties, show price history, or indicate if it's a good deal.

**BOOK-02: BNPL Options (Tabby/Tamara) Are Below the Fold**
The installment payment options from Tabby and Tamara are positioned below the price breakdown, requiring scrolling. For a market where BNPL is popular, these should be more prominent.

**BOOK-03: No Instant Booking Indicator**
There's no visible indicator on property cards or the detail page showing whether a property supports instant booking vs. host approval required. This is critical information that affects conversion.

**BOOK-04: No Cancellation Policy Preview**
The cancellation policy is buried under the "شروط الحجز والالغاء" (Booking & Cancellation Terms) tab. It's not surfaced in the booking widget where the user makes their decision.

---

## 5. HOW HOSTN CAN IMPROVE EACH ONE

| Issue | Hostn Improvement |
|-------|-------------------|
| BUG-01: Firebase 403 | Hostn uses its own JWT auth — no Firebase dependency. Implement proper push notifications via Web Push API with a self-hosted service worker. |
| BUG-02: Raw 404 pages | Build custom branded 404 pages with navigation, search bar, and suggested properties. Add middleware to catch all invalid routes. |
| BUG-03: Profile route broken | Use consistent URL patterns: `/dashboard`, `/dashboard/bookings`, `/dashboard/profile`. Test all routes in CI with automated route checks. |
| BUG-04: Slow image loading | Use Next.js `<Image>` with `priority` prop for above-fold cards. Implement blur placeholders (blurDataURL) so cards show a colored preview instantly. Serve images via CDN with proper `srcset` for responsive sizes. |
| BUG-05: Skeleton cards stuck | Implement proper error boundaries. If API returns fewer results than skeleton slots, hide unused skeletons. Add retry logic for failed fetches. |
| BUG-06: Stale dashboard data | Show real-time earnings aggregated from completed bookings. Auto-generate weekly reports with cron jobs. Highlight "no data" states with CTAs rather than showing old data. |
| BUG-07: Persistent modal | Store "remind later" preference in localStorage with a 7-day TTL. Don't block the dashboard — show a non-intrusive banner instead. |
| BUG-08: Calendar not linkable | Make calendar a direct route (`/host/calendar`) with property selector on the page itself. Support deep links like `/host/calendar?property=123`. |
| BUG-09: No English dashboard | Hostn is already built in English. Add i18n support with next-intl for Arabic as a second language. |
| BUG-10: Bare property list | Show property cards with thumbnail, unit count, occupancy rate, monthly earnings, and quick toggle for active/inactive status. |
| UX-01: No unified dashboard | Hostn's user dashboard already has tabbed sections (overview, bookings, properties, wishlist, profile) in a single view. |
| UX-02: Portal confusion | Hostn uses a single auth system — hosts see a "Host Dashboard" link in the header that goes directly to `/host` (the real dashboard). No marketing landing page in between. |
| UX-03: No guest count | Add guest count selector directly in the booking widget, with validation against property capacity. |
| UX-04: Filter feedback | Use filled/colored chips for active filters with a count badge. Add a "Clear All" button. |
| UX-05: No notifications | Hostn's host dashboard already includes a notification dropdown in the top nav showing pending bookings and recent reviews. |
| PERF-01-04: Performance | Use Next.js Image optimization with `sizes` prop. Implement ISR for property pages. Use React Server Components for initial load. Add Suspense boundaries for progressive hydration. |
| BOOK-01-04: Booking gaps | Surface cancellation policy, instant booking badge, and BNPL options directly in the booking widget above the CTA button. Add price comparison widget. |

---

## 6. PRIORITIZED FEATURE LIST TO OUTPERFORM GATHERN

### Tier 1 — Launch Essentials (Week 1-2)
1. **Blur-hash image placeholders** — Show colored previews instead of gray boxes. Instant perceived performance.
2. **Custom 404 pages with smart redirects** — Branded, helpful error pages. Auto-suggest similar properties.
3. **Instant booking badges** — Clear visual indicator on cards and detail pages.
4. **Cancellation policy in booking widget** — Show policy summary next to the book button.
5. **Responsive image optimization** — Proper srcset, WebP format, CDN delivery.

### Tier 2 — Competitive Advantage (Week 3-4)
6. **Real-time host notifications** — WebSocket-based live alerts for new bookings, messages, reviews.
7. **Interactive availability calendar** — Drag-to-block dates, color-coded booking status, multi-property view.
8. **Smart pricing suggestions** — Show hosts what similar properties charge per night.
9. **Guest messaging system** — In-app chat between host and guest, pre-arrival instructions.
10. **Multi-language support (AR + EN)** — Full i18n with RTL support. Gathern's dashboard is Arabic-only.

### Tier 3 — Market Differentiators (Month 2)
11. **Dynamic pricing engine** — Auto-adjust prices based on demand, season, and local events.
12. **Host performance analytics** — Occupancy rate trends, revenue forecasts, comparison to market averages.
13. **Guest verification system** — ID verification, guest reviews, trust scores.
14. **Automated review responses** — AI-suggested reply templates for common review themes.
15. **Mobile-first host app** — Progressive Web App with offline support for managing bookings on the go.

### Tier 4 — Scale & Moat (Month 3+)
16. **Channel manager integration** — Sync availability across Booking.com, Airbnb, and local platforms.
17. **Revenue management dashboard** — Portfolio-level P&L, tax reporting, expense tracking.
18. **Loyalty / rewards program** — Points system for repeat guests with tier benefits.
19. **Property onboarding wizard** — AI-assisted listing creation with photo quality scoring and description generation.
20. **API marketplace** — Allow third-party integrations (cleaning services, key handoff, etc.).

---

## Route Map (Discovered During Inspection)

### gathern.co (Customer)
| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ Works | Homepage with hero, cities, listings |
| `/search` | ✅ Works | Search results with filters |
| `/view/{id}/unit/{id}` | ✅ Works | Property detail with booking widget |
| `/user/me` | ✅ Works | User profile + bookings + favorites |
| `/user/me?tab=my-reservations` | ✅ Works | Bookings list |
| `/user/profile` | ❌ 404 | Broken route — should redirect to `/user/me` |

### business.gathern.co (Host)
| Route | Status | Notes |
|-------|--------|-------|
| `/business` | ✅ Works | Marketing/registration landing page |
| `/app/dashboard` | ✅ Works | Main host dashboard |
| `/app/reservations` | ✅ Works | Booking management |
| `/app/properties` | ✅ Works | Property listing |
| `/app/finance` | ✅ Works | Financial overview (4 sections) |
| `/app/prices` | ✅ Works | Pricing management |
| `/app/settings` | ✅ Works | Account settings |
| `/app/chat` | ✅ Exists | Chat feature |
| `/app/calendar` | ❌ 404 | Calendar is dropdown-only, no direct route |
| `/app/transactions` | ❌ 404 | Should redirect to `/app/finance` |
| `/business/dashboard` | ❌ 404 | Raw 404, no custom error page |
| `/business/properties` | ❌ 404 | Raw 404, no custom error page |

---

*Report generated from live browser inspection using authenticated session.*
