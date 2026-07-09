-- Modo manutencao: oculta a vitrine publica com mensagem personalizada

alter table public.store_settings
  add column if not exists maintenance_mode boolean not null default false;

alter table public.store_settings
  add column if not exists maintenance_message text;
