-- Pedidos da vitrine (checkout via WhatsApp)

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  total numeric not null,
  whatsapp_message text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id) on delete set null
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_slug text,
  sku text,
  short_description text,
  unit_price numeric not null,
  quantity int not null check (quantity > 0),
  subtotal numeric not null
);

create index if not exists orders_status_created_idx on orders (status, created_at desc);
create index if not exists order_items_order_id_idx on order_items (order_id);

alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "orders_public_insert" on orders;
create policy "orders_public_insert"
  on orders for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "orders_lojista_select" on orders;
create policy "orders_lojista_select"
  on orders for select
  to authenticated
  using (public.is_active_lojista());

drop policy if exists "orders_lojista_update" on orders;
create policy "orders_lojista_update"
  on orders for update
  to authenticated
  using (public.is_active_lojista())
  with check (public.is_active_lojista());

drop policy if exists "orders_lojista_delete" on orders;
create policy "orders_lojista_delete"
  on orders for delete
  to authenticated
  using (public.is_active_lojista());

drop policy if exists "order_items_public_insert" on order_items;
create policy "order_items_public_insert"
  on order_items for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and o.status = 'pending'
    )
  );

drop policy if exists "order_items_lojista_select" on order_items;
create policy "order_items_lojista_select"
  on order_items for select
  to authenticated
  using (public.is_active_lojista());

drop policy if exists "order_items_lojista_delete" on order_items;
create policy "order_items_lojista_delete"
  on order_items for delete
  to authenticated
  using (public.is_active_lojista());
