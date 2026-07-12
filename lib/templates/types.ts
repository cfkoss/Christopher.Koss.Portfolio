import type { ComponentType } from "react";
import type { PortfolioData } from "@/lib/portfolio/types";

/**
 * Props every template component receives.
 *
 * `basePath` is '' when the site is served from its subdomain and
 * `/s/{subdomain}` when served path-based (local dev, previews, owner
 * draft preview). Templates must build every internal link through it
 * and never hardcode absolute paths.
 */
export interface TemplateProps {
  data: PortfolioData;
  basePath: string;
}

export interface TemplateSectionProps extends TemplateProps {
  sectionSlug: string;
}

export interface TemplateProjectProps extends TemplateSectionProps {
  projectSlug: string;
}

/** The contract a template folder exports from its index.ts. */
export interface TemplateModule {
  /** Must match the `templates.slug` row in the database. */
  slug: string;
  name: string;
  description: string;
  /** Path under /public used on marketplace cards. */
  thumbnail: string;
  HomePage: ComponentType<TemplateProps>;
  SectionPage: ComponentType<TemplateSectionProps>;
  ProjectPage: ComponentType<TemplateProjectProps>;
  /** Fake-but-beautiful data that powers /preview/{slug}. */
  demoData: PortfolioData;
}
