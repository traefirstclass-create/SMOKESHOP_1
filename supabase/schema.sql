-- Ali Baba Smoke Shop — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) before seed.sql.

create extension if not exists pgcrypto;

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

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Product catalog is public read-only.
create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);

-- Orders are never readable/writable via the public anon key — only the
-- service role key (used exclusively in app/api/checkout/route.ts and the
-- order confirmation page, both server-side) can touch these tables, since
-- it bypasses RLS entirely. No policies are defined for orders/order_items
-- on purpose.
