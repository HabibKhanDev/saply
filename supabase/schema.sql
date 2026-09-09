-- =====================================================================
-- GUMELI SURGICAL - SUPABASE SCHEMA
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- Needed for gen_random_uuid() (already enabled on most Supabase projects)
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PRODUCTS
-- purchase_price is PRIVATE. It is protected with column-level GRANTs
-- at the bottom of this file so customers can NEVER read it.
-- ---------------------------------------------------------------------
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text default '',
  images           jsonb not null default '[]'::jsonb,
  category         text not null default 'General',
  brand            text,
  sku              text,
  sizes            jsonb not null default '["Standard"]'::jsonb,
  purchase_price   numeric(12,2) not null default 0,   -- PRIVATE (admin only)
  selling_price    numeric(12,2) not null default 0,
  discount         numeric(5,1) not null default 0,    -- percent
  offer            text,
  bonus            text,
  stock            integer not null default 0,         -- remaining quantity
  sold             integer not null default 0,
  low_stock_alert  integer not null default 5,
  status           text not null default 'active',     -- active | hidden
  featured         boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_status_idx on products (status);

-- ---------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------
create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique,
  customer_name text not null,
  shop_name     text,
  phone         text not null,
  whatsapp      text,
  city          text default '',
  address       text default '',
  notes         text default '',
  subtotal      numeric(12,2) not null default 0,
  discount      numeric(12,2) not null default 0,
  total         numeric(12,2) not null default 0,
  status        text not null default 'Pending',
  created_at    timestamptz not null default now()
);

create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);

-- ---------------------------------------------------------------------
-- ORDER ITEMS (purchase_price snapshot kept here for profit reports)
-- ---------------------------------------------------------------------
create table if not exists order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  product_id     uuid,
  product_name   text not null,
  size           text default '',
  quantity       integer not null default 1,
  purchase_price numeric(12,2) not null default 0,   -- PRIVATE (admin only)
  selling_price  numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0
);

create index if not exists order_items_order_idx on order_items (order_id);

-- ---------------------------------------------------------------------
-- ADMIN SETTINGS (single row, id = 1)
-- ---------------------------------------------------------------------
create table if not exists admin_settings (
  id           integer primary key default 1,
  store_name   text not null default 'Gumeli Surgical',
  logo_url     text default '',
  phone        text default '',
  whatsapp     text default '',
  address      text default '',
  city         text default '',
  footer_text  text default 'Wholesale Medical & Surgical Supplies.',
  updated_at   timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into admin_settings (id) values (1) on conflict (id) do nothing;

-- Seed categories
insert into categories (name) values
  ('Gloves'), ('Masks'), ('Syringes'), ('IV & Infusion'),
  ('Catheters & Bags'), ('Dressings & Bandages'), ('Respiratory'),
  ('Diagnostics')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- ORDER NUMBER COUNTER  (GS-1001, GS-1002 ...)
-- ---------------------------------------------------------------------
create table if not exists order_number_counter (
  id         integer primary key default 1,
  last_value integer not null default 1000,
  constraint one_row check (id = 1)
);
insert into order_number_counter (id) values (1) on conflict (id) do nothing;

create or replace function next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare next_no integer;
begin
  update order_number_counter
     set last_value = last_value + 1
   where id = 1
  returning last_value into next_no;
  return 'GS-' || next_no;
end;
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table categories       enable row level security;
alter table products         enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table admin_settings   enable row level security;
alter table order_number_counter enable row level security;

-- CATEGORIES: anyone can read, only admin can write
drop policy if not exists categories_public_read on categories;
create policy categories_public_read on categories
  for select to anon, authenticated using (true);

drop policy if not exists categories_admin_write on categories;
create policy categories_admin_write on categories
  for all to authenticated using (true) with check (true);

-- PRODUCTS: public can only read ACTIVE products, admin has full access
drop policy if not exists products_public_read on products;
create policy products_public_read on products
  for select to anon using (status = 'active');

drop policy if not exists products_admin_all on products;
create policy products_admin_all on products
  for all to authenticated using (true) with check (true);

-- ORDERS: public can INSERT (place an order), only admin can read/update
drop policy if not exists orders_public_insert on orders;
create policy orders_public_insert on orders
  for insert to anon with check (true);

drop policy if not exists orders_admin_all on orders;
create policy orders_admin_all on orders
  for all to authenticated using (true) with check (true);

-- ORDER ITEMS: public can INSERT, only admin can read
drop policy if not exists items_public_insert on order_items;
create policy items_public_insert on order_items
  for insert to anon with check (true);

drop policy if not exists items_admin_all on order_items;
create policy items_admin_all on order_items
  for all to authenticated using (true) with check (true);

-- SETTINGS: public read, admin write
drop policy if not exists settings_public_read on admin_settings;
create policy settings_public_read on admin_settings
  for select to anon, authenticated using (true);

drop policy if not exists settings_admin_write on admin_settings;
create policy settings_admin_write on admin_settings
  for update to authenticated using (true) with check (true);

-- Order number function callable by everyone (it only increments safely)
grant execute on function next_order_number() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Automatically fills PRIVATE cost fields when a customer orders.
-- Customers never send (and can never read) purchase prices.
-- ---------------------------------------------------------------------
create or replace function fill_item_private_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare cost numeric; pname text;
begin
  if new.product_id is not null then
    select purchase_price, name into cost, pname from products where id = new.product_id;
    if (new.purchase_price is null or new.purchase_price = 0) and cost is not null then
      new.purchase_price := cost;
    end if;
    if (new.product_name is null or new.product_name = '') and pname is not null then
      new.product_name := pname;
    end if;
  end if;
  if new.total is null or new.total = 0 then
    new.total := new.selling_price * new.quantity;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_fill_item_private_fields on order_items;
create trigger trg_fill_item_private_fields
  before insert on order_items
  for each row execute function fill_item_private_fields();

-- =====================================================================
-- COLUMN-LEVEL PRIVACY (hides cost / profit data from customers)
-- =====================================================================
-- Customers (anon role) may SELECT only the public product columns.
revoke all on products from anon;
grant select (
  id, name, description, images, category, brand, sku, sizes,
  selling_price, discount, offer, bonus, stock, low_stock_alert,
  status, featured, created_at
) on products to anon;

-- Admin users may do everything with products
grant select, insert, update, delete on products to authenticated;

-- Orders: customers may only insert (never read orders back)
revoke all on orders from anon;
grant insert on orders to anon;
grant select, insert, update, delete on orders to authenticated;

-- Order items: same - customers can only create them
revoke all on order_items from anon;
grant insert on order_items to anon;
grant select, insert, update, delete on order_items to authenticated;

-- Settings & categories normal access
grant select on admin_settings to anon;
grant select, update on admin_settings to authenticated;
grant select on categories to anon;
grant select, insert, update, delete on categories to authenticated;

-- =====================================================================
-- STORAGE BUCKET  ("store-images" - public read, admin write)
-- Create the bucket in Dashboard -> Storage, or run the lines below.
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('store-images', 'store-images', true)
on conflict (id) do update set public = true;

drop policy if not exists storage_public_read on storage.objects;
create policy storage_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'store-images');

drop policy if not exists storage_admin_insert on storage.objects;
create policy storage_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'store-images');

drop policy if not exists storage_admin_update on storage.objects;
create policy storage_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'store-images');

drop policy if not exists storage_admin_delete on storage.objects;
create policy storage_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'store-images');

-- =====================================================================
-- DONE. Next:
-- 1. Authentication -> Users -> Add user  (this is your admin login)
-- 2. Storage -> confirm bucket "store-images" exists
-- =====================================================================
