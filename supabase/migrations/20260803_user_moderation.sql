begin;

alter table public.profiles add column if not exists banned boolean not null default false;
alter table public.profiles add column if not exists banned_at timestamptz;
alter table public.profiles add column if not exists ban_reason text not null default '';

commit;
