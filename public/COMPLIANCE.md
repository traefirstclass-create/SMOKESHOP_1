# Compliance System — Plain-Language Guide

This document explains every compliance rule built into this site, and exactly where you (or your attorney) go to configure or change it. It's written for the business owner and their attorney, not a developer — no code reading required.

**The core idea:** nothing is sellable by default. Every product starts blocked. A human has to explicitly approve a product before it can appear on the storefront at all. Nothing here decides *whether something is legal to sell* — that's your and your attorney's call. This system only makes whatever decision you make *enforceable and auditable* in the actual checkout flow.

---

## 1. The five product categories

Every product in the catalog has exactly one **compliance category**. You set this in **Admin → Products**.

| Category | What it means | Where it can be bought |
|---|---|---|
| `DO_NOT_SELL` | Blocked entirely. **This is the default for every product**, including everything already in the demo catalog. | Nowhere — invisible to the storefront. |
| `FREE_SHIP` | Ships anywhere in the US via standard carriers (USPS/UPS/FedEx), no special registration. Example: glass, grinders, papers, empty vape hardware, storage. | Online, ships to any address. |
| `PICKUP_ONLY` | Cannot be shipped at all, under any circumstance. Only released in person, at a store location, with an ID check at the moment of handoff. | Online checkout, in-store pickup only. |
| `RESTRICTED_DTC` | Can legally ship direct-to-consumer, but only to states where this business is fully registered (see §3). Requires adult-signature delivery. Example: nicotine vapor products, traditional tobacco. | Online, ships only to allowlisted states. |
| `WHOLESALE_ONLY` | Only for verified licensed retail businesses. **Not yet purchasable by anyone** — see §6. | Nowhere yet (mechanism exists, storefront doesn't). |

**Reclassifying a product:** Admin → Products → expand a row → change the category, optionally flag it "needs legal review," set an expiration date if a law is changing (see §7), write a one-line reason, and save. That reason is permanently recorded — see §8.

---

## 2. Checkout behavior

- A cart can mix `FREE_SHIP`, `PICKUP_ONLY`, and `RESTRICTED_DTC` items. Checkout automatically splits them: shippable items go to "Ships to your address," `PICKUP_ONLY` items go to "Pick up in store" with a location selector. Shipping is only charged on the ship group.
- `DO_NOT_SELL` and `WHOLESALE_ONLY` products never appear in the shop, search, or a product page — not just a disabled button. This is enforced twice: once in the app's data queries, and again at the database level (Supabase Row Level Security), so it can't be bypassed by querying the database directly.
- **Age verification**: date of birth is collected and checked (21+) at checkout *whenever the cart contains a `PICKUP_ONLY` or `RESTRICTED_DTC` item* — tied to that specific transaction, recorded on the order. (A lighter "are you 21?" gate also shows on first site visit for every visitor.)
- **`RESTRICTED_DTC` state gating**: when checkout includes one of these, it checks the shipping state against Admin → State Registrations. If that state isn't fully registered, checkout is blocked for that item with a clear message — it never silently fails after the fact.
- **Adult signature**: any `RESTRICTED_DTC` line item requires adult-signature delivery, always — this isn't a box staff have to remember to check, it's automatic based on the category.

---

## 3. State Registrations (Admin → State Registrations)

`RESTRICTED_DTC` products can only ship to a state once **all three** boxes are checked for it:

1. **ATF** — the business is registered with the ATF for that state.
2. **Tax** — the business is registered with that state's tobacco tax administrator.
3. **Carrier** — the specialty carrier integration is ready for that state (see §5).

Leave every state unchecked until all three are actually true. An unchecked state simply can't be shipped `RESTRICTED_DTC` products — checkout blocks it automatically.

---

## 4. Pickup Orders (Admin → Pickup Orders)

This is the specific mechanism that keeps `PICKUP_ONLY` sales outside Florida's remote/delivery-sale statute (FL 210.095): **in-person handoff with an ID check at that exact moment**, not a generic "buy online, pick up in store" convenience flow.

Staff must tick all three boxes — ID checked and matches the order name, ID confirms 21+, item physically handed over — before the system will mark an item picked up. Every completed pickup is logged.

The single pickup location currently seeded is a placeholder (123 Placeholder Ave, Tampa, FL) — edit it directly in Supabase's table editor (`pickup_locations` table) once you have a real address. There's no admin page for this yet since there's only one location; add one if a second location/franchise location comes online.

---

## 5. Specialty Carrier (not yet connected)

Standard carriers (USPS/UPS/FedEx) categorically refuse to ship tobacco/vapor products. `RESTRICTED_DTC` orders need a PACT-Act-compliant specialty carrier instead. **No specific carrier has been selected or connected yet.**

The code is built against an adapter interface (`lib/carriers/specialty-carrier.ts`) specifically so a developer can plug in a real carrier later without touching checkout logic. Until then, `RESTRICTED_DTC` orders that pass the state-registration check still go through (payment is captured, the order is recorded correctly), but shipping has to be arranged manually — there's no auto-booked shipping label.

---

## 6. Wholesale / Trade Program (partially built — by design)

You described this as an "eventual" program, so this build intentionally does the minimum needed now without over-building something that might not match how the program actually launches:

- **Built now**: the `WHOLESALE_ONLY` category exists and is fully locked down (invisible to the public storefront, unpurchasable by anyone). A public form at `/trade/apply` collects interest (business name, resale cert #, license #, contact info) into Admin → Trade Applications, where you can mark applications approved/rejected as a record-keeping step.
- **Not built yet**: a self-serve Trade customer login or wholesale storefront. Today, "approved" is just a record — you'd still need to arrange wholesale orders with that business directly (phone/email/manual invoice).
- **When you're ready to launch self-serve wholesale ordering**: a developer needs to add Trade customer accounts (the database is already structured to support this — see the `trade_profiles` note in `supabase/schema.sql`) and a gated wholesale catalog view. Everything else (the category, the RLS lockout, the checkout rejection) is already in place and won't need to change.

---

## 7. Compliance Expiration & Review Tracking (Admin → Overview)

Every product has:
- **Last reviewed date** — auto-stamped every time someone saves a change on that product.
- **Needs legal review** flag — a manual "this is gray-area, look again" marker.
- **Compliance expires on** — an optional date. Use this for anything a known upcoming law change will affect — the clearest example right now is the **federal hemp Total-THC standard effective November 12, 2026**. Set that date on any hemp-derived SKU so it surfaces on the Overview page well before the rule takes effect.

The Overview page automatically surfaces: anything never reviewed or not reviewed in 90+ days, anything flagged for legal review, and anything within 30 days of its expiration date. Nothing auto-hides when it expires — a human still has to act on the flag.

---

## 8. Audit Trail (Admin → Audit Log)

Every one of these is logged permanently, with who did it, when, and why:
- A product's compliance category changing.
- A state registration being edited.
- A Trade application being approved/rejected.
- Every checkout that included a `RESTRICTED_DTC` or `PICKUP_ONLY` item.

**Florida monthly filing**: the Audit Log page has a "Export CSV" button that pulls that month's `RESTRICTED_DTC`/`PICKUP_ONLY` checkout entries (date, product, quantity, destination state, pickup location). This is a **starting point**, not a guaranteed-correct filing — have your accountant or attorney confirm it actually covers every field Florida's DOR requires for the monthly tobacco delivery-sale report (due by the 10th) before relying on it.

---

## 9. Content Check (Admin → Content Check)

A simple banned-terms checker for product descriptions, blog posts, or ad copy, covering the three things called out in the original spec:
- **Health claims** (cure/treat/prevent disease language) — especially relevant for any future CBD/hemp SKUs.
- **Illegal-drug / paraphernalia framing** — the spec's point here is important: for glass, dab rigs, and scales specifically, it's the *marketing language* that creates drug-paraphernalia liability under Florida law, not the item itself. Keep copy framed around tobacco/legal-herb use.
- **Minor-targeting language** (candy flavors, cartoons, "kid-friendly," etc.)

The starter list (~24 terms) is seeded in `supabase/seed.sql` and editable at the bottom of the Content Check page. **This list needs your attorney's review and expansion — it is not exhaustive.** It's a keyword catcher, not a substitute for a human reading the copy.

**Warning-label text**: the same page lets you set the actual warning text that renders automatically on `RESTRICTED_DTC` and `PICKUP_ONLY` product pages. It currently shows an obvious bracketed placeholder — `[INSERT ATTORNEY-APPROVED WARNING LANGUAGE HERE...]`. Nobody should treat that placeholder as real compliant copy; replace it with your attorney's actual required language (e.g., Florida's required tobacco shipping warning) before any `RESTRICTED_DTC` product goes live for real.

---

## 10. Staff Accounts

Admin access requires a real login (Supabase Auth), not a shared password, so the audit log can attribute every action to an actual person.

**Provisioning a new staff account** (no self-serve signup yet):
1. In your Supabase project dashboard → Authentication → Users → "Add user," create the account with their email and a temporary password.
2. In the SQL editor, run:
   ```sql
   insert into staff_profiles (user_id, display_name, role)
   values ('<the new user's UUID from step 1>', 'Their Name', 'staff'); -- or 'owner'
   ```
3. They can now log in at `/admin/login`.

There's no in-app "invite a teammate" screen yet — this is a reasonable place to add one later if the team grows.

---

## 11. What still needs attorney sign-off before real launch

- [ ] Every product's actual compliance category (this build defaults everything to `DO_NOT_SELL` — see `COMPLIANCE_STARTER_CHECKLIST.md` for a non-binding starting point).
- [ ] The warning-label text for `RESTRICTED_DTC` and `PICKUP_ONLY` products (currently a placeholder).
- [ ] The banned-terms content-check list (currently a ~24-term starter list).
- [ ] The monthly CSV export's field mapping against Florida DOR's actual required filing format.
- [ ] Whether `PICKUP_ONLY` vs `RESTRICTED_DTC` is the right classification for each specific product — this build only defines the *mechanism* for both; it does not decide which products belong in which category.
- [ ] State-by-state `RESTRICTED_DTC` registration status (all states start unregistered/blocked).

## 12. Known follow-ups (not urgent, not blocking)

- No specialty carrier is connected yet (§5).
- No self-serve Trade/wholesale login yet (§6) — applications are handled manually.
- Only one pickup location exists, hand-edited in Supabase directly.
- No staff self-serve invite flow (§10).
