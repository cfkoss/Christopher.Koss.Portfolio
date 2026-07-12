import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/templates/registry";

interface Params {
  params: Promise<{ templateSlug: string; view?: string[] }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { templateSlug } = await params;
  const template = getTemplate(templateSlug);
  if (!template) return {};
  return {
    title: `${template.name} — template preview`,
    robots: { index: false },
  };
}

/**
 * Fully navigable preview of a template rendered with its demo data.
 * /preview/{slug}            → home
 * /preview/{slug}/{section}  → section
 * /preview/{slug}/{section}/{project} → project
 */
export default async function TemplatePreviewPage({ params }: Params) {
  const { templateSlug, view = [] } = await params;
  const template = getTemplate(templateSlug);
  if (!template) notFound();

  const basePath = `/preview/${templateSlug}`;
  const data = template.demoData;

  if (view.length === 0) {
    return <template.HomePage data={data} basePath={basePath} />;
  }
  if (view.length === 1) {
    return (
      <template.SectionPage
        data={data}
        basePath={basePath}
        sectionSlug={view[0]}
      />
    );
  }
  if (view.length === 2) {
    return (
      <template.ProjectPage
        data={data}
        basePath={basePath}
        sectionSlug={view[0]}
        projectSlug={view[1]}
      />
    );
  }
  notFound();
}
