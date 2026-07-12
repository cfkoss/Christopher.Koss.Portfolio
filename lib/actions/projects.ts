"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { slugify } from "@/lib/slug";
import { requireUser, requireOwnedSite, revalidateSite } from "./helpers";
import type { ActionResult } from "./sites";

async function requireOwnedProject(projectId: string) {
  const { supabase, user } = await requireUser();
  const { data: project } = await supabase
    .from("projects")
    .select("id, site_id, section_id, slug, sort_order, cover_image_path")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) throw new Error("Project not found.");
  const site = await requireOwnedSite(supabase, user.id, project.site_id);
  return { supabase, project, site };
}

export async function createProject(
  sectionId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const title = z
    .string()
    .trim()
    .min(1, "Project needs a title.")
    .max(120)
    .safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0].message };

  const { supabase, user } = await requireUser();
  const { data: section } = await supabase
    .from("sections")
    .select("id, site_id")
    .eq("id", sectionId)
    .maybeSingle();
  if (!section) return { error: "Section not found." };
  const site = await requireOwnedSite(supabase, user.id, section.site_id);

  const baseSlug = slugify(title.data) || "project";
  const { data: existing } = await supabase
    .from("projects")
    .select("slug, sort_order")
    .eq("section_id", sectionId);
  const slugs = new Set((existing ?? []).map((p) => p.slug));
  let slug = baseSlug;
  for (let i = 2; slugs.has(slug); i++) slug = `${baseSlug}-${i}`;
  const nextOrder =
    Math.max(-1, ...(existing ?? []).map((p) => p.sort_order)) + 1;

  const { data: created, error } = await supabase
    .from("projects")
    .insert({
      site_id: section.site_id,
      section_id: sectionId,
      slug,
      title: title.data,
      sort_order: nextOrder,
    })
    .select("id")
    .single();
  if (error || !created) {
    return { error: error?.message ?? "Could not create the project." };
  }

  revalidateSite(site.id, site.subdomain);
  redirect(`/dashboard/sites/${site.id}/projects/${created.id}`);
}

const updateProjectSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(300),
  body: z.string().trim().max(20000),
  tags: z.string().trim().max(500),
});

export async function updateProject(
  projectId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateProjectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    body: formData.get("body"),
    tags: formData.get("tags"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, project, site } = await requireOwnedProject(projectId);

  const tags = parsed.data.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

  const { error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      body: parsed.data.body || null,
      tags,
    })
    .eq("id", project.id);
  if (error) return { error: error.message };

  revalidateSite(site.id, site.subdomain);
  return {};
}

export async function moveProject(
  projectId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const { supabase, project, site } = await requireOwnedProject(projectId);

  const { data: siblings } = await supabase
    .from("projects")
    .select("id, sort_order")
    .eq("section_id", project.section_id)
    .order("sort_order");
  if (!siblings) return {};

  const index = siblings.findIndex((p) => p.id === project.id);
  const swapWith = direction === "up" ? siblings[index - 1] : siblings[index + 1];
  if (!swapWith) return {};

  await supabase
    .from("projects")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", project.id);
  await supabase
    .from("projects")
    .update({ sort_order: siblings[index].sort_order })
    .eq("id", swapWith.id);

  revalidateSite(site.id, site.subdomain);
  return {};
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const { supabase, project, site } = await requireOwnedProject(projectId);
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id);
  if (error) return { error: error.message };
  revalidateSite(site.id, site.subdomain);
  redirect(`/dashboard/sites/${site.id}/sections/${project.section_id}`);
}

/** Register an image the browser already uploaded to storage. */
export async function addProjectImage(
  projectId: string,
  storagePath: string,
): Promise<ActionResult> {
  const { supabase, project, site } = await requireOwnedProject(projectId);

  if (!storagePath.startsWith(`${site.id}/`)) {
    return { error: "Invalid storage path." };
  }

  const { data: existing } = await supabase
    .from("project_images")
    .select("sort_order")
    .eq("project_id", project.id);
  const nextOrder =
    Math.max(-1, ...(existing ?? []).map((i) => i.sort_order)) + 1;

  const { error } = await supabase.from("project_images").insert({
    site_id: site.id,
    project_id: project.id,
    storage_path: storagePath,
    sort_order: nextOrder,
  });
  if (error) return { error: error.message };

  // First uploaded image becomes the cover automatically.
  if (!project.cover_image_path) {
    await supabase
      .from("projects")
      .update({ cover_image_path: storagePath })
      .eq("id", project.id);
  }

  revalidateSite(site.id, site.subdomain);
  return {};
}

export async function deleteProjectImage(
  imageId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { data: image } = await supabase
    .from("project_images")
    .select("id, site_id, project_id, storage_path")
    .eq("id", imageId)
    .maybeSingle();
  if (!image) return { error: "Image not found." };
  const site = await requireOwnedSite(supabase, user.id, image.site_id);

  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", image.id);
  if (error) return { error: error.message };

  // Clear the cover if it pointed at this file, then remove the object.
  await supabase
    .from("projects")
    .update({ cover_image_path: null })
    .eq("id", image.project_id)
    .eq("cover_image_path", image.storage_path);
  await supabase.storage.from("site-assets").remove([image.storage_path]);

  revalidateSite(site.id, site.subdomain);
  return {};
}

export async function setProjectCover(
  projectId: string,
  storagePath: string,
): Promise<ActionResult> {
  const { supabase, project, site } = await requireOwnedProject(projectId);
  if (!storagePath.startsWith(`${site.id}/`)) {
    return { error: "Invalid storage path." };
  }
  const { error } = await supabase
    .from("projects")
    .update({ cover_image_path: storagePath })
    .eq("id", project.id);
  if (error) return { error: error.message };
  revalidateSite(site.id, site.subdomain);
  return {};
}
