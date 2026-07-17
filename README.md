# Ali Baba Smoke Shop

A full e-commerce site for Ali Baba Smoke Shop (Tampa, FL) — product catalog, cart, checkout, real payment processing, and a compliance rule system for regulated products (tobacco/vapor/hemp-adjacent goods). Built with Next.js (App Router), Tailwind CSS, Supabase, and Authorize.Net, deployed on Vercel.

The catalog ships with a **placeholder product set** (vapes, disposables, e-liquids, glass, hookah, papers, grinders, lighters, accessories, apparel) so the site is fully browsable out of the box. Swap in real inventory whenever you're ready — see [Managing products](#managing-products) below.

**Every product defaults to blocked from sale** until a staff member explicitly reclassifies it in the admin dashboard — this is a regulated retail category and nothing is assumed sellable. See **[COMPLIANCE.md](./COMPLIANCE.md)** for the full plain-language explanation of every compliance rule and where to configure it; that document (not this one) is the one to hand to your attorney.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase** (Postgres + Auth) for the product catalog, orders, and the compliance system (state registrations, audit log, staff accounts)
- **Authorize.Net** (Accept.js + the `authorizenet` SDK) for payment processing
- **Framer Motion** + **lucide-react** for UI interactions/icons
- Cart state via React Context + `localStorage` (guest checkout, no consumer accounts — staff/admin login is separate, see below)

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The site works immediately using the built-in placeholder catalog (`lib/data/`) even with no environment variables set — you just won't be able to complete a real checkout until Authorize.Net is configured, and orders won't persist until Supabase is configured.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in values (see below for where to get them). Add the same variables in **Vercel → Project Settings → Environment Variables** for your deployed site.

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (**secret** — server-only) |
| `NEXT_PUBLIC_AUTHORIZE_NET_ENVIRONMENT` | `sandbox` for testing, `production` when live |
| `NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID` | Authorize.Net account → Account → Security Settings → API Credentials & Keys |
| `NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY` | Same page — generate a "Public Client Key" |
| `AUTHORIZE_NET_TRANSACTION_KEY` | Same page — Transaction Key (**secret** — server-only) |

### Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/schema.sql`, then `supabase/seed.sql` (in that order) to create the tables (catalog, orders, and the whole compliance system) and load the placeholder catalog + starter reference data. `schema.sql` is safe to re-run any time you pull an update that adds new columns/tables.
3. Copy the Project URL, `anon` public key, and `service_role` secret key into your env vars.
4. Create your first staff account so you can log into `/admin` — see [Admin dashboard & staff accounts](#admin-dashboard--staff-accounts) below.

If Supabase isn't configured, the site automatically falls back to the static catalog in `lib/data/` for product listings (still `DO_NOT_SELL` by default — see below) — but orders, the admin dashboard, and everything compliance-related need Supabase configured to function.

### Setting up Authorize.Net

1. Create a free **sandbox** account at [developer.authorize.net](https://developer.authorize.net) to get test credentials — use these while building.
2. Generate a Public Client Key (for Accept.js, used client-side) and note your API Login ID and Transaction Key.
3. Test with [Authorize.Net's sandbox test card numbers](https://developer.authorize.net/hello_world/testing_guide.html).
4. **Going live is a separate step.** Standard Authorize.Net/merchant-bank underwriting is often reluctant to approve tobacco, vape, and smoke shop merchants. You'll likely need a **high-risk-friendly merchant account provider** that partners with Authorize.Net (e.g. PaymentCloud, Durango Merchant Services, Host Merchant Services, Easy Pay Direct) to get approved for production processing. Once approved, switch `NEXT_PUBLIC_AUTHORIZE_NET_ENVIRONMENT` to `production` and swap in your live credentials.

Card numbers are tokenized client-side by Authorize.Net's Accept.js and never touch this app's server — only the resulting opaque token is sent to `app/api/checkout/route.ts`, which charges it via the Authorize.Net Transaction API and never sees raw card data. Order totals are also recalculated server-side from the catalog before charging, so a tampered client request can't check out at an arbitrary amount.

## Managing products

- **Quick edits:** update `lib/data/products.ts` / `lib/data/categories.ts` directly — no database required.
- **Once Supabase is configured:** the app reads products/categories from Supabase first (falling back to the static data only if Supabase is unreachable or empty). Edit catalog fields (name/price/description/etc.) directly in the Supabase table editor, or re-run `npm run generate:seed` after editing `lib/data/` to regenerate `supabase/seed.sql` from the same source of truth.
- **Compliance category:** every product — static or Supabase — defaults to `DO_NOT_SELL` and won't appear on the storefront at all until reclassified in **Admin → Products**. This isn't a bug; see [COMPLIANCE.md](./COMPLIANCE.md).

## Admin dashboard & staff accounts

`/admin` is the compliance dashboard: product classification, state-by-state shipping registration, pickup-order fulfillment with an in-person ID-check flow, Trade/wholesale applications, the full audit log (with a monthly CSV export), and a marketing-copy content checker. It's gated by real Supabase Auth accounts, not a shared password, so every action in the audit log is attributable to a real person.

**Creating your first staff account:**
1. In your Supabase project dashboard → Authentication → Users → **Add user**, create an account with an email + password.
2. In the SQL editor, run:
   ```sql
   insert into staff_profiles (user_id, display_name, role)
   values ('<paste the user's UUID from step 1>', 'Your Name', 'owner');
   ```
3. Log in at `/admin/login`.

See [COMPLIANCE.md](./COMPLIANCE.md) §10 for adding additional staff, and the rest of that document for what every admin page actually does.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new) — it auto-detects Next.js, no config needed.
3. Add all the environment variables above in the Vercel project settings.
4. Deploy.

## Compliance

This is a regulated retail category (tobacco/vapor/hemp-adjacent goods) with a full rule system built in — product categories that gate what can be shipped vs. picked up vs. sold at all, state-by-state shipping registration, age verification at checkout, an audit trail, and a marketing-copy checker. **Read [COMPLIANCE.md](./COMPLIANCE.md) before real launch** — it explains every rule in plain language and lists exactly what still needs your attorney's sign-off (product classifications, warning-label text, the banned-terms list, and the monthly filing export). `COMPLIANCE_STARTER_CHECKLIST.md` has non-binding suggested starting categories for the current placeholder catalog.

The 21+ age gate and footer disclaimers are a starting point, but none of the placeholder legal copy should be treated as compliant as-is — it needs review by a lawyer familiar with tobacco/vape/hookah/hemp retail regulations in your state, which change often.
