-- Registro de IPs de visitantes da vitrine publica

create table if not exists public.storefront_visit_logs (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  path text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists storefront_visit_logs_created_at_idx
  on public.storefront_visit_logs (created_at desc);

create index if not exists storefront_visit_logs_ip_idx
  on public.storefront_visit_logs (ip_address);

alter table public.storefront_visit_logs enable row level security;

drop policy if exists "storefront_visit_logs_lojista_select" on public.storefront_visit_logs;
create policy "storefront_visit_logs_lojista_select"
  on public.storefront_visit_logs for select
  to authenticated
  using (public.is_active_lojista());
