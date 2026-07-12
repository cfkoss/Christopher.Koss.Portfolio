"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidSubdomain } from "@/lib/reserved-subdomains";
import { requireUser, requireOwnedSite, revalidateSite } from "./helpers";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function checkSubdomain(
  subdomain: string,
): Promise<{ available: boolean; reason?: string }> {
  const sub = subdomain.trim().toLowerCase();
  if (!isValidSubdomain(sub)) {
    return {
      available: false,
      reason: "Use 3–63 lowercase letters, numbers or hyphens.",
    };
  }
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("subdomain_available", {
    candidate: sub,
  });
  if (error) return { available: false, reason: "Could not check right now." };
  return data
    ? { available: true }
    : { available: false, reason: "Already taken." };
}

const createSiteSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().trim().min(1, "Give your site a name.").max(80),
  subdomain: z.string().trim().toLowerCase(),
});

const DEFAULT_SECTIONS = [
  {
    slug: "work",
    title: "Work",
    description: "Selected client and studio projects",
    icon: "Briefcase",
    sort_order: 0,
  },
  {
    slug: "experiments",
    title: "Experiments",
    description: "Personal explorations and studies",
    icon: "Sparkles",
    sort_order: 1,
  },
];

export async function createSite(input: {
  templateId: string;
  name: string;
  subdomain: string;
}): Promise<ActionResult> {
  const parsed = createSiteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { templateId, name, subdomain } = parsed.data;

  if (!isValidSubdomain(subdomain)) {
    return { error: "That subdomain is invalid or reserved." };
  }

  const { supabase, user } = await requireUser();

  const { data: site, error } = await supabase
    .from("sites")
    .insert({
      owner_id: user.id,
      template_id: templateId,
      subdomain,
      name,
      tagline: "A curated collection of selected works",
      hero_title: "Selected\nWorks",
    })
    .select("id")
    .single();

  if (error || !site) {
    if (error?.code === "23505") {
      return { error: "That subdomain was just taken — try another." };
    }
    return { error: error?.message ?? "Could not create the site." };
  }

  const { error: sectionsError } = await supabase.from("sections").insert(
    DEFAULT_SECTIONS.map((section) => ({ ...section, site_id: site.id })),
  );
  if (sectionsError) {
    console.error("Failed to seed sections:", sectionsError.message);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/sites/${site.id}`);
}

const updateSiteSchema = z.object({
  name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(200),
  heroTitle: z.string().trim().max(120),
  subdomain: z.string().trim().toLowerCase(),
});

export async function updateSiteSettings(
  siteId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateSiteSchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    heroTitle: formData.get("heroTitle"),
    subdomain: formData.get("subdomain"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, user } = await requireUser();
  const site = await requireOwnedSite(supabase, user.id, siteId);

  const { name, tagline, heroTitle, subdomain } = parsed.data;
  if (subdomain !== site.subdomain && !isValidSubdomain(subdomain)) {
    return { error: "That subdomain is invalid or reserved." };
  }

  const { error } = await supabase
    .from("sites")
    .update({
      name,
      tagline: tagline || null,
      hero_title: heroTitle || null,
      subdomain,
    })
    .eq("id", siteId);

  if (error) {
    if (error.code === "23505") return { error: "That subdomain is taken." };
    return { error: error.message };
  }

  // Old and new address both need a refresh when the subdomain changes.
  revalidateSite(siteId, site.subdomain);
  revalidateSite(siteId, subdomain);
  return { success: true };
}

export async function setSitePublished(
  siteId: string,
  publish: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const site = await requireOwnedSite(supabase, user.id, siteId);

  const { error } = await supabase
    .from("sites")
    .update({
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", siteId);
  if (error) return { error: error.message };

  revalidateSite(siteId, site.subdomain);
  return {};
}

export async function deleteSite(siteId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const site = await requireOwnedSite(supabase, user.id, siteId);

  const { error } = await supabase.from("sites").delete().eq("id", siteId);
  if (error) return { error: error.message };

  revalidateSite(siteId, site.subdomain);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
