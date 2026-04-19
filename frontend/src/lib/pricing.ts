/**
 * Shared discount + pricing helpers (PR E).
 *
 * Used by the booking widget (for the guest-facing price breakdown) and by the
 * host calendar (for the per-day discount badge + single-date dialog). The
 * backend mirrors the same logic in `backend/src/controllers/bookingController.js`
 * inside `calculateUnitPricing` — keep these two in sync.
 *
 * Stacking rule:
 *   effective% = min(100, sum(stackable applicable) + max(non-stackable applicable, 0))
 */

export type DiscountType = 'global' | 'weekly' | 'monthly' | 'weekday' | 'weekend' | 'date';

export interface ApplicableDiscount {
  type: DiscountType;
  percent: number;
  stackable: boolean;
}

// Minimum shape of the Unit data this module reads. Kept intentionally narrow
// so callers can pass their own broader types (Unit from `@/types`) without
// having to worry about required properties.
export interface PricingUnit {
  pricing?: {
    sunday?: number; monday?: number; tuesday?: number; wednesday?: number;
    thursday?: number; friday?: number; saturday?: number;
    discountPercent?: number;
    globalStackable?: boolean;
    weeklyDiscount?: number;
    weeklyStackable?: boolean;
    monthlyDiscount?: number;
    monthlyStackable?: boolean;
    cleaningFee?: number;
  };
  discountRules?: { type: 'weekday' | 'weekend'; percent: number; stackable?: boolean }[];
  datePricing?: {
    date: string | Date;
    price?: number;
    isBlocked?: boolean;
    discountPercent?: number;
    discountStackable?: boolean;
  }[];
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const WEEKEND_DAY_INDICES = new Set([4, 5, 6]); // Thu, Fri, Sat

function toDateKey(d: string | Date): string {
  if (typeof d === 'string') return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

/** Build a date-indexed map of per-date overrides for O(1) lookup. */
function buildDateOverrideMap(unit: PricingUnit) {
  const map = new Map<string, NonNullable<PricingUnit['datePricing']>[number]>();
  for (const dp of unit.datePricing || []) {
    map.set(toDateKey(dp.date), dp);
  }
  return map;
}

/**
 * Return the list of discounts that apply to a single night, given the stay
 * length (so long-stay discounts can decide if they kick in).
 *
 * `stayNights` is optional — when omitted, long-stay (weekly/monthly)
 * discounts are excluded. Use 0 or `undefined` when computing per-day
 * display for a calendar cell (no stay selected).
 */
export function applicableDiscountsForNight(
  unit: PricingUnit,
  date: Date,
  stayNights?: number,
): ApplicableDiscount[] {
  const discounts: ApplicableDiscount[] = [];
  const p = unit.pricing || {};

  const globalPct = p.discountPercent || 0;
  if (globalPct > 0) {
    discounts.push({ type: 'global', percent: globalPct, stackable: !!p.globalStackable });
  }

  if (stayNights != null && stayNights >= 7) {
    const wk = p.weeklyDiscount || 0;
    if (wk > 0) discounts.push({ type: 'weekly', percent: wk, stackable: !!p.weeklyStackable });
  }
  if (stayNights != null && stayNights >= 30) {
    const mo = p.monthlyDiscount || 0;
    if (mo > 0) discounts.push({ type: 'monthly', percent: mo, stackable: !!p.monthlyStackable });
  }

  // Weekday or weekend rule — whichever matches this day
  const isWeekend = WEEKEND_DAY_INDICES.has(date.getDay());
  const ruleType = isWeekend ? 'weekend' : 'weekday';
  const rule = (unit.discountRules || []).find((r) => r.type === ruleType);
  if (rule && rule.percent > 0) {
    discounts.push({ type: ruleType, percent: rule.percent, stackable: !!rule.stackable });
  }

  // Date-specific discount
  const override = buildDateOverrideMap(unit).get(toDateKey(date));
  if (override && override.discountPercent && override.discountPercent > 0) {
    discounts.push({
      type: 'date',
      percent: override.discountPercent,
      stackable: !!override.discountStackable,
    });
  }

  return discounts;
}

/** Apply the stacking rule to a list of discounts → an effective percent capped at 100. */
export function effectiveDiscountPercent(discounts: ApplicableDiscount[]): number {
  let stackableSum = 0;
  let nonStackableMax = 0;
  for (const d of discounts) {
    if (d.stackable) stackableSum += d.percent;
    else if (d.percent > nonStackableMax) nonStackableMax = d.percent;
  }
  return Math.min(100, stackableSum + nonStackableMax);
}

/** Base (pre-discount) nightly price for a given date. */
export function baseNightPrice(unit: PricingUnit, date: Date): number {
  const override = buildDateOverrideMap(unit).get(toDateKey(date));
  if (override && override.price != null && override.price > 0) return override.price;
  const dayName = DAY_KEYS[date.getDay()];
  return unit.pricing?.[dayName] || 0;
}

/** Discounted nightly price for a given date + stay length. */
export function nightPriceAfterDiscount(unit: PricingUnit, date: Date, stayNights?: number): number {
  const base = baseNightPrice(unit, date);
  const pct = effectiveDiscountPercent(applicableDiscountsForNight(unit, date, stayNights));
  return Math.round(base * (1 - pct / 100));
}

export interface StayPricing {
  perNight: number;
  nights: number;
  subtotal: number;
  subtotalAfterDiscount: number;
  discount: number;
  discountPercent: number; // effective % over the stay
  /** Set of discount types that contributed at least once during the stay. */
  appliedDiscountTypes: DiscountType[];
  cleaningFee: number;
  serviceFee: number;
  vat: number;
  total: number;
}

/**
 * Full pricing calculation for a stay — mirrors the backend's
 * `calculateUnitPricing`. Returns zeros for empty/invalid stays.
 */
export function calculateStayPricing(
  unit: PricingUnit,
  checkIn: Date | null,
  checkOut: Date | null,
): StayPricing {
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return {
      perNight: 0, nights: 0, subtotal: 0, subtotalAfterDiscount: 0,
      discount: 0, discountPercent: 0, appliedDiscountTypes: [],
      cleaningFee: 0, serviceFee: 0, vat: 0, total: 0,
    };
  }
  const msPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);

  let subtotal = 0;
  let subtotalAfter = 0;
  const appliedTypes = new Set<DiscountType>();

  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn);
    d.setDate(d.getDate() + i);
    const base = baseNightPrice(unit, d);
    const applicable = applicableDiscountsForNight(unit, d, nights);
    for (const a of applicable) appliedTypes.add(a.type);
    const pct = effectiveDiscountPercent(applicable);
    subtotal += base;
    subtotalAfter += Math.round(base * (1 - pct / 100));
  }

  const discount = Math.max(0, subtotal - subtotalAfter);
  const discountPercent = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0;
  const perNight = nights > 0 ? Math.round(subtotal / nights) : 0;
  const cleaningFee = unit.pricing?.cleaningFee || 0;
  const serviceFee = Math.round(subtotal * 0.1);
  const taxable = subtotal + cleaningFee + serviceFee - discount;
  const vat = Math.round(taxable * 0.15);
  const total = taxable + vat;

  return {
    perNight, nights, subtotal, subtotalAfterDiscount: subtotalAfter,
    discount, discountPercent, appliedDiscountTypes: Array.from(appliedTypes),
    cleaningFee, serviceFee, vat, total,
  };
}

/** Visual palette — referenced by the calendar page for per-type color dots. */
export const DISCOUNT_COLORS: Record<DiscountType, { bg: string; ring: string; text: string; dot: string }> = {
  global:  { bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  weekly:  { bg: 'bg-amber-50',   ring: 'ring-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  monthly: { bg: 'bg-purple-50',  ring: 'ring-purple-200',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
  weekday: { bg: 'bg-blue-50',    ring: 'ring-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  weekend: { bg: 'bg-cyan-50',    ring: 'ring-cyan-200',    text: 'text-cyan-700',    dot: 'bg-cyan-500'    },
  date:    { bg: 'bg-orange-50',  ring: 'ring-orange-200',  text: 'text-orange-700',  dot: 'bg-orange-500'  },
};

export const DISCOUNT_LABELS_EN: Record<DiscountType, string> = {
  global:  'Global',
  weekly:  'Weekly (7+ nights)',
  monthly: 'Monthly (30+ nights)',
  weekday: 'Weekdays',
  weekend: 'Weekend',
  date:    'Date-specific',
};

export const DISCOUNT_LABELS_AR: Record<DiscountType, string> = {
  global:  'عام',
  weekly:  'أسبوعي (7+ ليالٍ)',
  monthly: 'شهري (30+ ليلة)',
  weekday: 'أيام الأسبوع',
  weekend: 'نهاية الأسبوع',
  date:    'حسب التاريخ',
};
