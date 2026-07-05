-- Tabela de perfis vinculada ao auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'lojista',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_role_check check (role in ('lojista', 'cliente'))
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_active_idx on public.profiles (active);

-- Funcao generica para atualizar updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
