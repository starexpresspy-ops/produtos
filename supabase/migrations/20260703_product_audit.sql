-- Campos de auditoria em produtos
alter table public.products
  add column if not exists updated_at timestamptz not null default now();

alter table public.products
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();
