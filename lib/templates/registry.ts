import type { TemplateModule } from "./types";
import template01 from "@/templates/template-01";

/**
 * Template catalog: slug → renderer module.
 * Every key must have a matching row in the `templates` table
 * (see supabase/seed.sql) — that row carries pricing/catalog metadata,
 * this registry carries the code.
 */
export const templateRegistry: Record<string, TemplateModule> = {
  [template01.slug]: template01,
};

export function getTemplate(slug: string): TemplateModule | null {
  return templateRegistry[slug] ?? null;
}
