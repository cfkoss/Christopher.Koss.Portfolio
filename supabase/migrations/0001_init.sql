-- Portfolio marketplace: core schema + RLS
create extension if not exists citext;

-- ─── profiles ──────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── templates (platform catalog, admin-managed) ───────────────────────────
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, -- must match a key in lib/templates/registry.ts
  name text not null,
  description text,
  thumbnail_path text,
  price_monthly_cents int not null default 900,
  status text not null default 'published'
    check (status in ('draft', 'published', 'retired')),
  created_at timestamptz not null default now()
);

-- ─── sites (one user's rental of a template) ───────────────────────────────
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.templates(id),
  subdomain citext unique not null
    check (subdomain ~ '^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$'),
  custom_domain citext unique, -- phase 2
  name text not null,
  tagline text,
  hero_title text,
  settings jsonb not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sites_owner_idx on public.sites (owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sites_set_updated_at
  before update on public.sites
  for each row execute function public.set_updated_at();

-- ─── sections (user-defined; replaces hardcoded categories) ────────────────
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'),
  title text not null,
  description text,
  cover_image_path text,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (site_id, slug)
);
create index sections_site_idx on public.sections (site_id);

-- ─── projects ───────────────────────────────────────────────────────────────
-- site_id is denormalized so RLS policies stay single-join.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'),
  title text not null,
  description text,
  body text,
  cover_image_path text,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (section_id, slug)
);
create index projects_site_idx on public.projects (site_id);
create index projects_section_idx on public.projects (section_id);

-- ─── project images (gallery) ───────────────────────────────────────────────
create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_idx on public.project_images (project_id);
create index project_images_site_idx on public.project_images (site_id);

-- ─── subscriptions (populated in phase 2 by Stripe webhooks) ────────────────
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid unique not null references public.sites(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ─── subdomain availability (security definer: anon can't see other sites) ──
create or replace function public.subdomain_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.sites where subdomain = candidate::citext
  );
$$;
revoke all on function public.subdomain_available(text) from public;
grant execute on function public.subdomain_available(text) to anon, authenticated;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.sites enable row level security;
alter table public.sections enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.subscriptions enable row level security;

-- profiles: owner only
create policy "profiles_select_own" on public.profiles
  for select using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update using (id = (select auth.uid()));

-- templates: everyone can browse the published catalog; writes via service role only
create policy "templates_select_published" on public.templates
  for select using (status = 'published');

-- sites: owner full CRUD; anyone can read published sites
create policy "sites_select_own_or_published" on public.sites
  for select using (owner_id = (select auth.uid()) or is_published);
create policy "sites_insert_own" on public.sites
  for insert with check (owner_id = (select auth.uid()));
create policy "sites_update_own" on public.sites
  for update using (owner_id = (select auth.uid()));
create policy "sites_delete_own" on public.sites
  for delete using (owner_id = (select auth.uid()));

-- content tables: owner CRUD via denormalized site_id; public read when site is published
create policy "sections_owner_all" on public.sections
  for all
  using (site_id in (select id from public.sites where owner_id = (select auth.uid())))
  with check (site_id in (select id from public.sites where owner_id = (select auth.uid())));
create policy "sections_public_read" on public.sections
  for select using (
    exists (select 1 from public.sites s where s.id = site_id and s.is_published)
  );

create policy "projects_owner_all" on public.projects
  for all
  using (site_id in (select id from public.sites where owner_id = (select auth.uid())))
  with check (site_id in (select id from public.sites where owner_id = (select auth.uid())));
create policy "projects_public_read" on public.projects
  for select using (
    exists (select 1 from public.sites s where s.id = site_id and s.is_published)
  );

create policy "project_images_owner_all" on public.project_images
  for all
  using (site_id in (select id from public.sites where owner_id = (select auth.uid())))
  with check (site_id in (select id from public.sites where owner_id = (select auth.uid())));
create policy "project_images_public_read" on public.project_images
  for select using (
    exists (select 1 from public.sites s where s.id = site_id and s.is_published)
  );

-- subscriptions: owner read; writes via service role (Stripe webhooks) only
create policy "subscriptions_select_own" on public.subscriptions
  for select using (
    site_id in (select id from public.sites where owner_id = (select auth.uid()))
  );
