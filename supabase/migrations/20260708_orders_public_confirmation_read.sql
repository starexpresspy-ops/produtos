-- Leitura publica do pedido recém-criado (tela de confirmacao para o cliente)

drop policy if exists "orders_public_select_confirmation" on orders;
create policy "orders_public_select_confirmation"
  on orders for select
  to anon
  using (
    status = 'pending'
    and created_at > now() - interval '7 days'
  );

drop policy if exists "order_items_public_select_confirmation" on order_items;
create policy "order_items_public_select_confirmation"
  on order_items for select
  to anon
  using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and o.status = 'pending'
        and o.created_at > now() - interval '7 days'
    )
  );
