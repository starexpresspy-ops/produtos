-- Corrige RLS de pedidos (insert publico + leitura para confirmacao)

alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "orders_public_insert" on orders;
create policy "orders_public_insert"
  on orders for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "orders_public_select_confirmation" on orders;
create policy "orders_public_select_confirmation"
  on orders for select
  to anon, authenticated
  using (
    status = 'pending'
    and created_at > now() - interval '7 days'
  );

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

drop policy if exists "order_items_public_select_confirmation" on order_items;
create policy "order_items_public_select_confirmation"
  on order_items for select
  to anon, authenticated
  using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and o.status = 'pending'
        and o.created_at > now() - interval '7 days'
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
