# Perks Ledger card catalog

The public card-benefits data the Perks Ledger app downloads on launch:
`https://raw.githubusercontent.com/julientizorin-arch/perks-ledger-data/main/cards.json`

- Annual fees, earn rates, caps and every statement credit (amount, cadence, calendar vs card-member year) for ~50 US cards.
- `verified` is the date a card's terms were last checked against the issuer; `null` means not yet verified.
- Updated weekly by an agent that opens a pull request with sources (see `UPDATE_AGENT.md`). Nothing ships until it's reviewed and merged.
- Check before merging: `npm install && npm run validate`.

Figures are for tracking and estimates only, not financial advice. Not affiliated with any issuer.
