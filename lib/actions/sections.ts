"use server";

import { z } from "zod";
import { slugify } from "@/lib/slug";
import { requireUser, requireOwnedSite, revalidateSite } from "./helpers";
import type { ActionResult } from "./sites";

async function requireOwnedSection(siteIdOf: {
  sectionId: string;
}): Promise<{
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"];
  section: { id: string; site_id: string; slug: string; sort_order: number };
  site: { id: string; subdomain: string };
}> {
  const { supabase, user } = await requireUser();
  const { data: section } = await supabase
    .from("sections")
    .select("id, site_id, slug, sort_order")
    .eq("id", siteIdOf.sectionId)
    .maybeSingle();
  if (!section) throw new Error("Section not found.");
  const site = await requireOwnedSite(supabase, user.id, section.site_id);
  return { supabase, section, site };
}

export async function createSection(
  siteId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const title = z
    .string()
    .trim()
    .min(1, "Section needs a title.")
    .max(60)
    .safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0].message };

  const { supabase, user } = await requireUser();
  const site = await requireOwnedSite(supabase, user.id, siteId);

  const baseSlug = slugify(title.data) || "section";
  const { data: existing } = await supabase
    .from("sections")
    .select("slug, sort_order")
    .eq("site_id", siteId);
  const slugs = new Set((existing ?? []).map((s) => s.slug));
  let slug = baseSlug;
  for (let i = 2; slugs.has(slug); i++) slug = `${baseSlug}-${i}`;
  const nextOrder =
    Math.max(-1, ...(existing ?? []).map((s) => s.sort_order)) + 1;

  const { error } = await supabase.from("sections").insert({
    site_id: siteId,
    slug,
    title: title.data,
    icon: "Briefcase",
    sort_order: nextOrder,
  });
  if (error) return { error: error.message };

  revalidateSite(siteId, site.subdomain);
  return {};
}

const updateSectionSchema = z.object({
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().max(200),
  icon: z.string().trim().max(40),
});

export async function updateSection(
  sectionId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateSectionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, section, site } = await requireOwnedSection({ sectionId });

  const { error } = await supabase
    .from("sections")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      icon: parsed.data.icon || null,
    })
    .eq("id", section.id);
  if (error) return { error: error.message };

  revalidateSite(site.id, site.subdomain);
  return {};
}

export async function setSectionCover(
  sectionId: string,
  storagePath: string | null,
): Promise<ActionResult> {
  const { supabase, section, site } = await requireOwnedSection({ sectionId });
  const { error } = await supabase
    .from("sections")
    .update({ cover_image_path: storagePath })
    .eq("id", section.id);
  if (error) return { error: error.message };
  revalidateSite(site.id, site.subdomain);
  return {};
}

export async function moveSection(
  sectionId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const { supabase, section, site } = await requireOwnedSection({ sectionId });

  const { data: siblings } = await supabase
    .from("sections")
    .select("id, sort_order")
    .eq("site_id", section.site_id)
    .order("sort_order");
  if (!siblings) return {};

  const index = siblings.findIndex((s) => s.id === section.id);
  const swapWith = direction === "up" ? siblings[index - 1] : siblings[index + 1];
  if (!swapWith) return {};

  await supabase
    .from("sections")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", section.id);
  await supabase
    .from("sections")
    .update({ sort_order: siblings[index].sort_order })
    .eq("id", swapWith.id);

  revalidateSite(site.id, site.subdomain);
  return {};
}

export async function deleteSection(sectionId: string): Promise<ActionResult> {
  const { supabase, section, site } = await requireOwnedSection({ sectionId });
  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", section.id);
  if (error) return { error: error.message };
  revalidateSite(site.id, site.subdomain);
  return {};
}
