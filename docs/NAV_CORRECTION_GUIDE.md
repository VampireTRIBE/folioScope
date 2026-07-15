# FolioScope Parent NAV Correction Guide

## 1. Root cause

The existing market-gap code calculates a parent like this:

```js
parentValue = sum(child.nav * child.units);
parentUnits = sum(child.units);
parentNav = parentValue / parentUnits;
```

Only `parentValue` is valid. Child units cannot be added because every child:

- starts independently at NAV 100;
- can start on a different date;
- issues later units at its own NAV;
- has its own return path.

The correct parent rule is:

```text
Parent value = sum of child values
Parent units = the parent's previously issued units
Parent NAV = parent value / parent units
```

Market-price changes must never change units.

Deposits and withdrawals are the only external events that change units.
Dividend and tax change value but not units. Buy and sell are internal cash to
asset conversions and do not change group units.

## 2. Files

### `fillMissingNAVs.updated.js`

Use this file to replace the module containing the existing
`fill_MissingNAVs` function. Its relative imports match the paths in the code
that was supplied for review.

Important changes:

- Parent value still comes from child values.
- Parent units are preserved from the parent's own state.
- `totalUnits += child.units` was removed.
- A parent with non-zero value and zero units now throws instead of silently
  producing corrupt data.
- Missing and non-finite prices throw exact errors instead of creating `NaN`.
- New group state is initialized in memory as well as MongoDB.
- The start-date error message and several validation problems were corrected.
- `calculateExternalFlowUnitUpdate` is exported for deposit and withdrawal
  handlers.

### `repairParentNAVs.js`

This is a one-time MongoDB repair script. It:

1. loads the complete user hierarchy;
2. replays group statements and ledger statements in timestamp order;
3. reconstructs cash and quantities for every leaf;
4. prices pre-flow holdings at the same 5:00 PM IST NAV cutoff;
5. issues units independently for the leaf and every ancestor;
6. validates reconstructed leaf units against stored leaf units;
7. derives each parent daily value from descendant leaf NAV values;
8. changes only non-leaf NAV documents;
9. creates a backup collection before applying changes;
10. performs post-write verification;
11. supports restoration from the generated backup collection.

The script uses raw MongoDB collection names, so it does not depend on the
Mongoose model registration order.

## 3. Fix future deposits and withdrawals

Fixing `fill_MissingNAVs` stops market-gap filling from overwriting parent
units. The external-flow handler must also maintain units independently.

Before writing any deposit or withdrawal, load the current NAV state for:

```text
leaf -> parent -> parent's parent -> root
```

Take all pre-flow values before modifying any group. For each group, call:

```js
const {
  calculateExternalFlowUnitUpdate,
} = require("./fillMissingNAVs");

const result = calculateExternalFlowUnitUpdate({
  currentValue: groupNav.value,
  currentUnits: groupNav.units,
  amount,
  type: "deposit", // or "withdrawal"
});
```

Then persist that group's independent result:

```js
{
  nav: result.nav,
  units: result.units,
  value: result.value,
}
```

Do not calculate the leaf's `unitChange` once and copy it into the ancestors.
Every group has a different pre-flow NAV, so every group receives a different
unit change.

### Deposit example

Assume an existing parent has:

```text
Value = 8,000
Units = 100
NAV = 80
```

A new child receives a deposit of 1,000 and starts at NAV 100.

The child issues:

```text
1,000 / 100 = 10 child units
```

The parent independently issues:

```text
1,000 / 80 = 12.5 parent units
```

The correct parent result is:

```text
Value = 9,000
Units = 112.5
NAV = 80
```

Adding the child's 10 units to the parent's 100 units would create NAV
`81.8182`. That is false performance created by the accounting code.

## 4. Preconditions before running the repair

Do all of these first:

1. Stop FolioScope writes for the user.
2. Take a normal database backup.
3. Deploy the corrected runtime code.
4. Confirm that the current hierarchy was not historically re-parented.
5. Confirm the transaction history is complete from the first NAV date.
6. Confirm the configured collection names match the database.

Default collection names:

```text
navperformences
portfoliogroups
groupstatements
ledgerstatements
financialassets
assetpricehistories
```

Override a name only when the database uses a different collection:

```bash
NAV_COLLECTION=navperformences
GROUP_COLLECTION=portfoliogroups
GROUP_STATEMENT_COLLECTION=groupstatements
LEDGER_STATEMENT_COLLECTION=ledgerstatements
FINANCIAL_ASSET_COLLECTION=financialassets
PRICE_HISTORY_COLLECTION=assetpricehistories
```

## 5. Place the migration script

This checkout keeps its `mongoose` dependency under `server`, so the repair
script is installed there. Run the repair commands from the `server` directory:

```text
server/scripts/repairParentNAVs.js
```

It uses the project's existing `mongoose` dependency. `dotenv` is optional.
The script accepts this project's existing `DB_URL` variable as well as
`MONGO_URI` and `MONGODB_URI`.

## 6. Run dry-run first

Dry-run is the default and performs no database writes:

```bash
MONGO_URI="mongodb://127.0.0.1:27017/folioscope" \
node scripts/repairParentNAVs.js \
  --user=6a50cbbc754eadef575dd53c
```

The script must report:

```text
mode: dry-run
leafUnitMismatches: 0
```

If `leafUnitMismatches` is not zero, the script exits without changing
anything. Do not bypass this validation. It means at least one of these is
wrong or incomplete:

- transaction history;
- hierarchy history;
- price history;
- transaction timestamp normalization;
- existing leaf units.

## 7. Expected dry-run result for the supplied data

The supplied export was used as a fixture against the repair algorithm. The
verified result is:

```text
Replayed events:              202
Leaf unit mismatches:           0
Parent NAV rows checked:     2,694
Parent NAV rows changed:     1,439
```

Expected latest corrections:

| Group | First wrong date | Stored NAV | Corrected NAV |
| --- | --- | ---: | ---: |
| NET WORTH | 2025-07-10 | 99.7326399439 | 98.9407730150 |
| Net Investment | 2025-07-10 | 97.2818777020 | 94.5189686005 |
| Unstable Assets | 2025-07-10 | 103.0307042520 | 102.6461588111 |
| Goal Oriented Funds | 2025-12-05 | 104.5666973735 | 104.5997244986 |
| Stable Assets | 2026-03-10 | 86.7261794947 | 84.1210341712 |
| Emergency Funds | No mismatch | 100.3607956808 | 100.3607956808 |

For `NET WORTH`:

```text
Stored units:     16,848.229111847857
Corrected units:  16,983.072968821040
Value:            1,680,318.367704600000
```

The corrected since-inception NAV is still below 100. The correction fixes the
calculation but does not turn a time-weighted loss into a gain. The positive
snapshot and positive XIRR measure different things.

## 8. Apply the repair

Only after the dry-run matches the expected structure:

```bash
MONGO_URI="mongodb://127.0.0.1:27017/folioscope" \
node scripts/repairParentNAVs.js \
  --user=6a50cbbc754eadef575dd53c \
  --apply
```

Apply mode:

- creates a backup collection;
- updates only changed parent NAV documents;
- leaves every leaf NAV document unchanged;
- leaves transactions, FIFO lots, holdings and snapshots unchanged;
- verifies the entire result after writing.

The output includes a backup collection similar to:

```text
navperformences_parent_nav_backup_20260710xxxxxxxxx
```

Keep that name.

## 9. Restore if required

Use the exact collection name printed by apply mode:

```bash
MONGO_URI="mongodb://127.0.0.1:27017/folioscope" \
node scripts/repairParentNAVs.js \
  --user=6a50cbbc754eadef575dd53c \
  --restore=navperformences_parent_nav_backup_20260710xxxxxxxxx
```

Restore replaces the affected parent documents with their exact backed-up
versions.

## 10. Post-repair verification

Verify all of these:

1. Every leaf NAV and leaf unit series is byte-for-byte unchanged except for
   unrelated database metadata.
2. Every parent value equals the sum of descendant leaf values for the date.
3. Parent units change only on descendant deposits and withdrawals.
4. Parent units remain constant on market-only days.
5. Parent NAV satisfies `value / units` whenever units are non-zero.
6. Root current value remains `1,680,318.3677046` for the supplied snapshot.
7. Root corrected NAV becomes approximately `98.9407730150` against the
   supplied stored prices.
8. Root XIRR remains approximately `3.26%` because cash flows and current value
   did not change.
9. Recalculate any cached drawdown, normalized-chart or comparison data that
   depends on parent NAV history.

## 11. Regression tests required before deployment

Add automated tests covering:

1. one child where parent and child units happen to match;
2. a second child created when the parent NAV is not 100;
3. deposits into two children on the same day;
4. withdrawal from one child;
5. tax and dividend without unit changes;
6. market movement without unit changes;
7. a parent with value but zero units, which must throw;
8. a cycle in the hierarchy, which must throw;
9. missing close prices, which must throw;
10. repair dry-run reproducing every stored leaf unit exactly.

The second test is the critical regression test. Without it, the original bug
can return unnoticed.
