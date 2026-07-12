import { cache } from "react";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { assetUrl } from "@/lib/assets";
import type {
  PortfolioData,
  PortfolioImage,
  PortfolioSection,
} from "@/lib/portfolio/types";

export interface TenantSite {
  id: string;
  subdomain: string;
  templateSlug: string;
  isPublished: boolean;
  data: PortfolioData;
}

export function siteCacheTag(subdomain: string) {
  return `site:${subdomain.toLowerCase()}`;
}

interface SiteRow {
  id: string;
  subdomain: string;
  name: string;
  tagline: string | null;
  hero_title: string | null;
  settings: Record<string, unknown>;
  is_published: boolean;
  templates: { slug: string } | null;
  sections: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    cover_image_path: string | null;
    icon: string | null;
    sort_order: number;
    projects: Array<{
      id: string;
      slug: string;
      title: string;
      description: string | null;
      body: string | null;
      cover_image_path: string | null;
      tags: string[];
      sort_order: number;
      project_images: Array<{
        storage_path: string;
        alt: string | null;
        sort_order: number;
      }>;
    }>;
  }>;
}

const SITE_SELECT = `
  id, subdomain, name, tagline, hero_title, settings, is_published,
  templates ( slug ),
  sections (
    id, slug, title, description, cover_image_path, icon, sort_order,
    projects (
      id, slug, title, description, body, cover_image_path, tags, sort_order,
      project_images ( storage_path, alt, sort_order )
    )
  )
`;

async function fetchSite(
  client: SupabaseClient,
  subdomain: string,
): Promise<TenantSite | null> {
  const { data, error } = await client
    .from("sites")
    .select(SITE_SELECT)
    .eq("subdomain", subdomain.toLowerCase())
    .maybeSingle<SiteRow>();

  if (error) {
    console.error(`Failed to load site "${subdomain}":`, error.message);
    return null;
  }
  if (!data || !data.templates) return null;

  const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
    a.sort_order - b.sort_order;

  const sections: PortfolioSection[] = [...data.sections]
    .sort(bySortOrder)
    .map((section) => ({
      id: section.id,
      slug: section.slug,
      title: section.title,
      description: section.description,
      coverImageUrl: assetUrl(section.cover_image_path),
      icon: section.icon,
      projects: [...section.projects].sort(bySortOrder).map((project) => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        body: project.body,
        coverImageUrl: assetUrl(project.cover_image_path),
        galleryImages: [...project.project_images]
          .sort(bySortOrder)
          .map(
            (img): PortfolioImage => ({
              url: assetUrl(img.storage_path)!,
              alt: img.alt,
            }),
          ),
        tags: project.tags ?? [],
      })),
    }));

  return {
    id: data.id,
    subdomain: data.subdomain,
    templateSlug: data.templates.slug,
    isPublished: data.is_published,
    data: {
      site: {
        name: data.name,
        tagline: data.tagline,
        heroTitle: data.hero_title,
        settings: data.settings ?? {},
      },
      sections,
    },
  };
}

/**
 * Published-site loader: anonymous client (RLS hides unpublished sites),
 * cached in the data cache and tagged so publish/save actions can
 * revalidate exactly one site.
 */
function getPublishedSite(subdomain: string): Promise<TenantSite | null> {
  return unstable_cache(
    () => fetchSite(createAnonClient(), subdomain),
    ["tenant-site", subdomain.toLowerCase()],
    { tags: [siteCacheTag(subdomain)] },
  )();
}

export interface ResolvedTenant {
  site: TenantSite;
  /** True when an owner is viewing their not-yet-published site. */
  isDraftPreview: boolean;
}

/**
 * Resolve a tenant for rendering. Tries the cached anonymous path first —
 * the hot path for all published traffic. Only if that misses (site is
 * unpublished or nonexistent) do we consult cookies to allow the owner a
 * draft preview.
 *
 * Wrapped in React.cache so layout + page share one lookup per request.
 */
export const resolveTenant = cache(
  async (subdomain: string): Promise<ResolvedTenant | null> => {
    const published = await getPublishedSite(subdomain);
    if (published) return { site: published, isDraftPreview: false };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // RLS: owners can read their own unpublished site.
    const owned = await fetchSite(supabase, subdomain);
    if (!owned) return null;
    return { site: owned, isDraftPreview: !owned.isPublished };
  },
);

/**
 * '' when the request arrived via a tenant subdomain (the proxy stamps
 * x-tenant-subdomain), '/s/{sub}' for path-based access (local dev,
 * owner draft preview from the dashboard).
 */
export async function getTenantBasePath(subdomain: string): Promise<string> {
  const h = await headers();
  return h.get("x-tenant-subdomain") ? "" : `/s/${subdomain}`;
}
