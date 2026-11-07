# Catalog update agent

Instructions for the scheduled agent that keeps `cards.json` current.
Runs weekly. It **proposes** changes; a human approves before anything ships.

## Each run

1. Read `cards.json`. Note `dataVersion`.
2. For every card, prioritising (a) cards with `verified: null`, (b) cards with an annual fee, (c) the oldest `verified` dates:
   - Check the issuer's own benefits page first, then one reputable secondary source
     (The Points Guy, One Mile at a Time, Doctor of Credit, Upgraded Points, Frequent Miler).
   - Compare annual fee, earn rates, caps, and every credit: amount, cadence, calendar vs card-member year, enrollment, end dates.
   - Look for brand-new cards in the US top-50 and cards that closed to new applicants (`open: false`).
3. Never change a value on a single secondary source alone. If the issuer page and the secondary source disagree,
   do not edit; list it under "Needs a human look".
4. Write proposed edits to a copy of the catalog, bump `dataVersion` (`YYYY.MM.DD-n`) and `updatedAt`,
   set `verified` to today's date on every card you confirmed.
5. Run `npm run validate` (or `npm run validate -- <path>` for a copy). It must pass.
6. Open a pull request titled `Catalog update YYYY-MM-DD` containing:
   - the proposed `cards.json`
   - a changelog: one line per change, `card · field · old → new · source URL`
   - "Needs a human look": conflicts and anything ambiguous
   - "No change": cards checked and confirmed

If nothing changed, do not open a PR; report "checked N cards, no changes".

## Rules

- Do not delete a card users may hold; set `open: false` instead.
- Do not reuse an existing credit `id` for a different benefit (users' redemption history is keyed on it).
  A credit that is removed should be deleted; a new one gets a new id.
- Keep `ease` values unless there is a clear reason; they are product judgments, not issuer facts.
- Merging the PR to `main` publishes it: the app reads https://raw.githubusercontent.com/julientizorin-arch/perks-ledger-data/main/cards.json on launch.
