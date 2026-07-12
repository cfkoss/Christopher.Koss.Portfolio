-- Storage buckets + policies

-- User-uploaded images. Path convention: {site_id}/{uuid}.{ext}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

-- Platform-owned assets (template thumbnails, demo images). Service-role write only.
insert into storage.buckets (id, name, public)
values ('template-assets', 'template-assets', true)
on conflict (id) do nothing;

create policy "assets_public_read" on storage.objects
  for select using (bucket_id in ('site-assets', 'template-assets'));

create policy "site_assets_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'site-assets'
    and (storage.foldername(name))[1] in (
      select id::text from public.sites where owner_id = (select auth.uid())
    )
  );

create policy "site_assets_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'site-assets'
    and (storage.foldername(name))[1] in (
      select id::text from public.sites where owner_id = (select auth.uid())
    )
  );

create policy "site_assets_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'site-assets'
    and (storage.foldername(name))[1] in (
      select id::text from public.sites where owner_id = (select auth.uid())
    )
  );
