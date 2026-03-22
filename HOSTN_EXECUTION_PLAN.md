# HOSTN — Execution Plan & Product Blueprint

**Purpose:** Build a vacation rental platform that is measurably better than Gathern in every dimension — routing, performance, host tools, booking UX, and reliability.

**Based on:** Live inspection of gathern.co and business.gathern.co (March 21, 2026)

---

## COMPLETE ROUTE ARCHITECTURE

### Customer App (gathern.co equivalent)

```
/                                   Homepage
/listings                           Search results (with query params for filters)
/listings?city=riyadh&type=apartment&checkIn=2026-03-21&checkOut=2026-03-22
/listings/[id]                      Property detail page
/booking/[id]                       Booking confirmation + payment
/booking/[id]/success               Booking success / receipt
/auth/login                         Login page
/auth/register                      Register page (guest or host)
/dashboard                          Unified user dashboard
/dashboard/bookings                 My bookings list
/dashboard/bookings/[id]            Single booking detail
/dashboard/wishlist                 Saved / favorited properties
/dashboard/profile                  Edit profile
/dashboard/reviews                  My reviews (given)
/not-found                          Custom branded 404
```

### Host Dashboard (business.gathern.co equivalent)

```
/host                               → redirects to /host/overview
/host/overview                      Dashboard home: stats, charts, alerts
/host/listings                      All my properties (cards with images + stats)
/host/listings/new                  Create new property (multi-step wizard)
/host/listings/[id]/edit            Edit existing property
/host/bookings                      All bookings (filterable table)
/host/bookings/[id]                 Single booking detail modal/page
/host/calendar                      Interactive availability calendar
/host/calendar?property=[id]        Deep-link to specific property calendar
/host/earnings                      Revenue analytics + charts
/host/earnings/payouts              Payout history
/host/reviews                       Guest reviews across all properties
/host/messages                      Guest messaging inbox
/host/settings                      Host account settings
```

### Shared / System

```
/api/health                         API health check
/api/*                              All REST endpoints (backend)
/*  (catch-all)                     → Custom 404 page
```

**Key difference from Gathern:** Every page has a direct, bookmarkable URL. No dropdown-only navigation, no `/business` vs `/app` confusion, no broken routes. One domain, one auth system, clean path hierarchy.

---

## SECTION 1: HOST DASHBOARD (Priority #1)

### 1.1 Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  [≡]  Hostn Host Dashboard          🔔 3  💬 2   [Tariq ▾] │  ← Top Nav
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ Overview │              MAIN CONTENT AREA                   │
│ Listings │                                                  │
│ Bookings │   (changes per route, client-side transitions)   │
│ Calendar │                                                  │
│ Earnings │                                                  │
│ Reviews  │                                                  │
│ Messages │                                                  │
│          │                                                  │
│──────────│                                                  │
│ Settings │                                                  │
│ ← Site   │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

**Sidebar (HostSidebar.tsx)**
- Collapsible (icon-only mode on mobile, full labels on desktop)
- Active route highlighted with purple left-border + filled background
- Items: Overview, Listings, Bookings, Calendar, Earnings, Reviews, Messages
- Bottom section: Settings, "Back to Site" link
- User avatar + name at bottom when expanded

**Top Nav (HostTopNav.tsx)**
- Hamburger toggle for sidebar on mobile
- "Hostn Host Dashboard" branding
- Notification bell with live count (pending bookings + unread reviews)
- Message icon with unread count
- User dropdown: Profile, Settings, View Site, Logout

**Why it beats Gathern:** Gathern uses a flat top-nav with 7 items + hidden dropdown for calendar. Navigation is confusing — "الرئيسية" and "لوحة المعلومات" are different things. Hostn uses a sidebar that shows everything at once, with clear visual hierarchy. Every item is a direct link.

---

### 1.2 Overview Page (/host/overview)

```
┌─────────────────────────────────────────────────────────────┐
│  Good morning, Tariq                    March 21, 2026      │
├──────────┬──────────┬──────────┬────────────────────────────┤
│ 💰       │ 📋       │ ⭐       │ 📊                         │
│ SAR 12.4K│ 8        │ 9.2/10  │ 73%                        │
│ Earnings │ Bookings │ Rating  │ Occupancy                  │
│ this mo. │ this mo. │ overall │ this month                 │
│ ↑12%     │ ↑3       │ ↑0.1    │ ↑5%                        │
├──────────┴──────────┴──────────┴────────────────────────────┤
│                                                             │
│  ⚡ ACTION REQUIRED                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟡 2 pending bookings need your response             │   │
│  │ 🔵 1 new review to respond to                        │   │
│  │ 🟢 Payout of SAR 3,200 processing                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────┬───────────────────────────────┤
│  Monthly Earnings Chart     │  Recent Bookings              │
│  ┌────────────────────┐    │  ┌─────────────────────────┐  │
│  │  ██                │    │  │ Ahmed M. — Villa Rose   │  │
│  │  ██ ██             │    │  │ Mar 25-27 · SAR 1,800  │  │
│  │  ██ ██ ██          │    │  │ [Confirm] [Details]    │  │
│  │  ██ ██ ██ ▓▓       │    │  ├─────────────────────────┤  │
│  │  J  F  M  A        │    │  │ Sara K. — Studio Lux   │  │
│  └────────────────────┘    │  │ Mar 22-23 · SAR 450    │  │
│                             │  │ ✅ Confirmed            │  │
│                             │  └─────────────────────────┘  │
└─────────────────────────────┴───────────────────────────────┘
```

**Components needed:**
- `StatCard` — Icon, value, label, trend arrow with percentage
- `ActionBanner` — Colored alert items with direct action links
- `EarningsChart` — Bar chart (monthly), uses Recharts
- `RecentBookingsTable` — 5 most recent, with inline accept/reject for pending
- `NotificationPanel` — Live-updating list of actionable items

**Data source:** `GET /api/host/stats` returns `{ earnings, bookings, rating, occupancy, pendingCount, recentBookings[], notifications[] }`

**Why it beats Gathern:** Gathern's dashboard shows a sales chart with 0 data, performance reports from 2023, and hits you with a blocking modal on every load. Hostn's overview is action-oriented — the first thing you see is what needs your attention right now.

---

### 1.3 Listings Management (/host/listings)

```
┌─────────────────────────────────────────────────────────────┐
│  My Properties                          [+ Add Property]    │
│  ┌──────────────────┐                                       │
│  │ 🔍 Search...     │  [All ✓] [Active] [Inactive]         │
│  └──────────────────┘                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────┬───────────────────────────────────────────────┐  │
│  │ 📷   │  Villa Rose Garden              🟢 Active     │  │
│  │ img  │  Riyadh, Al-Malqa · 3 BR · 8 guests          │  │
│  │      │  SAR 850/night · ⭐ 9.4 (23 reviews)          │  │
│  │      │  📊 68% occupancy · 💰 SAR 8.2K this month    │  │
│  │      │  [View] [Edit] [Calendar] [⋯]                 │  │
│  └──────┴───────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────┬───────────────────────────────────────────────┐  │
│  │ 📷   │  Studio Lux Downtown            🟢 Active     │  │
│  │ img  │  Riyadh, Granada · 1 BR · 2 guests            │  │
│  │      │  SAR 350/night · ⭐ 9.8 (45 reviews)          │  │
│  │      │  📊 82% occupancy · 💰 SAR 4.1K this month    │  │
│  │      │  [View] [Edit] [Calendar] [⋯]                 │  │
│  └──────┴───────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Each property card shows at a glance:** thumbnail image, name, location, capacity, price, rating, occupancy rate, monthly earnings, active/inactive toggle, and quick action buttons.

**Components needed:**
- `PropertyListCard` — Horizontal card with image, stats, actions
- `PropertyStatusBadge` — Green "Active" / Red "Inactive" pill
- `QuickActionMenu` — View on site, Edit, Calendar, Toggle status, Delete (soft)
- `PropertyForm` — Multi-step wizard (4 steps: Basic → Details → Amenities → Rules)

**Why it beats Gathern:** Gathern's property page shows one line per property: just name and "غير معروض" (unlisted). No image, no stats, no occupancy data. You can't tell anything about your properties without clicking into each one. Hostn shows everything on the card.

---

### 1.4 Booking Management (/host/bookings)

```
┌─────────────────────────────────────────────────────────────┐
│  Bookings                                                   │
│  [All (15)] [Pending (2)] [Confirmed (8)] [Completed (3)] [Cancelled (2)] │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔍 Search by guest name or booking #...              │  │
│  └──────────────────────────────────────────────────────┘  │
├───────┬────────────┬──────────┬────────┬──────┬────────────┤
│ Guest │ Property   │ Dates    │ Amount │Status│ Actions    │
├───────┼────────────┼──────────┼────────┼──────┼────────────┤
│ Ahmed │ Villa Rose │ Mar25-27 │ 1,800  │🟡 P  │ [✓] [✗]   │
│ Sara  │ Studio Lux │ Mar22-23 │  450   │🟢 C  │ [Details]  │
│ Omar  │ Villa Rose │ Mar18-20 │ 1,700  │🔵 D  │ [Review]   │
└───────┴────────────┴──────────┴────────┴──────┴────────────┘
```

**Key features:**
- Status tabs with live counts
- Inline accept/reject buttons for pending bookings
- Click any row to open detail modal (guest info, special requests, pricing breakdown, contact)
- Bulk actions: Accept all pending, Export to CSV

**Components needed:**
- `BookingTable` — Sortable, filterable table
- `BookingStatusTabs` — Tab bar with count badges
- `BookingDetailModal` — Full booking info, guest contact, action buttons
- `BookingActionButtons` — Accept/Reject with confirmation

**Why it beats Gathern:** Gathern shows bookings in a timeline/feed format (one per row, vertically stacked), making it hard to scan. There's no table view, no bulk actions, and status filters are checkboxes in a sidebar rather than tabs. Hostn uses a clean table that hosts can scan in seconds.

---

### 1.5 Calendar & Availability (/host/calendar)

```
┌─────────────────────────────────────────────────────────────┐
│  Calendar                   Property: [Villa Rose Garden ▾] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ← March 2026 →                                            │
│  ┌────┬────┬────┬────┬────┬────┬────┐                      │
│  │ Sat│ Sun│ Mon│ Tue│ Wed│ Thu│ Fri│                      │
│  ├────┼────┼────┼────┼────┼────┼────┤                      │
│  │    │    │    │    │    │    │  1 │                      │
│  │  2 │  3 │ 4🟢│ 5🟢│ 6🟢│  7 │  8 │  🟢 = Booked       │
│  │  9 │ 10 │ 11 │12🔴│13🔴│ 14 │ 15 │  🔴 = Blocked       │
│  │ 16 │ 17 │18🟢│19🟢│ 20 │ 21 │ 22 │  🟣 = Selected      │
│  │ 23 │ 24 │ 25 │ 26 │ 27 │ 28 │ 29 │                      │
│  │ 30 │ 31 │    │    │    │    │    │                      │
│  └────┴────┴────┴────┴────┴────┴────┘                      │
│                                                             │
│  Selected: none          [Block Selected] [Unblock Selected]│
│                                                             │
├───────────────────────────┬─────────────────────────────────┤
│  Upcoming Bookings        │  Blocked Dates                  │
│  Mar 4-6: Ahmed M.       │  Mar 12-13: Owner use           │
│  Mar 18-19: Sara K.      │  [Unblock]                      │
└───────────────────────────┴─────────────────────────────────┘
```

**Key features:**
- Property selector dropdown (defaults to first property)
- Interactive month grid built with date-fns
- Click dates to select range, then Block or Unblock
- Color legend: Green = booked, Red = blocked by host, Purple = currently selected
- Sidebar shows upcoming bookings and blocked dates with unblock buttons
- Deep-linkable: `/host/calendar?property=abc123` opens directly to that property

**Components needed:**
- `CalendarGrid` — Month view with date-fns, clickable days
- `CalendarLegend` — Color key
- `DateRangeSelector` — Click-to-select date ranges
- `BlockDatePanel` — Block/unblock controls
- `UpcomingBookingsSidebar` — List of booked dates with guest names

**Why it beats Gathern:** Gathern's calendar has no direct URL — it's only accessible via a dropdown button in the nav, and guessing `/app/calendar` returns a raw 404. Hostn's calendar is a first-class page with a direct route, deep linking, and property switching built in.

---

### 1.6 Earnings & Finance (/host/earnings)

```
┌─────────────────────────────────────────────────────────────┐
│  Earnings & Finance                        [← 2026 →]      │
├──────────┬──────────┬──────────┬────────────────────────────┤
│ 💰       │ 📋       │ 📈       │                            │
│ SAR 48.2K│ 67       │ SAR 719  │                            │
│ Total    │ Bookings │ Avg/Book │                            │
├──────────┴──────────┴──────────┴────────────────────────────┤
│                                                             │
│  Monthly Earnings                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     █                                                │  │
│  │  █  █  █                                             │  │
│  │  █  █  █  ▓                                          │  │
│  │  █  █  █  ▓                                          │  │
│  │  J  F  M  A  M  J  J  A  S  O  N  D                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────┬───────────────────────────────┤
│  Top Properties             │  By Type                      │
│  1. Villa Rose — SAR 24K    │  Apartment: SAR 28K           │
│  2. Studio Lux — SAR 15K   │  Villa: SAR 15K               │
│  3. Beach House — SAR 9K   │  Studio: SAR 5K               │
└─────────────────────────────┴───────────────────────────────┘
```

**Components needed:**
- `EarningsSummaryCards` — 3 summary metrics with year comparison
- `MonthlyBarChart` — Recharts bar chart with tooltip
- `TopPropertiesRanking` — Ranked list with earnings bars
- `EarningsByTypeGrid` — Breakdown by property type
- `YearSelector` — Navigate between years

**Data source:** `GET /api/host/earnings?year=2026`

**Why it beats Gathern:** Gathern's dashboard sales chart shows 0 data for the current month, and the only financial section is a list of bank transfers. No per-property breakdown, no trends, no averages. Hostn gives hosts a full picture of where their money comes from.

---

### 1.7 Reviews Management (/host/reviews)

```
┌─────────────────────────────────────────────────────────────┐
│  Reviews                                                    │
├──────────┬───────────────────┬──────────────────────────────┤
│          │ Rating Distribution│  Category Averages           │
│   9.2    │ 10 ████████ 28    │  Cleanliness    9.5 ████     │
│  /10     │  8 ████ 12        │  Accuracy       9.3 ████     │
│  ⭐⭐⭐⭐⭐ │  6 ██ 5           │  Location       8.8 ███      │
│  67 total│  4 █ 2            │  Value          9.1 ████     │
│          │  2 ▏ 0            │  Communication  9.6 █████    │
├──────────┴───────────────────┴──────────────────────────────┤
│  [Newest ▾]                                                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Ahmed M. → Villa Rose Garden     ⭐ 10  Mar 19    │  │
│  │ "Amazing place, very clean and the host was great"    │  │
│  │ Clean: 10  Accuracy: 10  Value: 10                    │  │
│  │                                                        │  │
│  │ 💬 Your Response:                                      │  │
│  │ "Thank you Ahmed! We're glad you enjoyed your stay"   │  │
│  │ [Edit Response]                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Sara K. → Studio Lux            ⭐ 8   Mar 15     │  │
│  │ "Nice studio, but AC was a bit noisy"                 │  │
│  │ [Respond to review...]                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Components needed:**
- `ReviewSummaryPanel` — Overall rating, distribution bars, sub-rating averages
- `ReviewCard` — Guest name, property, rating, comment, sub-ratings, response area
- `ReviewResponseForm` — Inline text input with submit button
- `ReviewSortFilter` — Sort by newest, oldest, highest, lowest

---

## SECTION 2: BOOKING EXPERIENCE REDESIGN

### 2.1 Redesigned Booking Widget (Property Detail Page)

```
┌─────────────────────────────────────┐
│  SAR 706 / night        ⚡ Instant   │  ← Price + Instant booking badge
│  ────────────────────────────────── │
│  Check-in        │ Check-out        │
│  Sat, Mar 21     │ Sun, Mar 22      │
│  ────────────────────────────────── │
│  Guests                             │
│  2 adults, 0 children          [▾]  │  ← Guest selector (NEW)
│  ────────────────────────────────── │
│                                     │
│  1 night × SAR 706         SAR 706  │
│  Service fee                SAR  78  │
│  VAT (15%)                  SAR 106  │
│  ──────────────────────────────────  │
│  Total                      SAR 890  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🟢 Free cancellation until      ││  ← Policy preview (NEW)
│  │    24 hours before check-in     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Or pay SAR 222.50/month × 4    ││  ← BNPL above CTA (NEW)
│  │ with tabby | tamara             ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │     🔒 Book Now — SAR 890      ││  ← Primary CTA
│  └─────────────────────────────────┘│
│                                     │
│  You won't be charged yet           │
└─────────────────────────────────────┘
```

**New elements vs. Gathern:**

| Feature | Gathern | Hostn |
|---------|---------|-------|
| Guest selector | Not visible | Dropdown with adults/children + capacity warning |
| Instant booking badge | None | ⚡ badge at top of widget |
| Cancellation policy | Hidden in separate tab | Green banner in widget itself |
| BNPL options | Below the fold, after price | Compact banner above Book button |
| CTA button | "اختر" (Select) — vague | "Book Now — SAR 890" — shows total |
| Reassurance text | None | "You won't be charged yet" |

**Components needed:**
- `BookingWidget` — Sticky sidebar with all elements
- `GuestSelector` — Dropdown with +/- for adults, children, infants
- `PriceBreakdown` — Line items with total
- `CancellationPreview` — Green/yellow/red banner based on policy type
- `BNPLBanner` — Compact Tabby/Tamara installment calculator
- `InstantBookingBadge` — ⚡ icon with tooltip

---

### 2.2 Property Card Improvements

```
┌──────────────────────────────────┐
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │     [Property Image]       │  │  ← blur-hash placeholder until loaded
│  │                            │  │
│  │  ⚡ Instant   ♡            │  │  ← Instant badge + wishlist
│  │           -20% OFF         │  │  ← Discount badge
│  └────────────────────────────┘  │
│  ⭐ 9.4 (23)  ·  Riyadh, Malqa  │
│  Villa Rose Garden                │
│  🛏 3  🚿 2  👤 8                │  ← Capacity icons
│  ̶S̶A̶R̶ ̶1̶,̶0̶0̶0̶  SAR 800 / night   │
│  Total: SAR 1,008 (1 night)      │  ← Total with fees
│  🟢 Free cancellation             │  ← Policy indicator (NEW)
└──────────────────────────────────┘
```

**New vs. Gathern:** Hostn cards show total price (including fees), cancellation policy, instant booking badge, and capacity icons. Gathern shows per-night price only.

---

## SECTION 3: PERFORMANCE & UI STRATEGY

### 3.1 Image Loading — Zero Gray Placeholders

**Problem:** Gathern shows gray rectangles for 3-5 seconds on search results and homepage.

**Hostn solution — 3-layer loading strategy:**

```
Layer 1: Blur-hash placeholder (instant)
  → 4×3px blurred color image encoded as base64
  → Renders immediately as CSS background
  → Generated at image upload time, stored in DB

Layer 2: Low-quality image (200ms)
  → 20px wide thumbnail served inline
  → Replaces blur-hash, gives shape preview

Layer 3: Full image (lazy-loaded)
  → Next.js <Image> with sizes prop
  → WebP format via CDN
  → priority={true} for first 4 above-fold cards
```

**Implementation:**
```tsx
// PropertyCard image
<Image
  src={property.images[0].url}
  alt={property.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
  placeholder="blur"
  blurDataURL={property.images[0].blurHash}
  priority={index < 4}  // First row loads immediately
  className="object-cover"
/>
```

### 3.2 Zero Layout Shift Strategy

| Element | Strategy |
|---------|----------|
| Property cards | Fixed aspect-ratio containers (4:3) with CSS `aspect-ratio` |
| Hero images | Reserved height via `min-height` on container |
| Search filters | Fixed height filter bar, no content reflow |
| Fonts | `font-display: swap` with size-adjust fallback |
| Navigation | Static height header, no dynamic content on load |

### 3.3 Loading States

**Never show gray skeletons that can get stuck.** Instead:

```
State 1: Blur placeholders in card grid (instant)
State 2: Real data replaces cards (200-500ms)
State 3: If API fails → Show error boundary with retry button
State 4: If fewer results than expected → Collapse unused card slots
```

**Error boundaries on every data-fetching section:**
```tsx
<ErrorBoundary fallback={<RetryPanel onRetry={refetch} />}>
  <Suspense fallback={<PropertyGridSkeleton count={8} />}>
    <PropertyGrid />
  </Suspense>
</ErrorBoundary>
```

### 3.4 Network Performance Budget

| Metric | Target | Gathern (observed) |
|--------|--------|--------------------|
| LCP (Largest Contentful Paint) | < 1.5s | ~4s (hero image) |
| FID (First Input Delay) | < 50ms | Unknown |
| CLS (Cumulative Layout Shift) | < 0.05 | ~0.3 (image loading) |
| TTI (Time to Interactive) | < 2s | ~5s (client-side hydration) |
| Image load (above fold) | < 500ms | 3-5s |

---

## SECTION 4: USER DASHBOARD REDESIGN

### 4.1 Unified Dashboard (/dashboard)

**Gathern's problem:** Profile page shows 4 dead stat cards (all zeros), bookings are in a tab, favorites are in another tab, and profile editing is elsewhere. Nothing is actionable.

**Hostn's solution — one page, three zones:**

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, Tariq                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 5 trips  │  │ SAR 120  │  │ ⭐ 9.1    │  │ 3 saved  │  │
│  │ completed│  │ wallet   │  │ my rating │  │ wishlist │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 Upcoming Trips                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📷 Villa Rose · Mar 25-27 · Confirmed                │  │
│  │     Riyadh, Al-Malqa · Check-in at 4:00 PM          │  │
│  │     [View Details] [Contact Host] [Cancel]           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📷 Beach House · Apr 10-13 · Pending                 │  │
│  │     Jeddah, Obhur · Waiting for host confirmation    │  │
│  │     [View Details]                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Past Trips (3)  →  [View All]                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ❤️ Saved Properties                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐                                │
│  │ img  │ │ img  │ │ img  │   → [View All]                  │
│  │ Name │ │ Name │ │ Name │                                 │
│  │ SAR  │ │ SAR  │ │ SAR  │                                 │
│  └──────┘ └──────┘ └──────┘                                │
└─────────────────────────────────────────────────────────────┘
```

**Key differences from Gathern:**
- Stats are real, not zeros — show actual data with links
- Upcoming bookings have action buttons (Contact Host, Cancel, View Details)
- Past trips show at a glance with "View All" for full history
- Wishlist shows property thumbnails horizontally, not a separate page
- Everything on one scroll — no tabs to switch between

**Sub-routes:**
- `/dashboard` — Overview (above)
- `/dashboard/bookings` — Full booking history with filters
- `/dashboard/bookings/[id]` — Single booking detail with receipt, host info, review option
- `/dashboard/wishlist` — Full grid of saved properties
- `/dashboard/profile` — Edit name, email, phone, avatar
- `/dashboard/reviews` — Reviews you've written

---

## SECTION 5: ERROR HANDLING & ROUTING

### 5.1 Custom 404 Page

```
┌─────────────────────────────────────────────────────────────┐
│  [Hostn Logo]                        [Home] [Search]        │
│                                                             │
│                    🏠                                        │
│           This page doesn't exist                            │
│                                                             │
│   The property you're looking for may have been             │
│   removed or the URL might be incorrect.                     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ 🔍 Search for properties...                         │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   Or try these popular destinations:                         │
│   [Riyadh] [Jeddah] [Abha] [Al-Ula]                       │
│                                                             │
│   [← Go Home]                                               │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:** Next.js `not-found.tsx` at app root + per-section not-found files.

### 5.2 Route Consistency Rules

```
Rule 1: Every sidebar/nav item is a direct <Link>, never a dropdown-only button
Rule 2: Every page has a URL that can be bookmarked and shared
Rule 3: Unknown routes → custom 404 with navigation
Rule 4: Auth-required routes → redirect to /auth/login?redirect=/original-path
Rule 5: Role-required routes → redirect to / with toast "Host account required"
Rule 6: Deep links always work: /host/calendar?property=abc123
```

### 5.3 Middleware Guards

```typescript
// middleware.ts
const hostRoutes = ['/host', '/host/overview', '/host/listings', ...];
const authRoutes = ['/dashboard', '/booking'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const path = request.nextUrl.pathname;

  // Not logged in → login page with redirect
  if (!token && [...hostRoutes, ...authRoutes].some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL(`/auth/login?redirect=${path}`, request.url));
  }

  // /host → /host/overview
  if (path === '/host') {
    return NextResponse.redirect(new URL('/host/overview', request.url));
  }
}
```

---

## SECTION 6: KEY COMPONENTS MASTER LIST

### Shared UI Components

| Component | File | Used In |
|-----------|------|---------|
| `Button` | `ui/Button.tsx` | Everywhere |
| `Input` | `ui/Input.tsx` | Forms, search |
| `StarRating` | `ui/StarRating.tsx` | Cards, reviews |
| `Badge` | `ui/Badge.tsx` | Status indicators |
| `Modal` | `ui/Modal.tsx` | Booking detail, confirmations |
| `EmptyState` | `ui/EmptyState.tsx` | No results, no bookings |
| `ErrorBoundary` | `ui/ErrorBoundary.tsx` | Every data section |
| `Skeleton` | `ui/Skeleton.tsx` | Loading states |
| `Toast` | `ui/Toast.tsx` | Success/error notifications |

### Customer Components

| Component | File | Purpose |
|-----------|------|---------|
| `HeroSearch` | `home/HeroSearch.tsx` | Homepage hero with search |
| `CityBrowse` | `home/CityBrowse.tsx` | City circle images |
| `FeaturedListings` | `home/FeaturedListings.tsx` | Property card grid |
| `PropertyCard` | `listings/PropertyCard.tsx` | Single property card |
| `SearchFilters` | `listings/SearchFilters.tsx` | Filter bar + expandable |
| `ImageGallery` | `property/ImageGallery.tsx` | Grid + lightbox |
| `BookingWidget` | `property/BookingWidget.tsx` | Sticky booking sidebar |
| `GuestSelector` | `property/GuestSelector.tsx` | Adults/children picker |
| `CancellationBanner` | `property/CancellationBanner.tsx` | Policy preview |
| `BNPLBanner` | `property/BNPLBanner.tsx` | Installment options |
| `ReviewsList` | `property/ReviewsList.tsx` | Reviews with responses |
| `AmenitiesList` | `property/AmenitiesList.tsx` | Amenity grid |

### Host Dashboard Components

| Component | File | Purpose |
|-----------|------|---------|
| `HostSidebar` | `host/HostSidebar.tsx` | Collapsible sidebar nav |
| `HostTopNav` | `host/HostTopNav.tsx` | Top bar with notifications |
| `StatCard` | `host/StatCard.tsx` | Metric card with trend |
| `ActionBanner` | `host/ActionBanner.tsx` | Pending actions alert |
| `EarningsChart` | `host/EarningsChart.tsx` | Monthly bar chart |
| `RecentBookingsTable` | `host/RecentBookingsTable.tsx` | Latest bookings |
| `PropertyListCard` | `host/PropertyListCard.tsx` | Property with stats |
| `PropertyForm` | `host/PropertyForm.tsx` | Multi-step create/edit |
| `BookingTable` | `host/BookingTable.tsx` | Sortable booking table |
| `BookingDetailModal` | `host/BookingDetailModal.tsx` | Full booking info |
| `CalendarGrid` | `host/CalendarGrid.tsx` | Interactive month view |
| `ReviewCard` | `host/ReviewCard.tsx` | Review with response |
| `NotificationDropdown` | `host/NotificationDropdown.tsx` | Live notification list |

---

## SECTION 7: WHAT MAKES HOSTN BETTER — SUMMARY

| Area | Gathern Weakness | Hostn Advantage |
|------|-----------------|-----------------|
| **Routing** | 4+ broken 404s, dropdown-only calendar, `/business` vs `/app` confusion | Every page has a clean URL, deep-linkable, zero 404s |
| **Host Dashboard** | Blocking modal on every load, 2023 stale data, flat top-nav | Sidebar layout, action-oriented overview, real-time data |
| **Listings** | One-line text, no images, no stats | Rich cards with thumbnail, occupancy, earnings, quick actions |
| **Calendar** | No direct URL, dropdown-only access | First-class page, deep-linkable, property switching |
| **Booking Widget** | No guest selector, policy hidden, BNPL below fold | Guest picker, policy banner, BNPL above CTA, instant badge |
| **Images** | Gray placeholders for 3-5 seconds | Blur-hash instant, WebP, priority loading for above-fold |
| **User Dashboard** | Split across tabs, dead stats, no actions | Unified view, real stats, action buttons on bookings |
| **Error Handling** | Raw "404" white pages, no recovery | Branded 404 with search, suggestions, navigation |
| **Performance** | CLS from image loading, stuck skeletons, slow profile | Zero CLS, error boundaries, optimistic loading |
| **Language** | Host dashboard Arabic-only | English-first with Arabic i18n support |
| **Notifications** | No real-time alerts, hidden chat icon | Live notification bell, pending counts, action items |

---

## SECTION 8: IMPLEMENTATION ORDER

### Sprint 1 (Days 1-5): Foundation & Host Dashboard Core

```
Day 1:
  ✅ Host dashboard layout (sidebar + top nav + auth guard)
  ✅ /host/overview with stat cards and action banner
  ✅ Custom 404 page (app-wide)

Day 2:
  ✅ /host/listings with PropertyListCard (images, stats, actions)
  ✅ /host/listings/new — PropertyForm wizard (4 steps)
  ✅ /host/listings/[id]/edit — Edit mode with pre-filled data

Day 3:
  ✅ /host/bookings with BookingTable + status tabs
  ✅ BookingDetailModal with accept/reject actions
  ✅ /host/calendar — interactive grid + block/unblock

Day 4:
  ✅ /host/earnings — summary cards + monthly bar chart + top properties
  ✅ /host/reviews — summary panel + review cards + response form

Day 5:
  ✅ NotificationDropdown with live counts
  ✅ Host dashboard route guards (middleware.ts)
  ✅ Integration testing — verify all host routes work
```

### Sprint 2 (Days 6-10): Booking Experience & Customer UX

```
Day 6:
  ✅ Redesigned BookingWidget with GuestSelector
  ✅ CancellationBanner in booking widget
  ✅ BNPLBanner above CTA
  ✅ InstantBookingBadge on cards and detail

Day 7:
  ✅ PropertyCard redesign with blur-hash placeholders
  ✅ Total price display (including fees) on cards
  ✅ Cancellation policy indicator on cards

Day 8:
  ✅ Unified user dashboard (/dashboard)
  ✅ /dashboard/bookings with action buttons
  ✅ /dashboard/wishlist with property thumbnails

Day 9:
  ✅ Image optimization pipeline (blur-hash generation, WebP, CDN)
  ✅ Zero-CLS implementation (aspect ratios, reserved heights)
  ✅ Error boundaries on all data sections

Day 10:
  ✅ End-to-end testing: full booking flow
  ✅ End-to-end testing: full host management flow
  ✅ Performance audit (Lighthouse score targets)
```

### Sprint 3 (Days 11-14): Polish & Competitive Edge

```
Day 11:
  ✅ Host messaging inbox (/host/messages)
  ✅ Guest-to-host pre-booking questions

Day 12:
  ✅ Search filter improvements (colored active chips, clear all)
  ✅ Map view on search results

Day 13:
  ✅ i18n setup (English default + Arabic RTL)
  ✅ Responsive testing (mobile host dashboard)

Day 14:
  ✅ Seed data with realistic properties, bookings, reviews
  ✅ README with setup instructions
  ✅ Final QA pass — every route, every component, every error state
```

---

*This is a build-ready execution plan. Every route, component, and UX decision is specified. Start with Sprint 1, Day 1.*
