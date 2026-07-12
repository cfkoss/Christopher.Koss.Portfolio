import { notFound } from "next/navigation";
import { resolveTenant, getTenantBasePath } from "@/lib/tenant";
import { getTemplate } from "@/lib/templates/registry";

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const tenant = await resolveTenant(site);
  if (!tenant) notFound();

  const template = getTemplate(tenant.site.templateSlug);
  if (!template) {
    console.error(
      `Site "${site}" references unknown template "${tenant.site.templateSlug}"`,
    );
    notFound();
  }

  const basePath = await getTenantBasePath(site);
  return <template.HomePage data={tenant.site.data} basePath={basePath} />;
}
