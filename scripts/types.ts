// Shared data model for the card catalog. The catalog itself lives in cards.json
// so it can be hosted remotely and updated without an app release.

export const CATEGORIES = [
  'dining',
  'groceries',
  'gas',
  'flights',
  'hotels',
  'travel',
  'streaming',
  'drugstores',
  'amazon',
  'rent',
  'other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  dining: 'Dining',
  groceries: 'Groceries',
  gas: 'Gas & EV',
  flights: 'Flights',
  hotels: 'Hotels',
  travel: 'Other travel & transit',
  streaming: 'Streaming',
  drugstores: 'Drugstores',
  amazon: 'Amazon',
  rent: 'Rent / mortgage',
  other: 'Everything else',
};

export type Cadence = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'quadrennial';
/** calendar = resets Jan 1 / quarter / half; cardmember = resets on account anniversary */
export type Basis = 'calendar' | 'cardmember';
/** credit = dollar statement credit; certificate = free night / companion pass valued in $; points = bonus points */
export type CreditKind = 'credit' | 'certificate' | 'points';

export interface Credit {
  id: string;
  name: string;
  /** Dollar amount (or points for kind=points) available in each period */
  amount: number;
  /** Optional per-period overrides, e.g. Uber Cash $15/mo with $35 in December (index 11) */
  periodAmounts?: number[];
  cadence: Cadence;
  basis: Basis;
  kind: CreditKind;
  /** Default share of the credit a typical cardholder actually uses (0..1). User can override. */
  ease: number;
  enroll?: boolean;
  notes?: string;
}

export interface ChoiceBonus {
  /** User (or issuer automatically) picks `picks` categories from this list */
  categories: Category[];
  picks: number;
  mult: number;
  /** Combined annual spend cap across picked categories, then the card's base rate */
  cap?: number;
}

export const BENEFIT_CATS = ['lounge', 'status', 'travel', 'shopping', 'other'] as const;
export type BenefitCat = (typeof BENEFIT_CATS)[number];

/** Tags that let the app answer "which of my cards covers X?" across the wallet. */
export const BENEFIT_TAGS = {
  lounge: 'Lounge access',
  'trip-delay': 'Trip delay',
  'trip-cancel': 'Trip cancellation',
  'rental-primary': 'Rental car (primary)',
  'rental-secondary': 'Rental car (secondary)',
  baggage: 'Lost or delayed bags',
  evacuation: 'Emergency evacuation',
  'free-bag': 'Free checked bag',
  'global-entry': 'Global Entry / PreCheck credit',
  'no-fx': 'No foreign transaction fee',
  'fx-fee': 'Foreign transaction fee',
  'cell-phone': 'Cell phone protection',
  'purchase-protection': 'Purchase protection',
  'extended-warranty': 'Extended warranty',
} as const;
export type BenefitTag = keyof typeof BENEFIT_TAGS;

export interface Benefit {
  cat: BenefitCat;
  tag?: BenefitTag;
  text: string;
}

export interface Card {
  id: string;
  name: string;
  issuer: string;
  network: 'Visa' | 'Mastercard' | 'Amex' | 'Discover';
  business: boolean;
  open: boolean;
  annualFee: number;
  program: string;
  /** Points (or % for cash programs) per dollar by category; missing = earn.other */
  earn: Partial<Record<Category, number>> & { other: number };
  /** Annual spend caps per category, after which earn.other applies */
  caps?: Partial<Record<Category, number>>;
  choice?: ChoiceBonus;
  /** Co-brand multipliers that only apply when the user flies / stays with this brand */
  brand?: { airline?: string; hotel?: string; flightsMult?: number; hotelsMult?: number };
  credits: Credit[];
  perks: string[];
  /** Non-cash benefits shown on the Perks tab (lounges, status, protections). Optional for older catalogs. */
  benefits?: Benefit[];
  /** ISO date the benefits list was last checked against the issuer's benefits guide; null = not yet */
  benefitsVerified?: string | null;
  /** ISO date the card's terms were last checked against a source; null = seeded, not yet verified */
  verified: string | null;
  notes?: string;
}

export interface Program {
  id: string;
  name: string;
  /** Default value in cents per point */
  cpp: number;
}

export interface Catalog {
  schemaVersion: 1;
  dataVersion: string;
  updatedAt: string;
  programs: Program[];
  airlines: string[];
  hotels: string[];
  cards: Card[];
}

export const PERIODS_PER_YEAR: Record<Cadence, number> = {
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
  quadrennial: 0.25,
};

export function creditAnnualAmount(c: Credit): number {
  if (c.periodAmounts && c.periodAmounts.length) {
    return c.periodAmounts.reduce((a, b) => a + b, 0) * (c.cadence === 'quadrennial' ? 0.25 : 1);
  }
  return c.amount * PERIODS_PER_YEAR[c.cadence];
}
