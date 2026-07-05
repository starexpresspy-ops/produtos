create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_path text,
  active boolean not null default true
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text,
  short_description text,
  description text,
  price numeric not null,
  promotional_price numeric,
  category_id uuid references categories(id) on delete set null,
  brand_id uuid references brands(id) on delete set null,
  stock_quantity int not null default 0,
  stock_status text not null default 'available',
  hide_when_out_of_stock boolean not null default false,
  condition text not null default 'new',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_cover boolean not null default false
);

create table if not exists store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  whatsapp_number text not null,
  whatsapp_message_template text,
  instagram_url text,
  contact_email text,
  address_text text,
  delivery_text text,
  warranty_text text,
  exchange_policy text,
  business_hours text
);
