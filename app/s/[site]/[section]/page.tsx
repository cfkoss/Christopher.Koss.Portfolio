import { notFound } from "next/navigation";
import { resolveTenant, getTenantBasePath } from "@/lib/tenant";
import { getTemplate } from "@/lib/templates/registry";

export default async function TenantSectionPage({
  params,
}: {
  params: Promise<{ site: string; section: string }>;
}) {
  const { site, section } = await params;
  const tenant = await resolveTenant(site);
  if (!tenant) notFound();

  const template = getTemplate(tenant.site.templateSlug);
  if (!template) notFound();

  const basePath = await getTenantBasePath(site);
  return (
    <template.SectionPage
      data={tenant.site.data}
      basePath={basePath}
      sectionSlug={section}
    />
  );
}
