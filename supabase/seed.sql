-- Catalog seed: template-01 must match lib/templates/registry.ts
insert into public.templates (slug, name, description, price_monthly_cents, status)
values (
  'template-01',
  'Noir Editorial',
  'A cinematic dark portfolio with serif display type, circular project cards, glass-effect hero panels and immersive full-bleed galleries. Built for architects, designers and multidisciplinary creatives.',
  900,
  'published'
)
on conflict (slug) do nothing;
