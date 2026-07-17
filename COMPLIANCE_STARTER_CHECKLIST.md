# Compliance Starter Checklist (non-binding — pending attorney sign-off)

This is **not** a live configuration file and nothing here is applied automatically — every product in the actual catalog defaults to `DO_NOT_SELL` regardless of what's suggested below (see `COMPLIANCE.md` §1). This is a starting-point checklist for you and your attorney to work through in **Admin → Products**, built only from the categories the compliance spec itself already defined (glass/grinders/papers/hardware/storage → `FREE_SHIP`; nicotine vapor products/traditional tobacco → `RESTRICTED_DTC`). It does not represent a legal judgment about what's actually sellable in any state — that determination is yours.

The file `product-compliance-catalog.md` referenced in the original spec doesn't exist in this project; this checklist was drafted to stand in for it until you and your attorney produce the real thing.

## Suggested starting categories

### Vapes & Devices — hardware only, no nicotine liquid
Matches the spec's own "empty vape hardware" → `FREE_SHIP` example.
- Northbound Pro Mod Kit
- Oasis Pod System Starter Kit
- Ember & Oak Replacement Coils (5-pack)
- Bazaar Blend Sub-Ohm Tank

**Suggested: `FREE_SHIP`**

### Disposables & E-Liquids — contain nicotine
Matches the spec's own "nicotine vapor products" → `RESTRICTED_DTC` example.
- Genie's Choice 5000 Puff Disposable
- Sultan's Reserve Mini Disposable
- Lamp & Vine 10000 Puff Disposable
- Tampa Bay Vapor Co. Variety 3-Pack
- Desert Ember Nic Salt 30mL
- Cloud Peak Freebase 60mL
- Bazaar Blend Menthol Ice 30mL

**Suggested: `RESTRICTED_DTC`**

### Glass & Water Pipes
Matches the spec's own "glass" → `FREE_SHIP` example directly.
- Oasis Beaker Water Pipe 12"
- Northbound Spoon Hand Pipe
- Ember & Oak Mini Bubbler
- Lamp & Vine Recycler Rig 8"

**Suggested: `FREE_SHIP`** — but see COMPLIANCE.md §9 on marketing-copy framing: it's the description language, not the item, that creates paraphernalia liability for this category specifically. Run these descriptions through Admin → Content Check.

### Hookah & Shisha — split by whether it's hardware or tobacco
- Sultan's Reserve 32" Hookah (hardware) — **suggested `FREE_SHIP`**, same reasoning as glass.
- Genie's Choice Natural Coconut Coals (not tobacco) — **suggested `FREE_SHIP`**.
- Desert Ember Hookah Heat Management Device (hardware) — **suggested `FREE_SHIP`**.
- Bazaar Blend Double Apple Shisha 250g (flavored **tobacco**) — matches the spec's "traditional tobacco" example. **Suggested `RESTRICTED_DTC`**, not `FREE_SHIP` like the rest of this category.

### Rolling Papers & Wraps — one exception
- Northbound Unbleached Rolling Papers — matches the spec's own "rolling papers" → `FREE_SHIP` example. **Suggested `FREE_SHIP`**.
- Cloud Peak Pre-Rolled Cones (6-pack) — same. **Suggested `FREE_SHIP`**.
- **Ember & Oak Flavored Hemp Wraps (4-pack) — do NOT default this to `FREE_SHIP` with the others.** This is a hemp-derived product, and the spec flags federal hemp regulation as actively changing (Total-THC standard effective November 12, 2026) and Florida kratom/hemp status as unsettled generally. **Flag `needs_legal_review` and leave as `DO_NOT_SELL` until your attorney confirms its status**, independent of the plain-paper items in this category.

### Grinders
Matches the spec's own "grinders" → `FREE_SHIP` example directly.
- Oasis 4-Piece Aluminum Grinder 2.5"
- Lamp & Vine Electric Herb Grinder

**Suggested: `FREE_SHIP`**

### Lighters & Torches
General merchandise, not a smoke-shop-specific regulated category (sold at any gas station/drugstore) — not one of the spec's listed gray areas.
- Desert Ember Triple Jet Torch Lighter
- Bazaar Blend Classic Flint Lighter (5-pack)

**Suggested: `FREE_SHIP`**

### Smoking Accessories
Matches the spec's own "storage" → `FREE_SHIP` example.
- Northbound Rolling Tray Set
- Genie's Choice Odor-Proof Storage Case
- Ember & Oak Glass Cleaning Kit

**Suggested: `FREE_SHIP`**

### Apparel & Merch
Not a regulated product category at all.
- Ali Baba Smoke Shop Logo Tee
- Ali Baba Smoke Shop Snapback Hat
- Ali Baba Smoke Shop Sticker Pack

**Suggested: `FREE_SHIP`**

---

## Not represented in the current placeholder catalog, but worth planning for

The original spec mentions kratom and hemp-derived products generally as categories this business may carry. Neither appears in the current demo catalog. If/when real kratom or hemp-derived (CBD, Delta-8/9/10, etc.) SKUs are added:
- Default them to `DO_NOT_SELL` with `needs_legal_review = true`, same as everything else — do not extend the `FREE_SHIP` suggestions above to these by analogy. Florida kratom regulation is explicitly unsettled per the spec, and the federal hemp Total-THC standard takes effect November 12, 2026 — both need their own attorney review, not a guess based on how similar-looking products were classified.

## What to actually do with this checklist

1. Open **Admin → Products**.
2. Work through each row. For the ones suggested `FREE_SHIP` or `RESTRICTED_DTC` above, confirm with your attorney, then set the category, uncheck "needs legal review" if it's resolved, and write a one-line reason (e.g., "Attorney confirmed FREE_SHIP — hardware only, no nicotine — 2026-07-20").
3. For `RESTRICTED_DTC` items, also set up **Admin → State Registrations** for every state you're actually ATF + tax registered in before customers there can check out.
4. Leave everything else — and specifically the flagged hemp wraps SKU — at `DO_NOT_SELL` until reviewed.
