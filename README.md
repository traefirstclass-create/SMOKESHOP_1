# Ali Baba Smoke Shop

A full e-commerce site for Ali Baba Smoke Shop (Tampa, FL) — product catalog, cart, checkout, and real payment processing. Built with Next.js (App Router), Tailwind CSS, Supabase, and Authorize.Net, deployed on Vercel.

The catalog ships with a **placeholder product set** (vapes, disposables, e-liquids, glass, hookah, papers, grinders, lighters, accessories, apparel) so the site is fully browsable out of the box. Swap in real inventory whenever you're ready — see [Managing products](#managing-products) below.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase** (Postgres) for the product catalog and orders
- **Authorize.Net** (Accept.js + the `authorizenet` SDK) for payment processing
- **Framer Motion** + **lucide-react** for UI interactions/icons
- Cart state via React Context + `localStorage` (guest checkout, no accounts)

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
2. Open the SQL editor and run `supabase/schema.sql`, then `supabase/seed.sql` (in that order) to create the tables and load the placeholder catalog.
3. Copy the Project URL, `anon` public key, and `service_role` secret key into your env vars.

If Supabase isn't configured, the site automatically falls back to the static catalog in `lib/data/` for product listings — but orders can't be saved until it's set up.

### Setting up Authorize.Net

1. Create a free **sandbox** account at [developer.authorize.net](https://developer.authorize.net) to get test credentials — use these while building.
2. Generate a Public Client Key (for Accept.js, used client-side) and note your API Login ID and Transaction Key.
3. Test with [Authorize.Net's sandbox test card numbers](https://developer.authorize.net/hello_world/testing_guide.html).
4. **Going live is a separate step.** Standard Authorize.Net/merchant-bank underwriting is often reluctant to approve tobacco, vape, and smoke shop merchants. You'll likely need a **high-risk-friendly merchant account provider** that partners with Authorize.Net (e.g. PaymentCloud, Durango Merchant Services, Host Merchant Services, Easy Pay Direct) to get approved for production processing. Once approved, switch `NEXT_PUBLIC_AUTHORIZE_NET_ENVIRONMENT` to `production` and swap in your live credentials.

Card numbers are tokenized client-side by Authorize.Net's Accept.js and never touch this app's server — only the resulting opaque token is sent to `app/api/checkout/route.ts`, which charges it via the Authorize.Net Transaction API and never sees raw card data. Order totals are also recalculated server-side from the catalog before charging, so a tampered client request can't check out at an arbitrary amount.

## Managing products

- **Quick edits:** update `lib/data/products.ts` / `lib/data/categories.ts` directly — no database required.
- **Once Supabase is configured:** the app reads products/categories from Supabase first (falling back to the static data only if Supabase is unreachable or empty). Edit rows directly in the Supabase table editor, or re-run `npm run generate:seed` after editing `lib/data/` to regenerate `supabase/seed.sql` from the same source of truth.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new) — it auto-detects Next.js, no config needed.
3. Add all the environment variables above in the Vercel project settings.
4. Deploy.

## Compliance note

This site includes a 21+ age gate and footer/product-page disclaimers as a starting point, but the placeholder legal copy (age restriction notice, shipping restrictions, etc.) should be reviewed by a lawyer familiar with tobacco/vape/hookah retail regulations in your state before real launch — requirements vary significantly by state and change often.
