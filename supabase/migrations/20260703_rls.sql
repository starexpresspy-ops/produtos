-- Helper: lojista ativo autenticado
create or replace function public.is_active_lojista()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role = 'lojista'
  );
$$;

-- PROFILES
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- CATEGORIES
alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (active = true);

drop policy if exists "categories_lojista_read" on public.categories;
create policy "categories_lojista_read"
  on public.categories for select
  to authenticated
  using (public.is_active_lojista());

drop policy if exists "categories_lojista_insert" on public.categories;
create policy "categories_lojista_insert"
  on public.categories for insert
  to authenticated
  with check (public.is_active_lojista());

drop policy if exists "categories_lojista_update" on public.categories;
create policy "categories_lojista_update"
  on public.categories for update
  to authenticated
  using (public.is_active_lojista())
  with check (public.is_active_lojista());

drop policy if exists "categories_lojista_delete" on public.categories;
create policy "categories_lojista_delete"
  on public.categories for delete
  to authenticated
  using (public.is_active_lojista());

-- BRANDS
alter table public.brands enable row level security;

drop policy if exists "brands_public_read" on public.brands;
create policy "brands_public_read"
  on public.brands for select
  to anon, authenticated
  using (active = true);

drop policy if exists "brands_lojista_read" on public.brands;
create policy "brands_lojista_read"
  on public.brands for select
  to authenticated
  using (public.is_active_lojista());

drop policy if exists "brands_lojista_insert" on public.brands;
create policy "brands_lojista_insert"
  on public.brands for insert
  to authenticated
  with check (public.is_active_lojista());

drop policy if exists "brands_lojista_update" on public.brands;
create policy "brands_lojista_update"
  on public.brands for update
  to authenticated
  using (public.is_active_lojista())
  with check (public.is_active_lojista());

drop policy if exists "brands_lojista_delete" on public.brands;
create policy "brands_lojista_delete"
  on public.brands for delete
  to authenticated
  using (public.is_active_lojista());

-- PRODUCTS
alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (active = true and deleted_at is null);

drop policy if exists "products_lojista_read" on public.products;
create policy "products_lojista_read"
  on public.products for select
  to authenticated
  using (public.is_active_lojista());

drop policy if exists "products_lojista_insert" on public.products;
create policy "products_lojista_insert"
  on public.products for insert
  to authenticated
  with check (public.is_active_lojista());

drop policy if exists "products_lojista_update" on public.products;
create policy "products_lojista_update"
  on public.products for update
  to authenticated
  using (public.is_active_lojista())
  with check (public.is_active_lojista());

-- PRODUCT IMAGES
alter table public.product_images enable row level security;

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and p.active = true
        and p.deleted_at is null
    )
  );

drop policy if exists "product_images_lojista_read" on public.product_images;
create policy "product_images_lojista_read"
  on public.product_images for select
  to authenticated
  using (public.is_active_lojista());

drop policy if exists "product_images_lojista_insert" on public.product_images;
create policy "product_images_lojista_insert"
  on public.product_images for insert
  to authenticated
  with check (public.is_active_lojista());

drop policy if exists "product_images_lojista_update" on public.product_images;
create policy "product_images_lojista_update"
  on public.product_images for update
  to authenticated
  using (public.is_active_lojista())
  with check (public.is_active_lojista());

drop policy if exists "product_images_lojista_delete" on public.product_images;
create policy "product_images_lojista_delete"
  on public.product_images for delete
  to authenticated
  using (public.is_active_lojista());

-- STORE SETTINGS
alter table public.store_settings enable row level security;

drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read"
  on public.store_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "store_settings_lojista_insert" on public.store_settings;
create policy "store_settings_lojista_insert"
  on public.store_settings for insert
  to authenticated
  with check (public.is_active_lojista());

drop policy if exists "store_settings_lojista_update" on public.store_settings;
create policy "store_settings_lojista_update"
  on public.store_settings for update
  to authenticated
  using (public.is_active_lojista())
  with check (public.is_active_lojista());
