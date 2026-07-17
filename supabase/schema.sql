-- Ali Baba Smoke Shop — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) before seed.sql.
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / ADD COLUMN
-- IF NOT EXISTS / DROP POLICY IF EXISTS + CREATE POLICY), so upgrading an
-- existing project just means re-running the whole file.

create extension if not exists pgcrypto;

-- =============================================================================
-- Core catalog (unchanged from the original build)
-- =============================================================================

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  icon text not null default 'Package'
);

create table if not exists products (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  category_slug text not null references categories (slug),
  brand text not null default '',
  image_seed text not null default '',
  in_stock boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text,
  shipping_address jsonb not null,
  subtotal_cents integer not null,
  total_cents integer not null,
  status text not null default 'pending',
  authorize_net_transaction_id text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id text,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price_cents integer not null
);

-- =============================================================================
-- Compliance system — see COMPLIANCE.md for a plain-language explanation of
-- every rule below and exactly where a non-developer configures it.
-- =============================================================================

-- Staff accounts (Supabase Auth users + a role). Provisioned manually by the
-- owner for now — see COMPLIANCE.md "Staff accounts" section.
create table if not exists staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

-- Compliance taxonomy fields on products. DO_NOT_SELL is the default for a
-- reason: a brand-new or unreviewed SKU must never be sellable until a human
-- explicitly reclassifies it via /admin/products.
alter table products add column if not exists compliance_category text
  not null default 'DO_NOT_SELL'
  check (compliance_category in ('FREE_SHIP', 'PICKUP_ONLY', 'RESTRICTED_DTC', 'WHOLESALE_ONLY', 'DO_NOT_SELL'));
alter table products add column if not exists needs_legal_review boolean not null default true;
alter table products add column if not exists last_compliance_review_date date;
alter table products add column if not exists reviewed_by uuid references staff_profiles (user_id);
alter table products add column if not exists compliance_expires_on date;
alter table products add column if not exists compliance_notes text not null default '';

-- Physical locations that can fulfill PICKUP_ONLY items.
create table if not exists pickup_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line1 text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  is_active boolean not null default true
);

-- Per-state registration status gating RESTRICTED_DTC shipping. A state is
-- only allowlisted when all three flags are true — see COMPLIANCE.md.
create table if not exists state_registrations (
  state text primary key,
  atf_registered boolean not null default false,
  tax_registered boolean not null default false,
  carrier_ready boolean not null default false,
  notes text not null default '',
  updated_by uuid references staff_profiles (user_id),
  updated_at timestamptz not null default now()
);

-- Lightweight Trade/wholesale interest intake (no self-serve login yet — see
-- COMPLIANCE.md "Wholesale / Trade program" for why this is scoped this way).
create table if not exists trade_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null default '',
  resale_cert_number text not null default '',
  business_license_number text not null default '',
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references staff_profiles (user_id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Every compliance-relevant action: a SKU's category changing, and every
-- checkout that included a RESTRICTED_DTC or PICKUP_ONLY item. This is the
-- table the monthly FL tobacco delivery-sale filing export reads from.
create table if not exists compliance_audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('product', 'checkout', 'state_registration', 'trade_application')),
  entity_id text not null,
  action text not null,
  previous_value jsonb,
  new_value jsonb,
  reason text not null default '',
  performed_by uuid references staff_profiles (user_id),
  created_at timestamptz not null default now()
);
create index if not exists compliance_audit_log_entity_idx on compliance_audit_log (entity_type, created_at);

-- Starter banned-terms list for the content-lint tool (/admin/content). This
-- is a STARTING point only — see COMPLIANCE.md for what still needs an
-- attorney's expansion/review.
create table if not exists content_banned_terms (
  id uuid primary key default gen_random_uuid(),
  phrase text not null unique,
  category text not null check (category in ('health_claim', 'paraphernalia_framing', 'minor_targeting')),
  severity text not null default 'warn' check (severity in ('warn', 'block')),
  notes text not null default ''
);

-- Admin-editable warning-label copy, rendered automatically on qualifying
-- product pages. Defaults to an obvious placeholder — never invent legal
-- warning text; an attorney must supply the real copy via /admin/content.
create table if not exists compliance_settings (
  key text primary key,
  value text not null default '',
  updated_by uuid references staff_profiles (user_id),
  updated_at timestamptz not null default now()
);

-- Checkout/fulfillment additions: age verification captured at the point of
-- an age-restricted purchase, and pickup routing. shipping_address is now
-- nullable — a pickup-only order (no shippable items at all) has none.
alter table orders alter column shipping_address drop not null;
alter table orders add column if not exists buyer_dob date;
alter table orders add column if not exists age_verified_at timestamptz;
alter table orders add column if not exists shipping_state text;
alter table orders add column if not exists pickup_location_id uuid references pickup_locations (id);

alter table order_items add column if not exists fulfillment_type text
  not null default 'ship' check (fulfillment_type in ('ship', 'pickup'));
alter table order_items add column if not exists compliance_category_snapshot text not null default 'FREE_SHIP';
alter table order_items add column if not exists picked_up_at timestamptz;
alter table order_items add column if not exists picked_up_verified_by uuid references staff_profiles (user_id);
alter table order_items add column if not exists id_check_confirmed boolean not null default false;

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table staff_profiles enable row level security;
alter table pickup_locations enable row level security;
alter table state_registrations enable row level security;
alter table trade_applications enable row level security;
alter table compliance_audit_log enable row level security;
alter table content_banned_terms enable row level security;
alter table compliance_settings enable row level security;

drop policy if exists "Public read categories" on categories;
create policy "Public read categories" on categories for select using (true);

-- Products: DO_NOT_SELL is never publicly visible. WHOLESALE_ONLY is only
-- visible to a session whose auth.uid() has an approved trade profile — this
-- enforces "never exposed to the general consumer storefront" at the data
-- layer, not just by hiding it in the UI. (No self-serve trade login exists
-- yet in this pass, so in practice WHOLESALE_ONLY is fully hidden today; this
-- policy is ready for when that program launches — see COMPLIANCE.md.)
drop policy if exists "Public read products" on products;
create policy "Public read sellable products" on products for select using (
  compliance_category in ('FREE_SHIP', 'PICKUP_ONLY', 'RESTRICTED_DTC')
  or (
    compliance_category = 'WHOLESALE_ONLY'
    and exists (
      select 1 from trade_applications ta
      where ta.email = (auth.jwt() ->> 'email') and ta.status = 'approved'
    )
  )
);

-- Public can read active pickup locations (needed to show a pickup option at
-- checkout) and read compliance_settings (needed to render warning labels).
drop policy if exists "Public read active pickup locations" on pickup_locations;
create policy "Public read active pickup locations" on pickup_locations for select using (is_active = true);

drop policy if exists "Public read compliance settings" on compliance_settings;
create policy "Public read compliance settings" on compliance_settings for select using (true);

-- Everything else (orders, order_items, staff_profiles, state_registrations,
-- trade_applications, compliance_audit_log, content_banned_terms) has NO
-- public policy on purpose. Only the service-role key — used exclusively in
-- server-side code (app/api/checkout/route.ts, everything under app/admin/,
-- and the order confirmation page) — can read or write them, since it
-- bypasses RLS entirely.
