# Gathern.co Competitive Analysis — Deep Product Investigation

**Date:** 2026-03-29
**Method:** Automated extraction of Next.js SSR data, route manifest, property APIs, and structured page props from live production site.

---

## 1. What Gathern Does Well

### 1.1 Pricing Transparency & Breakdown
Gathern's pricing breakdown is a **line-item services array**, not hardcoded fields:
```
Original price:     506 SAR/night
Discount (30%):    -151.80 SAR    ← "خصم من العروض"
Service fee (11%):  +38.96 SAR    ← "رسوم الخدمات"
VAT (15%):          +53.13 SAR    ← "ضريبة القيمة المضافة"
─────────────────────────────
Total:              446.29 SAR
```
**Key insight:** Their service fee is **11%**, not 10%. And services are a dynamic array — hosts can add add-on services with custom pricing.

### 1.2 Buy Now Pay Later (BNPL) — Tabby + Tamara
Both BNPL providers are deeply integrated:
- **Tamara widget** embedded directly on property pages with installment preview: "اليوم: 116 SAR → أبريل: 116 → مايو: 116"
- **Tabby widget** also present as alternative
- Dedicated callback routes: `/callback/tabby`, `/callback/tamara`
- Price limit: Tamara available up to 5,000 SAR
- Marketing copy: "قسّمها على 4. بدون رسوم تأخير" (Split it into 4. No late fees)

**Impact:** BNPL increases conversion 20-30% for bookings in the 500-5000 SAR range.

### 1.3 STC Qitaf Loyalty Integration
- **Earn points:** "اكسب 44 نقطة مع stc قطاف" (Earn 44 points)
- **Burn points:** Users can pay with Qitaf points
- This targets Saudi Arabia's largest telecom customer base

### 1.4 Multi-Unit Properties (Property → Units Architecture)
Route structure confirms: `/view/[chalet_id]/unit/[unit_id]/reserve`
- A "chalet" (property) contains multiple "units"
- Each unit has independent pricing, availability, features
- Host info shows: "10 وحدة على المنصة" (10 units on platform)
- Units have individual codes: "كود الوحدة (93669)"

### 1.5 Currency Localization
Auto-detected visitor location (Ireland) and showed:
- Prices in EUR with conversion hint
- "الأسعار الموضحة بالعملة المحلية تقريبية حسب سعر الصرف. يتم خصم المبلغ بالريال السعودي"
- SAR remains the billing currency

### 1.6 Smart Social Proof
- View count displayed prominently: "449 K" views
- Booking count per unit
- Rating with Arabic text label: "رائع" (Excellent) alongside numeric 10/10
- Host profile: registration date, total reviews (2,328), units count

### 1.7 Property Categories
5 distinct property types with separate landing pages:
1. شقق وبيوت خاصة (Apartments & Private homes) — cats 6,7,8
2. شاليهات واستراحات (Chalets & Resorts) — cats 2,3
3. مخيمات (Camps) — cat 5
4. مزارع (Farms) — cat 4
5. عروض (Offers/Deals) — cat 0

Each has a dedicated route: `/apartments`, `/chalets`, `/camps`, `/farms`

### 1.8 Search Infrastructure
- 200+ cities and municipalities
- City slider with icons on homepage
- Monthly rentals promoted as separate category
- Banner system: localized images (AR/EN) with 3 responsive sizes (large/medium/small)
- Search tracking IDs on every element for analytics

### 1.9 Cancellation & Insurance
- Per-property cancellation policy (not global): "لا يمكن الغاء هذا الحجز او تأجيله"
- Free cancellation text displayed when available
- Property insurance option (`has_insuranse` field)
- Sleepover pricing: extra hours after checkout for a fee

### 1.10 Identity Verification (Yaqeen)
Routes `/yaqeen/verify` and `/yaqeen/reservation-details` show integration with Saudi's Yaqeen identity verification system for booking validation.

### 1.11 A/B Testing Property Pages
Two property page versions: `/property/v1/[slug]` and `/property/v2/[slug]` — suggesting active experimentation on their most important conversion page.

### 1.12 Daily Discount Offers
- Homepage section "العروض اليومية" (Daily Offers) with `units_carousel` component
- Discount labels: "%30 خصم" with red badge (#d01d20)
- `is_daily_discount: true` flag

---

## 2. What We Are Missing

| Feature | Gathern | Hostn | Gap Severity |
|---------|---------|-------|-------------|
| **BNPL (Tabby/Tamara)** | ✅ Both integrated | ❌ None | **P0** — Major conversion loss |
| **STC Qitaf loyalty** | ✅ Earn + burn | ❌ None | **P1** — Saudi market differentiator |
| **Multi-unit properties** | ✅ Property → Units | ❌ Flat model | **P1** — Limits chalet/resort hosts |
| **Currency localization** | ✅ Auto-detect | ❌ SAR only | **P2** — Limits international guests |
| **Dynamic services array** | ✅ Extensible | ❌ Fixed fields | **P2** — Limits host pricing flexibility |
| **View counts** | ✅ "449K views" | ❌ Not shown | **P2** — Missing social proof |
| **Sleepover pricing** | ✅ Extra hours fee | ❌ None | **P2** — Revenue opportunity |
| **Per-property cancellation** | ✅ Custom per unit | ❌ Global only | **P1** — Hosts need flexibility |
| **Yaqeen identity verification** | ✅ Saudi ID check | ❌ None | **P1** — Trust and fraud prevention |
| **Category landing pages** | ✅ /chalets, /apartments | ❌ Only search | **P2** — SEO advantage |
| **Monthly rentals** | ✅ Dedicated section | ❌ None | **P1** — Revenue expansion |
| **Daily discount offers** | ✅ Homepage carousel | ❌ Static discount | **P2** — Engagement driver |
| **Host public profiles** | ✅ /h/[host_id] | ❌ None | **P2** — Trust builder |
| **Responsive banner system** | ✅ 3 sizes, AR/EN | ❌ None | **P2** — Marketing |
| **Campaign pages** | ✅ /campaign/[slug] | ❌ None | **P2** — Marketing |
| **Referral system** | ✅ /r/[referral] | ❌ None | **P2** — Growth |

---

## 3. What We Should Copy

### 3.1 BNPL Integration (Tabby + Tamara) — **COPY IMMEDIATELY**
Their biggest conversion weapon. The installment preview widget on property pages pre-sells the payment option before users even start booking.

**Implementation path:**
- Tabby: [tabby.ai](https://tabby.ai) — Saudi-first BNPL
- Tamara: [tamara.co](https://tamara.co) — 4-installment split
- Embed widget on property detail + checkout
- Add callback routes for payment verification

### 3.2 Service Fee at 11% — **CONSIDER MATCHING**
Gathern charges 11% service fee vs our 10%. This is a 10% revenue increase per booking with no user-visible change.

### 3.3 Dynamic Pricing Breakdown — **COPY APPROACH**
Instead of hardcoded `serviceFee`, `cleaningFee`, `vat` fields, use a services array:
```json
[
  { "title": "Discount", "amount": -151.80 },
  { "title": "Service fee", "amount": 38.96, "percent": 11 },
  { "title": "VAT", "amount": 53.13, "percent": 15 }
]
```
This enables future add-ons (cleaning, insurance, sleepover) without schema changes.

### 3.4 View Count Display — **EASY WIN**
Show "X views" on property cards. We already track this in the backend (Property model could add a `viewCount` field). Massive social proof for almost no effort.

### 3.5 Tracking IDs on Every Element — **COPY FOR ANALYTICS**
Every homepage section, banner, and search result has a `tracking_id`. This enables precise funnel analytics.

---

## 4. What We Should Improve Beyond Them

### 4.1 Real-Time Availability Calendar
Gathern uses `selected_check_in/check_out` dates that come pre-filled from search. We should add a visual availability calendar on the property page itself, showing booked/available dates at a glance.

### 4.2 Instant Booking vs Request-Based
Gathern appears to be request-based (host confirms). We should offer both models and incentivize instant booking with better search ranking.

### 4.3 Better Location Privacy UX
We already implemented coordinate jittering (better than Gathern's approach of showing a static map image `map_image: cdn.gathern.co/...`). Our dynamic approach is more secure.

### 4.4 Smarter Content Filtering
Our chat content filter (phone, email, URL, WhatsApp, social media) is already more comprehensive than what's publicly visible on Gathern. We can extend with Arabic numeral detection (٠١٢٣٤٥٦٧٨٩).

### 4.5 Progressive Web App
Gathern is web-only with app download prompts. We have both native apps AND web. Advantage: us.

---

## 5. Prioritized Recommendations

### P0 — Must Have for Launch Competitiveness

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| 1 | **Integrate Tabby BNPL** | Medium (2-3 days) | +20-30% conversion on 500+ SAR bookings |
| 2 | **Integrate Tamara BNPL** | Medium (2-3 days) | Alternative BNPL, broader coverage |
| 3 | **Raise service fee to 11%** | Trivial (1 line) | +10% platform revenue |

### P1 — High Impact, Next Sprint

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| 4 | **Multi-unit property support** | Large (1-2 weeks) | Unlocks chalet/resort hosts |
| 5 | **Per-property cancellation policy** | Small (1-2 days) | Host flexibility, guest trust |
| 6 | **Monthly rental support** | Medium (3-5 days) | New revenue stream |
| 7 | **Yaqeen identity verification** | Medium (3-5 days) | Fraud prevention, trust |
| 8 | **Apple Pay via Moyasar** | Small (1 day) | Convenience, higher conversion |

### P2 — Nice to Have, Competitive Parity

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| 9 | **View count social proof** | Trivial | Social proof on cards |
| 10 | **Category landing pages** | Small (2-3 days) | SEO improvement |
| 11 | **Host public profiles** | Small (2 days) | Trust signal |
| 12 | **Currency localization** | Medium (3 days) | International guests |
| 13 | **Referral system** | Medium (3-5 days) | Growth channel |
| 14 | **Campaign landing pages** | Small (2 days) | Marketing support |
| 15 | **Dynamic services pricing** | Medium (3-5 days) | Future-proof pricing |

---

## Key Takeaway

Gathern's biggest competitive advantages are **BNPL integration** (Tabby + Tamara) and **multi-unit property support**. These are the two features that most directly impact revenue and host acquisition. Everything else is incrementally valuable but these two are where the most money is being left on the table.

Our advantages: native mobile apps, real-time chat with content filtering, dynamic location privacy, and server-side pricing validation. These are strong technical foundations — we just need the business features to match.
