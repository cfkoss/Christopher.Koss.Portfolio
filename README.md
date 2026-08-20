# Foliomarket — portfolio template marketplace

A multi-tenant platform where designers rent a portfolio template, add their
work through a simple dashboard, and publish a live portfolio site on their
own subdomain (custom domains in Phase 2).

**Stack:** Next.js (App Router) · Supabase (auth, Postgres + RLS, storage) · Netlify

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

## Deploying to Netlify

Build settings live in `netlify.toml`, so the site needs no manual build
configuration. Netlify's Next.js Runtime handles SSR, server actions, the
proxy and on-demand revalidation.

1. **Create the site** — Netlify → *Add new site* → *Import an existing
   project* → this repo. Accept the detected settings (`npm run build`,
   publish `.next`).
2. **Environment variables** — *Site configuration → Environment variables*.
   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `NEXT_PUBLIC_ROOT_DOMAIN` (apex domain only — no protocol, no trailing
   slash). Add `SUPABASE_SERVICE_ROLE_KEY` only once Phase 2 needs it, scoped
   to the production context. `NEXT_PUBLIC_*` values are inlined at build
   time, so changing one requires a redeploy, not just a restart.
3. **Domains** — *Domain management*: add the apex domain, then add
   `*.yourdomain.com` as a domain alias so every tenant subdomain resolves.
   The wildcard alias needs Netlify DNS (nameservers delegated to Netlify) so
   Netlify can issue the wildcard certificate, and it is a paid-plan feature.
   Until the wildcard is in place, published sites are still reachable at
   `https://yourdomain.com/s/{subdomain}`.
4. **Supabase Auth** — set *Site URL* to `https://yourdomain.com` and add
   `https://yourdomain.com/auth/callback` to the redirect allow-list (enable
   the Google provider if wanted).

Deploy previews (`deploy-preview-*.netlify.app`) don't match
`NEXT_PUBLIC_ROOT_DOMAIN`, so the proxy leaves them on the apex behaviour:
marketing and dashboard work, tenant sites are reachable via `/s/{subdomain}`.

**If tenant subdomains 404:** confirm `NEXT_PUBLIC_ROOT_DOMAIN` matches the
request host exactly (lowercase, no port in production), that the wildcard
alias is listed under the site's domains, and that its certificate has been
provisioned.

## Roadmap

- **Phase 2** — Stripe subscriptions (publish gated on active subscription),
  custom domains via the Netlify domains API.
- **Phase 3** — per-site analytics, more templates, dynamic OG images and
  sitemaps, client-inquiry inbox, draft/publish snapshots.
