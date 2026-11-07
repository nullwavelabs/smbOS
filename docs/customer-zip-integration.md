# Customer zip integration

This release combines Derek's customer-home changes (November 1, 2026) with the owner field desk already on main (`cfccfe0`). The shared source baseline was `9e9df77` / asset version `readable-5`.

## Source changes included

The four changed source files were `app.js`, `model.js`, `operations.js`, and `readability.css`. The remaining files in the supplied `site/` directory matched that earlier baseline and were not copied over newer owner work.

Included: Eastern-time opening status and hours dialog; customer-side Share and role-specific dialog copy; new greeting/services heading; compact top seasonal promotion; discounted starting-price badges; per-service discount breakdown; recent-service history, selectable recent orders, and rebooking; currency formatting; responsive header and home styles.

## Integration resolutions

- Combined three-way content changes rather than replacing newer files with the zip's older full-site copy.
- Preserved the owner field desk, four-way navigation, workday memory, Help, notes/photos, phone bookings, kit/stock, invoices, and exports.
- Owner branding still returns to My day. Customer branding/header opens the hours dialog as in the package. Share and Call/Help keep their own actions.
- Retained compact customer sections while keeping readable service text, sufficient button heights, and darker secondary text.
- Snapshotted the promotion policy for new visits; preserved the original October-only policy for pre-existing bookings and pending moves. Existing records without a promotion snapshot use the legacy policy. Starting a new/repeat visit explicitly takes the current promotion.
- Cleared automatic discount rows for fixed owner offers. Rounded line amounts, discounts, and totals to cents.
- Required scope review when a recent selection changes services or current service questions; retained fast scheduling for unchanged scope.
- Retained all existing storage keys and updated module/style cache versions together.

The 15% leaf-cleanup rate remains a prototype campaign value from the supplied package. It and the September–November recurrence are explicit code settings, not a new owner-facing promotion editor.

## Validation

`npm test` covers the existing owner/customer behavior, updated campaign expectations, preserved legacy agreed prices, fixed offers, repeat policy snapshots, history, hours boundaries, and Node template/event initialization on both sides. Node rendering checks are not visual browser tests. Local browser use was disabled in Work settings during this integration; visual mobile/desktop review remains a verification limit.

## Source fingerprint

Supplied changes.patch SHA-256: `642a33cb9c9025c157f3f28b5b19ca3cbeddf2d12ccbe009bb01d6e58c594705`.

The original zip files in Downloads were left unchanged.
