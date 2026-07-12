/** Public URL for an object in the site-assets bucket. Safe on client + server. */
export function assetUrl(path: string | null): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-assets/${path}`;
}
