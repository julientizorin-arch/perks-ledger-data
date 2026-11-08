// Validates src/data/cards.json (or a path passed as argv[2]).
// The update agent must run this before proposing any catalog change.
import { readFileSync } from 'node:fs';
import { BENEFIT_CATS, BENEFIT_TAGS, CATEGORIES, type Catalog } from './types';

const path = process.argv[2] ?? new URL('../cards.json', import.meta.url).pathname;
const cat: Catalog = JSON.parse(readFileSync(path, 'utf8'));
const errors: string[] = [];
const err = (m: string) => errors.push(m);

if (cat.schemaVersion !== 1) err('schemaVersion must be 1');
if (!/^\d{4}\.\d{2}\.\d{2}-\d+$/.test(cat.dataVersion)) err('dataVersion must look like 2026.10.22-1');
const programIds = new Set(cat.programs.map((p) => p.id));
const ids = new Set<string>();
const cadences = ['monthly', 'quarterly', 'semiannual', 'annual', 'quadrennial'];

for (const c of cat.cards) {
  const at = `card ${c.id}`;
  if (ids.has(c.id)) err(`${at}: duplicate id`);
  ids.add(c.id);
  if (!programIds.has(c.program)) err(`${at}: unknown program ${c.program}`);
  if (typeof c.annualFee !== 'number' || c.annualFee < 0) err(`${at}: bad annualFee`);
  if (typeof c.earn?.other !== 'number') err(`${at}: earn.other required`);
  for (const k of Object.keys(c.earn)) if (!CATEGORIES.includes(k as never)) err(`${at}: unknown earn category ${k}`);
  for (const k of Object.keys(c.caps ?? {})) if (!CATEGORIES.includes(k as never)) err(`${at}: unknown cap category ${k}`);
  if (c.choice) for (const k of c.choice.categories) if (!CATEGORIES.includes(k)) err(`${at}: unknown choice category ${k}`);
  if (c.brand?.airline && !cat.airlines.includes(c.brand.airline)) err(`${at}: airline ${c.brand.airline} not in airlines list`);
  if (c.brand?.hotel && !cat.hotels.includes(c.brand.hotel)) err(`${at}: hotel ${c.brand.hotel} not in hotels list`);
  if (c.verified !== null && !/^\d{4}-\d{2}-\d{2}$/.test(c.verified)) err(`${at}: verified must be ISO date or null`);
  for (const b of c.benefits ?? []) {
    if (!BENEFIT_CATS.includes(b.cat)) err(`${at}: unknown benefit cat ${b.cat}`);
    if (b.tag && !(b.tag in BENEFIT_TAGS)) err(`${at}: unknown benefit tag ${b.tag}`);
    if (!b.text?.trim()) err(`${at}: empty benefit text`);
  }
  if (c.benefitsVerified != null && !/^\d{4}-\d{2}-\d{2}$/.test(c.benefitsVerified)) err(`${at}: benefitsVerified must be ISO date or null`);
  const cids = new Set<string>();
  for (const cr of c.credits) {
    const cat2 = `${at} credit ${cr.id}`;
    if (cids.has(cr.id)) err(`${cat2}: duplicate credit id`);
    cids.add(cr.id);
    if (!cadences.includes(cr.cadence)) err(`${cat2}: bad cadence`);
    if (!['calendar', 'cardmember'].includes(cr.basis)) err(`${cat2}: bad basis`);
    if (!['credit', 'certificate', 'points'].includes(cr.kind)) err(`${cat2}: bad kind`);
    if (!(cr.amount > 0)) err(`${cat2}: amount must be > 0`);
    if (!(cr.ease >= 0 && cr.ease <= 1)) err(`${cat2}: ease must be 0..1`);
    if (cr.periodAmounts) {
      const n = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1, quadrennial: 1 }[cr.cadence];
      if (cr.periodAmounts.length !== n) err(`${cat2}: periodAmounts must have ${n} entries`);
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n` + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✓ catalog ${cat.dataVersion}: ${cat.cards.length} cards, ${cat.cards.reduce((n, c) => n + c.credits.length, 0)} credits, all valid`);
