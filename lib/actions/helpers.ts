import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { siteCacheTag } from "@/lib/tenant";

export async function requireUser(): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/**
 * Load a site the current user owns, or bail. RLS already scopes every
 * query, but actions verify explicitly so a bad id fails loudly instead
 * of silently writing nothing.
 */
export async function requireOwnedSite(
  supabase: SupabaseClient,
  userId: string,
  siteId: string,
): Promise<{ id: string; subdomain: string }> {
  const { data } = await supabase
    .from("sites")
    .select("id, subdomain, owner_id")
    .eq("id", siteId)
    .maybeSingle();
  if (!data || data.owner_id !== userId) {
    throw new Error("Site not found.");
  }
  return { id: data.id, subdomain: data.subdomain };
}

/** Refresh the published render cache + the dashboard views of a site. */
export function revalidateSite(siteId: string, subdomain: string) {
  updateTag(siteCacheTag(subdomain));
  revalidatePath(`/dashboard/sites/${siteId}`, "layout");
  revalidatePath(`/s/${subdomain}`, "layout");
}
