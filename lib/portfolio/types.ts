/**
 * The portfolio data contract.
 *
 * Every template in `templates/` is a pure function of this shape.
 * `lib/tenant.ts` assembles it from the database for published sites;
 * each template ships `demo-data.ts` in the same shape for previews.
 */

export interface PortfolioData {
  site: {
    /** Brand shown in the nav, e.g. "Christopher Koss" */
    name: string;
    /** Hero subtitle, e.g. "A curated collection of…" */
    tagline: string | null;
    /** Big hero heading, e.g. "Selected Works" */
    heroTitle: string | null;
    /** Template-specific knobs (accent color, footer text, …) */
    settings: Record<string, unknown>;
  };
  sections: PortfolioSection[];
}

export interface PortfolioSection {
  id: string;
  /** URL segment, unique per site, e.g. "architecture" */
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  /** Lucide icon name, e.g. "Briefcase" */
  icon: string | null;
  projects: PortfolioProject[];
}

export interface PortfolioProject {
  id: string;
  /** URL segment, unique per section */
  slug: string;
  title: string;
  /** Short blurb shown on cards */
  description: string | null;
  /** Long-form body text */
  body: string | null;
  coverImageUrl: string | null;
  galleryImages: PortfolioImage[];
  tags: string[];
}

export interface PortfolioImage {
  url: string;
  alt: string | null;
}
