import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateSiteSettings, deleteSite } from "@/lib/actions/sites";
import { SiteSettingsForm } from "@/components/dashboard/SiteSettingsForm";
import { DeleteSiteButton } from "@/components/dashboard/DeleteSiteButton";

export const metadata: Metadata = { title: "Site settings" };

export default async function SiteSettingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("id, name, tagline, hero_title, subdomain")
    .eq("id", siteId)
    .maybeSingle();
  if (!site) notFound();

  return (
    <div className="space-y-16">
      <section>
        <h2 className="hero-title text-3xl mb-6">Settings</h2>
        <SiteSettingsForm
          action={updateSiteSettings.bind(null, site.id)}
          defaults={{
            name: site.name,
            tagline: site.tagline ?? "",
            heroTitle: site.hero_title ?? "",
            subdomain: site.subdomain,
          }}
        />
      </section>

      <section className="rounded-xl border border-red-500/25 p-6 max-w-lg">
        <h2 className="hero-title text-2xl mb-2 text-red-300">Danger zone</h2>
        <p className="body-text text-sm text-white/50 mb-5">
          Deleting a site removes all of its sections, projects and images.
          This cannot be undone.
        </p>
        <DeleteSiteButton
          siteName={site.name}
          action={deleteSite.bind(null, site.id)}
        />
      </section>
    </div>
  );
}
