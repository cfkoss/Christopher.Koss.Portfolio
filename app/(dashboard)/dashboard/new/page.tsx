import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates/registry";
import {
  NewSiteWizard,
  type WizardTemplate,
} from "@/components/dashboard/NewSiteWizard";

export const metadata: Metadata = { title: "New site" };

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: preselectedSlug } = await searchParams;
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("id, slug, name, description, price_monthly_cents")
    .eq("status", "published")
    .order("created_at");

  const wizardTemplates: WizardTemplate[] = (templates ?? [])
    // Only offer templates whose renderer actually ships in this build.
    .filter((t) => getTemplate(t.slug))
    .map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      priceMonthlyCents: t.price_monthly_cents,
      thumbnail: getTemplate(t.slug)?.thumbnail ?? null,
    }));

  return (
    <div>
      <h1 className="hero-title text-5xl mb-10">Create a site</h1>
      <NewSiteWizard
        templates={wizardTemplates}
        initialTemplateId={
          wizardTemplates.find((t) => t.slug === preselectedSlug)?.id ?? null
        }
      />
    </div>
  );
}
