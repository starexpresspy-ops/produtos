-- Buckets de storage (executar no SQL Editor do Supabase)
-- Limite de 1 MB por arquivo para manter custo baixo

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'product-images',
    'product-images',
    true,
    1048576,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'store-assets',
    'store-assets',
    true,
    1048576,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura publica dos arquivos
drop policy if exists "storage_public_read_product_images" on storage.objects;
create policy "storage_public_read_product_images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "storage_public_read_store_assets" on storage.objects;
create policy "storage_public_read_store_assets"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'store-assets');

-- Upload somente por lojista autenticado
drop policy if exists "storage_lojista_insert_product_images" on storage.objects;
create policy "storage_lojista_insert_product_images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and public.is_active_lojista()
  );

drop policy if exists "storage_lojista_insert_store_assets" on storage.objects;
create policy "storage_lojista_insert_store_assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'store-assets'
    and public.is_active_lojista()
  );

-- Atualizar e remover somente por lojista
drop policy if exists "storage_lojista_update_product_images" on storage.objects;
create policy "storage_lojista_update_product_images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_active_lojista())
  with check (bucket_id = 'product-images' and public.is_active_lojista());

drop policy if exists "storage_lojista_update_store_assets" on storage.objects;
create policy "storage_lojista_update_store_assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'store-assets' and public.is_active_lojista())
  with check (bucket_id = 'store-assets' and public.is_active_lojista());

drop policy if exists "storage_lojista_delete_product_images" on storage.objects;
create policy "storage_lojista_delete_product_images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_active_lojista());

drop policy if exists "storage_lojista_delete_store_assets" on storage.objects;
create policy "storage_lojista_delete_store_assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'store-assets' and public.is_active_lojista());
