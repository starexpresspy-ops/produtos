alter table public.store_settings
  add column if not exists whatsapp_number_secondary text;

alter table public.store_settings
  add column if not exists whatsapp_secondary_label text;
