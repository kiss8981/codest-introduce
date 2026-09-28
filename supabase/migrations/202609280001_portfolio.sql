create extension if not exists pgcrypto;

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  name text not null check (char_length(btrim(name)) between 1 and 150),
  summary text not null check (char_length(btrim(summary)) between 1 and 300),
  description text not null default '',
  category text not null default '프로젝트' check (char_length(btrim(category)) between 1 and 80),
  stack text[] not null default '{}'::text[],
  started_at date,
  ended_at date,
  is_maintained boolean not null default false,
  is_published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  thumbnail_photo_id uuid,
  mobile_thumbnail_photo_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_dates_ordered check (
    ended_at is null or started_at is null or ended_at >= started_at
  )
);

create index if not exists portfolio_published_order_idx
  on public.portfolio (sort_order, created_at desc)
  where is_published;

create table if not exists public.photo_map (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio(id) on delete cascade,
  storage_key text not null unique check (
    char_length(storage_key) between 1 and 500
    and storage_key !~ '(^/|[?#])'
    and position('..' in storage_key) = 0
  ),
  filename text not null check (char_length(btrim(filename)) between 1 and 255),
  file_size_bytes bigint not null check (file_size_bytes >= 0),
  mime_type text not null check (mime_type in (
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'
  )),
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  gallery_order integer check (gallery_order >= 0),
  created_at timestamptz not null default now(),
  unique (id, portfolio_id)
);

create index if not exists photo_map_gallery_idx
  on public.photo_map (portfolio_id, gallery_order, created_at);

alter table public.portfolio
  add constraint portfolio_thumbnail_owned_fk
    foreign key (thumbnail_photo_id, id)
    references public.photo_map (id, portfolio_id)
    deferrable initially deferred,
  add constraint portfolio_mobile_thumbnail_owned_fk
    foreign key (mobile_thumbnail_photo_id, id)
    references public.photo_map (id, portfolio_id)
    deferrable initially deferred;

create table if not exists public.portfolio_url (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio(id) on delete cascade,
  type text not null check (char_length(btrim(type)) between 1 and 40),
  label text check (label is null or char_length(btrim(label)) between 1 and 80),
  url text not null check (
    char_length(url) <= 2048
    and url ~* '^https://[^/[:space:]?#]+([/?#][^[:space:]]*)?$'
  ),
  sort_order integer not null default 0,
  unique (portfolio_id, type, url)
);

create index if not exists portfolio_url_order_idx
  on public.portfolio_url (portfolio_id, sort_order);

create or replace function public.set_portfolio_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger portfolio_updated_at
before update on public.portfolio
for each row execute function public.set_portfolio_updated_at();

revoke all on function public.set_portfolio_updated_at()
  from public, anon, authenticated;

alter table public.portfolio enable row level security;
alter table public.photo_map enable row level security;
alter table public.portfolio_url enable row level security;

revoke all on public.portfolio, public.photo_map, public.portfolio_url
  from public, anon, authenticated;
grant all on public.portfolio, public.photo_map, public.portfolio_url to service_role;
