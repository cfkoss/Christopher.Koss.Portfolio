# Foliomarket — portfolio template marketplace

A multi-tenant platform where designers rent a portfolio template, add their
work through a simple dashboard, and publish a live portfolio site on their
own subdomain (custom domains in Phase 2).

**Stack:** Next.js (App Router) · Supabase (auth, Postgres + RLS, storage) · Vercel

## How it works

- **Marketplace** (`app/(marketing)`) — landing page, template catalog and
  per-template detail pages with fully navigable live previews.
- **Templates** (`templates/*`, `lib/templates/registry.ts`) — each template
  is a pure renderer of the `PortfolioData` contract
  (`lib/portfolio/types.ts`). Adding a template = new folder + registry entry
  + a row in the `templates` table.
- **Dashboard** (`app/(dashboard)`) — onboarding wizard (template → name →
  subdomain), section manager, project editor with direct-to-storage image
  uploads (browser-side downscaling), publish toggle, settings.
- **Published sites** (`app/s/[site]`, `proxy.ts`) — the proxy rewrites
  `{sub}.{ROOT_DOMAIN}` to `/s/{sub}`; pages render server-side from a
  per-site tagged cache (`lib/tenant.ts`) that is revalidated on every save.
  Unpublished sites 404 for visitors; owners get a draft preview with a
  publish banner.
- **Security** — Supabase RLS is the source of truth: owners can CRUD their
  own rows, anonymous readers only see published sites. Storage policies
  restrict uploads to `site-assets/{owned-site-id}/…`.

## Local development

```bash
cp .env.example .env.local   # fill in Supabase URL + anon key
npm install
npm run dev
```

Apply `supabase/migrations/*.sql` and `supabase/seed.sql` to your Supabase
project (SQL editor or CLI). Use `http://lvh.me:3000` to exercise real
subdomain routing locally — e.g. a site with subdomain `mara` is served at
`http://mara.lvh.me:3000`.

## Deploying to Vercel

1. Create a Vercel project from this repo; set the env vars from
   `.env.example` (`NEXT_PUBLIC_ROOT_DOMAIN` = your apex domain, no protocol).
2. Add your apex domain **and** the wildcard `*.yourdomain.com` to the
   project; point DNS (`A`/`ALIAS` for apex, `CNAME *` for the wildcard) at
   Vercel.
3. In Supabase Auth settings, add `https://yourdomain.com/auth/callback` to
   the redirect allow-list (and enable the Google provider if wanted).

## Roadmap

- **Phase 2** — Stripe subscriptions (publish gated on active subscription),
  custom domains via the Vercel Domains API.
- **Phase 3** — per-site analytics, more templates, dynamic OG images and
  sitemaps, client-inquiry inbox, draft/publish snapshots.
