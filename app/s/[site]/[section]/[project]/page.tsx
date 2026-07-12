import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveTenant, getTenantBasePath } from "@/lib/tenant";
import { getTemplate } from "@/lib/templates/registry";

interface Params {
  params: Promise<{ site: string; section: string; project: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { site, section, project } = await params;
  const tenant = await resolveTenant(site);
  const match = tenant?.site.data.sections
    .find((s) => s.slug === section)
    ?.projects.find((p) => p.slug === project);
  if (!match) return {};
  return {
    title: match.title,
    description: match.description ?? undefined,
    openGraph: match.coverImageUrl
      ? { images: [{ url: match.coverImageUrl }] }
      : undefined,
  };
}

export default async function TenantProjectPage({ params }: Params) {
  const { site, section, project } = await params;
  const tenant = await resolveTenant(site);
  if (!tenant) notFound();

  const template = getTemplate(tenant.site.templateSlug);
  if (!template) notFound();

  const basePath = await getTenantBasePath(site);
  return (
    <template.ProjectPage
      data={tenant.site.data}
      basePath={basePath}
      sectionSlug={section}
      projectSlug={project}
    />
  );
}
