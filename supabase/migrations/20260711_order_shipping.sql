-- Frete fixo de R$ 58,00 somado ao total do pedido

create or replace function public.create_public_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_whatsapp_message text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_line record;
  v_product products%rowtype;
  v_unit_price numeric;
  v_subtotal numeric;
  v_total numeric := 0;
  v_pending_qty int;
  v_shipping_fee numeric := 58;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'ORDER_EMPTY: O pedido precisa ter ao menos um item.';
  end if;

  for v_line in
    select
      (value->>'product_id')::uuid as product_id,
      sum((value->>'quantity')::int) as quantity,
      max(value->>'product_name') as product_name
    from jsonb_array_elements(p_items) as t(value)
    group by (value->>'product_id')::uuid
  loop
    if v_line.quantity is null or v_line.quantity < 1 then
      raise exception 'ORDER_INVALID_QTY: Quantidade invalida.';
    end if;

    select *
    into v_product
    from products
    where id = v_line.product_id
      and active = true
      and deleted_at is null
    for update;

    if not found then
      raise exception 'ORDER_UNAVAILABLE:%', coalesce(v_line.product_name, 'Produto');
    end if;

    if v_product.stock_status = 'unavailable' then
      raise exception 'ORDER_UNAVAILABLE:%', v_product.name;
    end if;

    if v_product.stock_quantity > 0 then
      select coalesce(sum(oi.quantity), 0)
      into v_pending_qty
      from order_items oi
      inner join orders o on o.id = oi.order_id
      where oi.product_id = v_product.id
        and o.status = 'pending';

      if v_pending_qty + v_line.quantity > v_product.stock_quantity then
        raise exception 'ORDER_OUT_OF_STOCK:%', v_product.name;
      end if;
    end if;

    v_unit_price := coalesce(v_product.promotional_price, v_product.price);
    v_subtotal := v_unit_price * v_line.quantity;
    v_total := v_total + v_subtotal;
  end loop;

  v_total := v_total + v_shipping_fee;

  insert into orders (
    customer_name,
    customer_phone,
    customer_address,
    total,
    whatsapp_message,
    status
  )
  values (
    p_customer_name,
    p_customer_phone,
    p_customer_address,
    v_total,
    p_whatsapp_message,
    'pending'
  )
  returning id into v_order_id;

  for v_line in
    select
      (value->>'product_id')::uuid as product_id,
      sum((value->>'quantity')::int) as quantity
    from jsonb_array_elements(p_items) as t(value)
    group by (value->>'product_id')::uuid
  loop
    select *
    into v_product
    from products
    where id = v_line.product_id;

    v_unit_price := coalesce(v_product.promotional_price, v_product.price);
    v_subtotal := v_unit_price * v_line.quantity;

    insert into order_items (
      order_id,
      product_id,
      product_name,
      product_slug,
      sku,
      short_description,
      unit_price,
      quantity,
      subtotal
    )
    values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.slug,
      v_product.sku,
      v_product.short_description,
      v_unit_price,
      v_line.quantity,
      v_subtotal
    );
  end loop;

  return v_order_id;
end;
$$;

revoke all on function public.create_public_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_public_order(text, text, text, text, jsonb) to service_role;
